import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_HOUSEHOLD_ADDON = "price_1SielF2MG3Cvt2BWhEuLLizU";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-HOUSEHOLD-MEMBER] ${step}${detailsStr}`);
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
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { name, email } = await req.json();
    if (!name) throw new Error("Member name is required");
    logStep("Request parsed", { name, email });

    // Get membership
    const { data: membership, error: membershipError } = await supabaseClient
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      throw new Error("Membership not found");
    }

    if (membership.status !== 'active') {
      throw new Error("Membership must be active to add household members");
    }

    logStep("Membership found", { membershipId: membership.id, stripeSubscriptionId: membership.stripe_subscription_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Update Stripe subscription to add another household add-on
    if (membership.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(membership.stripe_subscription_id);
      
      // Find existing add-on item
      const addonItem = subscription.items.data.find(
        (item: Stripe.SubscriptionItem) => item.price.id === PRICE_HOUSEHOLD_ADDON
      );

      if (addonItem) {
        // Increment quantity
        await stripe.subscriptionItems.update(addonItem.id, {
          quantity: (addonItem.quantity || 0) + 1,
        });
        logStep("Updated add-on quantity", { newQuantity: (addonItem.quantity || 0) + 1 });
      } else {
        // Add new add-on item
        await stripe.subscriptionItems.create({
          subscription: membership.stripe_subscription_id,
          price: PRICE_HOUSEHOLD_ADDON,
          quantity: 1,
        });
        logStep("Added new add-on item");
      }
    }

    // Add household member to database
    const { data: newMember, error: insertError } = await supabaseClient
      .from('household_members')
      .insert({
        membership_id: membership.id,
        name,
        email: email || null,
        is_primary: false,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to add household member: ${insertError.message}`);
    }

    // Update addon amount
    await supabaseClient
      .from('memberships')
      .update({ addon_amount: (membership.addon_amount || 0) + 25 })
      .eq('id', membership.id);

    logStep("Household member added", { memberId: newMember.id });

    return new Response(JSON.stringify({ 
      success: true, 
      member: newMember 
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
