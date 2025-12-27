import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GHL_BASE_URL = "https://rest.gohighlevel.com/v1";

// GHL API Request Helper
async function ghlRequest(method: string, path: string, body?: any) {
  const apiKey = Deno.env.get("GHL_API_KEY");
  
  if (!apiKey) {
    throw new Error("GHL_API_KEY is not configured");
  }

  console.log(`[GHL-CORE] ${method} ${path}`);
  
  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error(`[GHL-CORE] Error response:`, data);
    throw new Error(data.message || `GHL API error: ${response.status}`);
  }

  console.log(`[GHL-CORE] Success:`, JSON.stringify(data).slice(0, 200));
  return data;
}

// ==================== CONTACTS SERVICE ====================

async function upsertContact(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  country?: string;
  customField?: Record<string, any>;
  [key: string]: any;
}) {
  return ghlRequest("POST", "/contacts/upsert", input);
}

async function getContactById(id: string) {
  return ghlRequest("GET", `/contacts/${id}`);
}

async function createContact(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  [key: string]: any;
}) {
  return ghlRequest("POST", "/contacts/", input);
}

// ==================== OPPORTUNITIES SERVICE ====================

async function createOpportunity(input: {
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  name: string;
  monetaryValue?: number;
  status?: "open" | "won" | "lost";
  [key: string]: any;
}) {
  return ghlRequest("POST", "/opportunities/", input);
}

async function getOpportunity(id: string) {
  return ghlRequest("GET", `/opportunities/${id}`);
}

async function upsertOpportunity(input: {
  id?: string;
  contactId?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  name?: string;
  monetaryValue?: number;
  status?: "open" | "won" | "lost";
  [key: string]: any;
}) {
  return ghlRequest("POST", "/opportunities/upsert", input);
}

async function updateOpportunity(id: string, input: {
  pipelineStageId?: string;
  name?: string;
  monetaryValue?: number;
  status?: "open" | "won" | "lost";
  [key: string]: any;
}) {
  return ghlRequest("PUT", `/opportunities/${id}`, input);
}

// ==================== CALENDAR / APPOINTMENTS SERVICE ====================

async function createAppointment(input: {
  contactId: string;
  calendarId: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
  title?: string;
  notes?: string;
  timezone?: string;
  [key: string]: any;
}) {
  return ghlRequest("POST", "/calendars/events/appointments", input);
}

async function getAppointment(id: string) {
  return ghlRequest("GET", `/calendars/events/appointments/${id}`);
}

async function getCalendarEvents(calendarId: string, startTime?: string, endTime?: string) {
  let path = `/calendars/${calendarId}/events`;
  const params = new URLSearchParams();
  if (startTime) params.append("startTime", startTime);
  if (endTime) params.append("endTime", endTime);
  if (params.toString()) path += `?${params.toString()}`;
  return ghlRequest("GET", path);
}

// ==================== MAIN HANDLER ====================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing 'action' query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body = {};
    if (req.method === "POST" || req.method === "PUT") {
      body = await req.json();
    }

    console.log(`[GHL-CORE] Action: ${action}, Body:`, JSON.stringify(body).slice(0, 500));

    let result;

    switch (action) {
      // Contacts
      case "upsertContact":
        result = await upsertContact(body as any);
        break;
      case "getContact":
        result = await getContactById((body as any).id);
        break;
      case "createContact":
        result = await createContact(body as any);
        break;

      // Opportunities
      case "createOpportunity":
        result = await createOpportunity(body as any);
        break;
      case "getOpportunity":
        result = await getOpportunity((body as any).id);
        break;
      case "upsertOpportunity":
        result = await upsertOpportunity(body as any);
        break;
      case "updateOpportunity":
        const { id: oppId, ...oppData } = body as any;
        result = await updateOpportunity(oppId, oppData);
        break;

      // Appointments
      case "createAppointment":
        result = await createAppointment(body as any);
        break;
      case "getAppointment":
        result = await getAppointment((body as any).id);
        break;
      case "getCalendarEvents":
        const { calendarId, startTime, endTime } = body as any;
        result = await getCalendarEvents(calendarId, startTime, endTime);
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[GHL-CORE] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
