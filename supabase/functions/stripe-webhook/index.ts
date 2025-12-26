import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
    apiVersion: "2025-08-27.basil" 
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // For now, we'll skip signature verification if no webhook secret is set
    // In production, you should set STRIPE_WEBHOOK_SECRET
    let event: Stripe.Event;
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err });
        return new Response(JSON.stringify({ error: "Invalid signature" }), { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } else {
      // Parse without verification for development
      event = JSON.parse(body);
      logStep("Processing webhook without signature verification (dev mode)");
    }

    logStep("Received webhook event", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          customerEmail: session.customer_email 
        });

        // Get user from email
        const email = session.customer_email || session.customer_details?.email;
        if (!email) {
          logStep("No email found in session");
          break;
        }

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, referred_by')
          .eq('email', email)
          .single();

        if (!profile) {
          logStep("No profile found for email", { email });
          break;
        }

        // Update or create membership
        const { data: existingMembership } = await supabaseAdmin
          .from('memberships')
          .select('id')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (existingMembership) {
          await supabaseAdmin
            .from('memberships')
            .update({
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              current_period_start: new Date().toISOString(),
            })
            .eq('id', existingMembership.id);
          logStep("Membership updated to active", { membershipId: existingMembership.id });
        } else {
          await supabaseAdmin
            .from('memberships')
            .insert({
              user_id: profile.id,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              current_period_start: new Date().toISOString(),
            });
          logStep("New membership created", { userId: profile.id });
        }

        // Trigger matrix placement and commission calculation
        const processUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-new-member`;
        const processResponse = await fetch(processUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            user_id: profile.id,
            sponsor_id: profile.referred_by,
          }),
        });

        const processResult = await processResponse.json();
        logStep("Matrix processing result", processResult);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { 
          invoiceId: invoice.id, 
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid 
        });

        // This is a renewal - update membership period
        const customerId = invoice.customer as string;
        
        const { data: membership } = await supabaseAdmin
          .from('memberships')
          .select('id, user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (membership) {
          await supabaseAdmin
            .from('memberships')
            .update({
              status: 'active',
              current_period_start: new Date().toISOString(),
            })
            .eq('id', membership.id);
          logStep("Membership renewed", { membershipId: membership.id });

          // For renewals, we can also trigger level bonuses here
          // Get the user's sponsor chain and create level bonus commissions
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('referred_by')
            .eq('id', membership.user_id)
            .single();

          if (profile?.referred_by) {
            // Create a level bonus for the sponsor on renewal
            await supabaseAdmin.from('commission_events').insert({
              user_id: profile.referred_by,
              amount: 5, // Monthly level bonus
              commission_type: 'level_bonus',
              level: 1,
              source_user_id: membership.user_id,
              description: 'Monthly Level Bonus - Renewal',
              status: 'pending',
            });
            logStep("Level bonus created for renewal");
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { invoiceId: invoice.id, customerId: invoice.customer });

        const customerId = invoice.customer as string;
        
        await supabaseAdmin
          .from('memberships')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', customerId);
        
        logStep("Membership set to past_due");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id, customerId: subscription.customer });

        const customerId = subscription.customer as string;
        
        await supabaseAdmin
          .from('memberships')
          .update({ 
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);
        
        logStep("Membership canceled");
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
