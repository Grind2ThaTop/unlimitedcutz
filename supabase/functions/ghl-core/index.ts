import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GoHighLevel API v2 - Correct base URL and required headers
const GHL_BASE_URL = "https://services.leadconnectorhq.com";

// ==================== TOKEN HELPERS ====================

// Normalize token - fix common paste mistakes
function normalizeToken(token: string): string {
  let normalized = token.trim();
  
  // Remove "Bearer " prefix if user pasted it
  if (normalized.toLowerCase().startsWith("bearer ")) {
    normalized = normalized.slice(7);
  }
  
  // Remove surrounding quotes if present
  if ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1);
  }
  
  // Remove newlines/carriage returns
  normalized = normalized.replace(/[\r\n]/g, "");
  
  return normalized;
}

// Get safe token diagnostics (no secret exposure)
function getTokenDiagnostics(rawToken: string): {
  length: number;
  hasWhitespace: boolean;
  hasBearerPrefix: boolean;
  hasQuotes: boolean;
  hasNewlines: boolean;
  isJwtShaped: boolean;
  jwtInfo?: {
    expiresIn?: string;
    isExpired?: boolean;
    issuer?: string;
  };
} {
  const hasWhitespace = rawToken !== rawToken.trim();
  const hasBearerPrefix = rawToken.toLowerCase().startsWith("bearer ");
  const hasQuotes = (rawToken.startsWith('"') || rawToken.startsWith("'"));
  const hasNewlines = /[\r\n]/.test(rawToken);
  
  // Check if JWT shaped (3 dot-separated parts)
  const normalized = normalizeToken(rawToken);
  const parts = normalized.split(".");
  const isJwtShaped = parts.length === 3;
  
  let jwtInfo: { expiresIn?: string; isExpired?: boolean; issuer?: string } | undefined;
  
  if (isJwtShaped) {
    try {
      // Base64 decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        const isExpired = expDate < now;
        const diff = expDate.getTime() - now.getTime();
        
        if (isExpired) {
          jwtInfo = { isExpired: true, expiresIn: `Expired ${Math.abs(Math.floor(diff / 60000))} min ago` };
        } else {
          const mins = Math.floor(diff / 60000);
          jwtInfo = { isExpired: false, expiresIn: mins > 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins}m` };
        }
      }
      
      if (payload.iss) {
        jwtInfo = { ...jwtInfo, issuer: payload.iss };
      }
    } catch {
      // Not a valid JWT payload, that's fine
    }
  }
  
  return {
    length: normalized.length,
    hasWhitespace,
    hasBearerPrefix,
    hasQuotes,
    hasNewlines,
    isJwtShaped,
    jwtInfo,
  };
}

// Build diagnostic message for failed connections
function buildDiagnosticMessage(diagnostics: ReturnType<typeof getTokenDiagnostics>): string[] {
  const issues: string[] = [];
  
  if (diagnostics.hasBearerPrefix) {
    issues.push("Token includes 'Bearer ' prefix - remove it");
  }
  if (diagnostics.hasWhitespace) {
    issues.push("Token has leading/trailing whitespace");
  }
  if (diagnostics.hasQuotes) {
    issues.push("Token wrapped in quotes - remove them");
  }
  if (diagnostics.hasNewlines) {
    issues.push("Token contains newlines");
  }
  if (diagnostics.jwtInfo?.isExpired) {
    issues.push(`Token expired: ${diagnostics.jwtInfo.expiresIn}`);
  }
  if (diagnostics.isJwtShaped && !diagnostics.jwtInfo?.issuer) {
    issues.push("Token is JWT-shaped but may be an OAuth access token (not a Private Integration token)");
  }
  if (!diagnostics.isJwtShaped && diagnostics.length < 50) {
    issues.push("Token seems too short - ensure you copied the full token");
  }
  
  return issues;
}

// ==================== GHL API REQUEST HELPER ====================

async function ghlRequest(method: string, path: string, body?: any) {
  const rawApiKey = Deno.env.get("GHL_API_Sub_Account_Key");
  
  if (!rawApiKey) {
    throw new Error("GHL_API_Sub_Account_Key is not configured");
  }

  const apiKey = normalizeToken(rawApiKey);
  
  console.log(`[GHL-CORE] ${method} ${path}`);
  
  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Version": "2021-07-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error(`[GHL-CORE] Error response:`, data);
    throw new Error(data.message || data.error || `GHL API error: ${response.status}`);
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
  locationId?: string;
  [key: string]: any;
}) {
  const locationId = input.locationId || Deno.env.get("GHL_LOCATION_ID");
  if (!locationId) {
    throw new Error("GHL_LOCATION_ID is required for contact operations");
  }
  return ghlRequest("POST", "/contacts/upsert", { ...input, locationId });
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
  startTime: string;
  endTime: string;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let action = url.searchParams.get("action");
    let body: any = {};

    if (req.method === "POST" || req.method === "PUT") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    if (!action && body.action) {
      action = body.action;
    }

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing 'action' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[GHL-CORE] Action: ${action}, Body:`, JSON.stringify(body).slice(0, 500));

    let result;

    switch (action) {
      case "test_connection": {
        const rawApiKey = Deno.env.get("GHL_API_Sub_Account_Key");
        const testLocationId = Deno.env.get("GHL_LOCATION_ID");
        
        // Check if secrets are configured
        if (!rawApiKey) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "GHL_API_Sub_Account_Key is not configured",
              diagnostics: null
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (!testLocationId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "GHL_LOCATION_ID is not configured",
              diagnostics: null
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Get token diagnostics
        const diagnostics = getTokenDiagnostics(rawApiKey);
        const issues = buildDiagnosticMessage(diagnostics);
        const normalizedToken = normalizeToken(rawApiKey);
        
        console.log(`[GHL-CORE] Token diagnostics:`, JSON.stringify(diagnostics));
        if (issues.length > 0) {
          console.log(`[GHL-CORE] Token issues detected:`, issues);
        }
        
        try {
          // Test with location custom values endpoint - more reliable
          const testResponse = await fetch(`${GHL_BASE_URL}/locations/${testLocationId}/customValues`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${normalizedToken}`,
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Version": "2021-07-28",
            },
          });
          
          const testData = await testResponse.json();
          
          if (!testResponse.ok) {
            console.error("[GHL-CORE] Test connection failed:", testData);
            
            // Build helpful error message
            let errorMsg = testData.message || testData.error || `API error: ${testResponse.status}`;
            
            // Add diagnostic hints
            if (issues.length > 0) {
              errorMsg += ` | Issues: ${issues.join("; ")}`;
            }
            
            // Special handling for common errors
            if (testResponse.status === 401) {
              if (diagnostics.isJwtShaped && diagnostics.jwtInfo?.isExpired) {
                errorMsg = `Token expired (${diagnostics.jwtInfo.expiresIn}). Generate a new Private Integration token.`;
              } else if (diagnostics.isJwtShaped) {
                errorMsg = "Invalid JWT - this may be an OAuth access token instead of a Private Integration token. Create a new token in Settings → Integrations → Private Integrations.";
              } else {
                errorMsg = "Invalid API key. Ensure you're using a Private Integration token from Settings → Integrations → Private Integrations.";
              }
            }
            
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: errorMsg,
                diagnostics: {
                  ...diagnostics,
                  issues,
                  httpStatus: testResponse.status,
                  ghlError: testData.message || testData.error
                }
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: `Connected to GoHighLevel - Location ID: ${testLocationId}`,
              diagnostics: {
                tokenLength: diagnostics.length,
                isJwt: diagnostics.isJwtShaped,
                issues: issues.length > 0 ? issues : undefined
              }
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (testErr) {
          console.error("[GHL-CORE] Test connection error:", testErr);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: testErr instanceof Error ? testErr.message : "Connection failed",
              diagnostics: { ...diagnostics, issues }
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "upsertContact":
        result = await upsertContact(body as any);
        break;
      case "getContact":
        result = await getContactById((body as any).id);
        break;
      case "createContact":
        result = await createContact(body as any);
        break;

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
