import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-NEW-MEMBER] ${step}${detailsStr}`);
};

interface CompensationSettings {
  fast_start: { level_1: number; level_2: number; level_3: number };
  matrix: { per_placement: number; max_depth: number };
  matching: { level_1_percent: number; level_2_percent: number };
}

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
    const { user_id, sponsor_id } = await req.json();
    logStep("Processing new member", { user_id, sponsor_id });

    if (!user_id) {
      throw new Error("user_id is required");
    }

    // Get compensation settings
    const { data: settingsData } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'compensation_settings')
      .single();

    const settings: CompensationSettings = settingsData?.value || {
      fast_start: { level_1: 25, level_2: 10, level_3: 5 },
      matrix: { per_placement: 5, max_depth: 7 },
      matching: { level_1_percent: 10, level_2_percent: 5 }
    };

    logStep("Compensation settings loaded", settings);

    // Check if user already has a matrix node
    const { data: existingNode } = await supabaseAdmin
      .from('matrix_nodes')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existingNode) {
      logStep("User already in matrix, skipping placement");
      return new Response(JSON.stringify({ success: true, message: "Already in matrix" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ========== MATRIX PLACEMENT (Forced 3x7 Spillover) ==========
    // Find the next available position in the matrix (top-to-bottom, left-to-right)
    
    // Get the root node (level 1)
    const { data: rootNode } = await supabaseAdmin
      .from('matrix_nodes')
      .select('*')
      .eq('level', 1)
      .maybeSingle();

    let parentId: string | null = null;
    let position: number | null = null;
    let level = 1;

    if (!rootNode) {
      // This is the first member - they become the root
      logStep("Creating root matrix node");
      level = 1;
    } else {
      // Find first available slot using BFS (breadth-first search)
      const queue: { id: string; level: number }[] = [{ id: rootNode.id, level: 1 }];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        
        if (current.level >= settings.matrix.max_depth) {
          continue; // Skip nodes at max depth
        }

        const { data: node } = await supabaseAdmin
          .from('matrix_nodes')
          .select('*')
          .eq('id', current.id)
          .single();

        if (!node) continue;

        // Check for empty slots (left, middle, right)
        if (!node.left_child) {
          parentId = node.id;
          position = 1;
          level = current.level + 1;
          break;
        } else if (!node.middle_child) {
          parentId = node.id;
          position = 2;
          level = current.level + 1;
          break;
        } else if (!node.right_child) {
          parentId = node.id;
          position = 3;
          level = current.level + 1;
          break;
        }

        // Add children to queue for next level search
        if (node.left_child) queue.push({ id: node.left_child, level: current.level + 1 });
        if (node.middle_child) queue.push({ id: node.middle_child, level: current.level + 1 });
        if (node.right_child) queue.push({ id: node.right_child, level: current.level + 1 });
      }
    }

    // Create the new matrix node
    const { data: newNode, error: nodeError } = await supabaseAdmin
      .from('matrix_nodes')
      .insert({
        user_id,
        parent_id: parentId,
        sponsor_id: sponsor_id || null,
        position,
        level,
      })
      .select()
      .single();

    if (nodeError) {
      throw new Error(`Failed to create matrix node: ${nodeError.message}`);
    }

    logStep("Matrix node created", { nodeId: newNode.id, level, position, parentId });

    // Update parent's child reference
    if (parentId && position) {
      const childField = position === 1 ? 'left_child' : position === 2 ? 'middle_child' : 'right_child';
      await supabaseAdmin
        .from('matrix_nodes')
        .update({ [childField]: newNode.id })
        .eq('id', parentId);
      
      logStep("Updated parent node", { parentId, childField });
    }

    // ========== FAST START BONUSES (3 Levels) ==========
    if (sponsor_id) {
      const fastStartAmounts = [
        settings.fast_start.level_1,
        settings.fast_start.level_2,
        settings.fast_start.level_3,
      ];

      let currentSponsorId = sponsor_id;
      const fastStartCommissions: any[] = [];

      for (let i = 0; i < 3 && currentSponsorId; i++) {
        // Get the sponsor's profile to find their referrer
        const { data: sponsorProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, referred_by, full_name')
          .eq('id', currentSponsorId)
          .single();

        if (sponsorProfile) {
          // Check if sponsor has active membership
          const { data: sponsorMembership } = await supabaseAdmin
            .from('memberships')
            .select('status')
            .eq('user_id', sponsorProfile.id)
            .eq('status', 'active')
            .maybeSingle();

          if (sponsorMembership) {
            fastStartCommissions.push({
              user_id: sponsorProfile.id,
              amount: fastStartAmounts[i],
              commission_type: 'fast_start',
              level: i + 1,
              source_user_id: user_id,
              description: `Fast Start Level ${i + 1} Bonus`,
              status: 'pending',
            });
          }

          // Move to next level sponsor
          currentSponsorId = sponsorProfile.referred_by;
        } else {
          break;
        }
      }

      if (fastStartCommissions.length > 0) {
        await supabaseAdmin.from('commission_events').insert(fastStartCommissions);
        logStep("Fast Start commissions created", { count: fastStartCommissions.length });
      }
    }

    // ========== MATRIX INCOME (Upline gets paid when positions fill) ==========
    if (parentId) {
      const matrixCommissions: any[] = [];
      let currentParentId = parentId;
      let uplineLevel = 1;

      while (currentParentId && uplineLevel <= settings.matrix.max_depth) {
        const { data: parentNode } = await supabaseAdmin
          .from('matrix_nodes')
          .select('user_id, parent_id')
          .eq('id', currentParentId)
          .single();

        if (!parentNode) break;

        // Check if parent user has active membership
        const { data: parentMembership } = await supabaseAdmin
          .from('memberships')
          .select('status')
          .eq('user_id', parentNode.user_id)
          .eq('status', 'active')
          .maybeSingle();

        if (parentMembership) {
          matrixCommissions.push({
            user_id: parentNode.user_id,
            amount: settings.matrix.per_placement,
            commission_type: 'matrix_membership',
            level: uplineLevel,
            source_user_id: user_id,
            description: `Matrix Level ${uplineLevel} Placement`,
            status: 'pending',
          });
        }

        currentParentId = parentNode.parent_id;
        uplineLevel++;
      }

      if (matrixCommissions.length > 0) {
        await supabaseAdmin.from('commission_events').insert(matrixCommissions);
        logStep("Matrix commissions created", { count: matrixCommissions.length });
      }
    }

    // ========== MATCHING BONUSES (10% L1, 5% L2) ==========
    // Get all commissions just created for this new member
    const { data: allNewCommissions } = await supabaseAdmin
      .from('commission_events')
      .select('*')
      .eq('source_user_id', user_id)
      .in('commission_type', ['fast_start', 'matrix_membership']);

    if (allNewCommissions && sponsor_id) {
      const matchingCommissions: any[] = [];

      // Group commissions by user for matching calculation
      const commissionsByUser = allNewCommissions.reduce((acc: Record<string, number>, c) => {
        acc[c.user_id] = (acc[c.user_id] || 0) + Number(c.amount);
        return acc;
      }, {});

      // For each user who earned, find their upline and pay matching bonuses
      for (const [earnerId, totalEarned] of Object.entries(commissionsByUser)) {
        const { data: earnerProfile } = await supabaseAdmin
          .from('profiles')
          .select('referred_by')
          .eq('id', earnerId)
          .single();

        if (earnerProfile?.referred_by) {
          // Level 1 matching (10%)
          const { data: l1Membership } = await supabaseAdmin
            .from('memberships')
            .select('status')
            .eq('user_id', earnerProfile.referred_by)
            .eq('status', 'active')
            .maybeSingle();

          if (l1Membership) {
            const l1Match = (totalEarned as number) * (settings.matching.level_1_percent / 100);
            if (l1Match > 0) {
              matchingCommissions.push({
                user_id: earnerProfile.referred_by,
                amount: l1Match,
                commission_type: 'matching_bonus',
                level: 1,
                source_user_id: earnerId,
                description: `10% Matching Bonus - Level 1`,
                status: 'pending',
              });
            }

            // Level 2 matching (5%)
            const { data: l1Profile } = await supabaseAdmin
              .from('profiles')
              .select('referred_by')
              .eq('id', earnerProfile.referred_by)
              .single();

            if (l1Profile?.referred_by) {
              const { data: l2Membership } = await supabaseAdmin
                .from('memberships')
                .select('status')
                .eq('user_id', l1Profile.referred_by)
                .eq('status', 'active')
                .maybeSingle();

              if (l2Membership) {
                const l2Match = (totalEarned as number) * (settings.matching.level_2_percent / 100);
                if (l2Match > 0) {
                  matchingCommissions.push({
                    user_id: l1Profile.referred_by,
                    amount: l2Match,
                    commission_type: 'matching_bonus',
                    level: 2,
                    source_user_id: earnerId,
                    description: `5% Matching Bonus - Level 2`,
                    status: 'pending',
                  });
                }
              }
            }
          }
        }
      }

      if (matchingCommissions.length > 0) {
        await supabaseAdmin.from('commission_events').insert(matchingCommissions);
        logStep("Matching bonuses created", { count: matchingCommissions.length });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      matrix_node_id: newNode.id,
      level,
      position 
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
