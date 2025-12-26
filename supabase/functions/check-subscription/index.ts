import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      
      // Update membership status to pending
      await supabaseClient
        .from('memberships')
        .update({ status: 'pending' })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        subscribed: false,
        status: 'pending'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    const activeSub = subscriptions.data.find((s: Stripe.Subscription) => s.status === 'active');
    const pastDueSub = subscriptions.data.find((s: Stripe.Subscription) => s.status === 'past_due');
    
    let status = 'pending';
    let subscriptionEnd = null;
    let baseAmount = 50;
    let addonAmount = 0;

    if (activeSub) {
      status = 'active';
      subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
      
      // Calculate amounts from subscription items
      for (const item of activeSub.items.data) {
        const amount = (item.price.unit_amount || 0) / 100 * (item.quantity || 1);
        if (item.price.id === "price_1SielF2MG3Cvt2BWhEuLLizU") {
          addonAmount = amount;
        } else {
          baseAmount = amount;
        }
      }

      logStep("Active subscription found", { 
        subscriptionId: activeSub.id, 
        endDate: subscriptionEnd,
        baseAmount,
        addonAmount
      });
    } else if (pastDueSub) {
      status = 'past_due';
      subscriptionEnd = new Date(pastDueSub.current_period_end * 1000).toISOString();
      logStep("Past due subscription found");
    } else {
      logStep("No active subscription found");
    }

    // Update membership in database
    const { error: updateError } = await supabaseClient
      .from('memberships')
      .update({ 
        status,
        stripe_customer_id: customerId,
        stripe_subscription_id: activeSub?.id || pastDueSub?.id || null,
        current_period_end: subscriptionEnd,
        current_period_start: activeSub 
          ? new Date(activeSub.current_period_start * 1000).toISOString() 
          : null,
        base_amount: baseAmount,
        addon_amount: addonAmount,
      })
      .eq('user_id', user.id);

    if (updateError) {
      logStep("Error updating membership", { error: updateError });
    }

    return new Response(JSON.stringify({
      subscribed: status === 'active',
      status,
      subscription_end: subscriptionEnd,
      base_amount: baseAmount,
      addon_amount: addonAmount,
      customer_id: customerId,
    }), {
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
