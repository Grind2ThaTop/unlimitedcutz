import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event = await req.json();
    
    console.log("[GHL-WEBHOOK] Received event:", JSON.stringify(event, null, 2));

    // Extract event type - GHL sends different event structures
    const eventType = event.type || event.event || event.eventType || "unknown";
    
    console.log(`[GHL-WEBHOOK] Event type: ${eventType}`);

    // Initialize Supabase client for potential data sync
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (eventType) {
      case "ContactCreate":
      case "contact.create":
        console.log("[GHL-WEBHOOK] New contact created in GHL:", event.contact || event.data);
        // Future: sync contact back to Supabase if needed
        break;

      case "ContactUpdate":
      case "contact.update":
        console.log("[GHL-WEBHOOK] Contact updated in GHL:", event.contact || event.data);
        break;

      case "OpportunityCreate":
      case "opportunity.create":
        console.log("[GHL-WEBHOOK] New opportunity created:", event.opportunity || event.data);
        break;

      case "OpportunityUpdate":
      case "opportunity.update":
      case "OpportunityStageUpdate":
        console.log("[GHL-WEBHOOK] Opportunity updated:", event.opportunity || event.data);
        break;

      case "AppointmentCreate":
      case "appointment.create":
        console.log("[GHL-WEBHOOK] Appointment booked:", event.appointment || event.data);
        break;

      case "AppointmentUpdate":
      case "appointment.update":
        console.log("[GHL-WEBHOOK] Appointment updated:", event.appointment || event.data);
        break;

      case "AppointmentDelete":
      case "appointment.delete":
        console.log("[GHL-WEBHOOK] Appointment cancelled:", event.appointment || event.data);
        break;

      default:
        console.log(`[GHL-WEBHOOK] Unhandled event type: ${eventType}`);
    }

    // Always acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, eventType }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[GHL-WEBHOOK] Error processing webhook:", error);
    
    // Still return 200 to prevent GHL from retrying
    return new Response(
      JSON.stringify({ received: true, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
