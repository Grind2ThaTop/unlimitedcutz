import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    const { method, method_details, amount } = await req.json();
    logStep("Payout request received", { method, amount });

    // Validate method
    if (!['cashapp', 'paypal'].includes(method)) {
      throw new Error("Invalid payout method. Use 'cashapp' or 'paypal'");
    }

    // Get compensation settings for minimum payout
    const { data: settings } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'compensation_settings')
      .single();

    const minimumPayout = settings?.value?.minimum_payout || 50;

    // Calculate available balance (pending commissions)
    const { data: pendingCommissions } = await supabaseAdmin
      .from('commission_events')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    const availableBalance = pendingCommissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    logStep("Available balance", { availableBalance, minimumPayout });

    // Validate amount
    const requestedAmount = amount || availableBalance;

    if (requestedAmount < minimumPayout) {
      throw new Error(`Minimum payout is $${minimumPayout}. Your available balance is $${availableBalance.toFixed(2)}`);
    }

    if (requestedAmount > availableBalance) {
      throw new Error(`Requested amount ($${requestedAmount}) exceeds available balance ($${availableBalance.toFixed(2)})`);
    }

    // Check for pending payout requests
    const { data: pendingRequests } = await supabaseAdmin
      .from('payout_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (pendingRequests && pendingRequests.length > 0) {
      throw new Error("You already have a pending payout request. Please wait for it to be processed.");
    }

    // Create payout request
    const { data: payoutRequest, error: payoutError } = await supabaseAdmin
      .from('payout_requests')
      .insert({
        user_id: user.id,
        amount: requestedAmount,
        method,
        method_details: method_details || null,
        status: 'pending',
      })
      .select()
      .single();

    if (payoutError) throw payoutError;

    logStep("Payout request created", { payoutId: payoutRequest.id, amount: requestedAmount });

    return new Response(JSON.stringify({ 
      success: true, 
      payout_request_id: payoutRequest.id,
      amount: requestedAmount,
      message: `Payout request for $${requestedAmount.toFixed(2)} submitted successfully`
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
