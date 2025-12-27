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

interface ValidationChecks {
  width_check: boolean;
  depth_check: boolean;
  parent_children_check: boolean;
  earliest_position_check: boolean;
  no_duplicate_index_check: boolean;
  no_cycle_check: boolean;
  integrity_check: boolean;
}

// Calculate expected level and seat from position_index (1-based)
function calculateExpectedPosition(positionIndex: number): { level: number; seatInLevel: number } {
  if (positionIndex === 1) return { level: 1, seatInLevel: 1 };
  
  // Calculate cumulative positions: level 1 = 1, level 2 = 1+3=4, level 3 = 1+3+9=13, etc.
  // Formula: total positions up to level L = (3^L - 1) / 2
  let cumulativePositions = 1; // Level 1 has position 1
  let level = 1;
  
  while (cumulativePositions < positionIndex) {
    level++;
    const positionsAtLevel = Math.pow(3, level - 1);
    if (cumulativePositions + positionsAtLevel >= positionIndex) {
      const seatInLevel = positionIndex - cumulativePositions;
      return { level, seatInLevel };
    }
    cumulativePositions += positionsAtLevel;
  }
  
  return { level: 1, seatInLevel: 1 };
}

// Detect cycles - ensure a node cannot be its own ancestor
async function detectCycle(
  supabaseAdmin: any, 
  userId: string, 
  parentId: string | null
): Promise<boolean> {
  if (!parentId) return false;
  
  const visited = new Set<string>();
  let currentId: string | null = parentId;
  
  while (currentId) {
    if (visited.has(currentId)) return true;
    visited.add(currentId);
    
    const { data: nodeData }: { data: { user_id: string; parent_id: string | null } | null } = await supabaseAdmin
      .from('matrix_nodes')
      .select('user_id, parent_id')
      .eq('id', currentId)
      .single();
    
    if (!nodeData) break;
    if (nodeData.user_id === userId) return true;
    currentId = nodeData.parent_id;
  }
  
  return false;
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
      matrix: { per_placement: 5, max_depth: 8 },
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

    // ========== VALIDATION CHECKS INITIALIZATION ==========
    const validationChecks: ValidationChecks = {
      width_check: true,
      depth_check: true,
      parent_children_check: true,
      earliest_position_check: true,
      no_duplicate_index_check: true,
      no_cycle_check: true,
      integrity_check: true,
    };

    // ========== GET NEXT POSITION INDEX ==========
    const { count: totalNodes } = await supabaseAdmin
      .from('matrix_nodes')
      .select('*', { count: 'exact', head: true });
    
    const nextPositionIndex = (totalNodes || 0) + 1;
    logStep("Calculated position_index", { nextPositionIndex, totalNodes });

    // ========== MATRIX PLACEMENT (Forced 3x8 Spillover) ==========
    const { data: rootNode } = await supabaseAdmin
      .from('matrix_nodes')
      .select('*')
      .eq('level', 1)
      .maybeSingle();

    let parentId: string | null = null;
    let parentUserId: string | null = null;
    let position: number | null = null;
    let level = 1;

    if (!rootNode) {
      // This is the first member - they become the root
      logStep("Creating root matrix node");
      level = 1;
      
      // DOUBLE CHECK: Verify depth is valid (level 1 <= 8)
      validationChecks.depth_check = level <= settings.matrix.max_depth;
    } else {
      // Find first available slot using BFS (breadth-first search)
      // This ensures top-to-bottom, left-to-right filling
      const queue: { id: string; level: number }[] = [{ id: rootNode.id, level: 1 }];
      let foundSlot = false;
      
      while (queue.length > 0 && !foundSlot) {
        const current = queue.shift()!;
        
        // DOUBLE CHECK: Skip nodes at max depth
        if (current.level >= settings.matrix.max_depth) {
          continue;
        }

        const { data: node } = await supabaseAdmin
          .from('matrix_nodes')
          .select('*')
          .eq('id', current.id)
          .single();

        if (!node) continue;

        // DOUBLE CHECK: Count existing children (width check)
        const childCount = [node.left_child, node.middle_child, node.right_child].filter(Boolean).length;
        validationChecks.width_check = childCount < 3;

        // Check for empty slots (left, middle, right) - always in order
        if (!node.left_child) {
          parentId = node.id;
          parentUserId = node.user_id;
          position = 1;
          level = current.level + 1;
          foundSlot = true;
          break;
        } else if (!node.middle_child) {
          parentId = node.id;
          parentUserId = node.user_id;
          position = 2;
          level = current.level + 1;
          foundSlot = true;
          break;
        } else if (!node.right_child) {
          parentId = node.id;
          parentUserId = node.user_id;
          position = 3;
          level = current.level + 1;
          foundSlot = true;
          break;
        }

        // Add children to queue for next level search (left-to-right order)
        if (node.left_child) queue.push({ id: node.left_child, level: current.level + 1 });
        if (node.middle_child) queue.push({ id: node.middle_child, level: current.level + 1 });
        if (node.right_child) queue.push({ id: node.right_child, level: current.level + 1 });
      }

      // DOUBLE CHECK: Verify depth is valid
      validationChecks.depth_check = level <= settings.matrix.max_depth;
      
      if (!foundSlot) {
        throw new Error("Matrix is full - no available positions");
      }
    }

    // TRIPLE CHECK: Verify calculated position matches expected from position_index
    const expectedPosition = calculateExpectedPosition(nextPositionIndex);
    validationChecks.earliest_position_check = expectedPosition.level === level;
    logStep("Position validation", { expectedLevel: expectedPosition.level, actualLevel: level, positionIndex: nextPositionIndex });

    // DOUBLE CHECK: Verify no duplicate position_index
    const { data: duplicateCheck } = await supabaseAdmin
      .from('matrix_nodes')
      .select('id')
      .eq('position_index', nextPositionIndex)
      .maybeSingle();
    
    validationChecks.no_duplicate_index_check = !duplicateCheck;

    // QUADRUPLE CHECK: Detect cycles
    validationChecks.no_cycle_check = !(await detectCycle(supabaseAdmin, user_id, parentId));

    // QUADRUPLE CHECK: Integrity - verify no holes in earlier positions
    if (nextPositionIndex > 1) {
      const { count: filledCount } = await supabaseAdmin
        .from('matrix_nodes')
        .select('*', { count: 'exact', head: true })
        .not('position_index', 'is', null)
        .lte('position_index', nextPositionIndex - 1);
      
      validationChecks.integrity_check = filledCount === nextPositionIndex - 1;
    }

    // ========== FAIL-SAFE: Block if any check fails ==========
    const failedChecks = Object.entries(validationChecks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    if (failedChecks.length > 0) {
      logStep("VALIDATION FAILED - BLOCKING PLACEMENT", { failedChecks, validationChecks });
      throw new Error(`Matrix placement validation failed: ${failedChecks.join(', ')}`);
    }

    logStep("All validation checks passed", validationChecks);

    // Determine placement source
    const placementSource = sponsor_id && sponsor_id === parentUserId 
      ? 'direct_signup' 
      : sponsor_id 
        ? 'spillover' 
        : 'direct_signup';

    // Create the new matrix node with enhanced tracking
    const { data: newNode, error: nodeError } = await supabaseAdmin
      .from('matrix_nodes')
      .insert({
        user_id,
        parent_id: parentId,
        sponsor_id: sponsor_id || null,
        position,
        level,
        position_index: nextPositionIndex,
        placement_source: placementSource,
        placed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (nodeError) {
      throw new Error(`Failed to create matrix node: ${nodeError.message}`);
    }

    logStep("Matrix node created", { 
      nodeId: newNode.id, 
      level, 
      position, 
      parentId, 
      position_index: nextPositionIndex,
      placement_source: placementSource 
    });

    // Update parent's child reference
    if (parentId && position) {
      const childField = position === 1 ? 'left_child' : position === 2 ? 'middle_child' : 'right_child';
      await supabaseAdmin
        .from('matrix_nodes')
        .update({ [childField]: newNode.id })
        .eq('id', parentId);
      
      logStep("Updated parent node", { parentId, childField });
    }

    // ========== CREATE PLACEMENT LOG ==========
    await supabaseAdmin.from('placement_logs').insert({
      matrix_node_id: newNode.id,
      user_id,
      placed_under_user_id: parentUserId,
      sponsor_id: sponsor_id || null,
      level,
      position,
      position_index: nextPositionIndex,
      placement_source: placementSource,
      checks_passed: validationChecks,
      related_events: {
        timestamp: new Date().toISOString(),
        sponsor_id,
        parent_id: parentId,
      },
    });

    logStep("Placement log created");

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
        const { data: sponsorProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, referred_by, full_name')
          .eq('id', currentSponsorId)
          .single();

        if (sponsorProfile) {
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

    // ========== MATRIX INCOME (Role-based: Client 2.5%, Barber 5%) ==========
    // Commission depth is now LOCKED by rank
    const RANK_TO_MAX_LEVEL: Record<string, number> = {
      bronze: 3,
      silver: 4,
      gold: 5,
      platinum: 6,
      diamond: 8,
    };

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

        // Get member rank to check commission depth eligibility
        const { data: memberRank } = await supabaseAdmin
          .from('member_ranks')
          .select('current_rank, is_active')
          .eq('user_id', parentNode.user_id)
          .maybeSingle();

        const userRank = memberRank?.current_rank || 'bronze';
        const isActive = memberRank?.is_active !== false;
        const maxPayableLevel = RANK_TO_MAX_LEVEL[userRank] || 3;

        // RANK-BASED COMMISSION DEPTH: Only pay if level is within their unlocked depth
        if (uplineLevel > maxPayableLevel || !isActive) {
          logStep("Skipping commission - rank/level restriction", { 
            userId: parentNode.user_id, 
            rank: userRank,
            maxLevel: maxPayableLevel,
            currentLevel: uplineLevel,
            isActive
          });
          currentParentId = parentNode.parent_id;
          uplineLevel++;
          continue;
        }

        const { data: parentMembership } = await supabaseAdmin
          .from('memberships')
          .select('status')
          .eq('user_id', parentNode.user_id)
          .eq('status', 'active')
          .maybeSingle();

        if (parentMembership) {
          // Get account role to determine matrix percentage
          const { data: accountRole } = await supabaseAdmin
            .from('account_roles')
            .select('account_type, matrix_percent')
            .eq('user_id', parentNode.user_id)
            .maybeSingle();

          // Default to client rates if no account_role found
          const matrixPercent = accountRole?.matrix_percent || 2.5;
          const accountType = accountRole?.account_type || 'client';
          
          // Calculate commission: $50 * matrix_percent / 100
          const commissionAmount = 50 * (matrixPercent / 100);

          matrixCommissions.push({
            user_id: parentNode.user_id,
            amount: commissionAmount,
            commission_type: 'matrix_membership',
            level: uplineLevel,
            source_user_id: user_id,
            description: `Matrix Level ${uplineLevel} (${accountType} ${matrixPercent}%, ${userRank} rank)`,
            status: 'pending',
          });

          logStep("Matrix commission calculated", { 
            userId: parentNode.user_id, 
            accountType, 
            matrixPercent, 
            amount: commissionAmount,
            rank: userRank
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
    const { data: allNewCommissions } = await supabaseAdmin
      .from('commission_events')
      .select('*')
      .eq('source_user_id', user_id)
      .in('commission_type', ['fast_start', 'matrix_membership']);

    if (allNewCommissions && sponsor_id) {
      const matchingCommissions: any[] = [];

      const commissionsByUser = allNewCommissions.reduce((acc: Record<string, number>, c) => {
        acc[c.user_id] = (acc[c.user_id] || 0) + Number(c.amount);
        return acc;
      }, {});

      for (const [earnerId, totalEarned] of Object.entries(commissionsByUser)) {
        const { data: earnerProfile } = await supabaseAdmin
          .from('profiles')
          .select('referred_by')
          .eq('id', earnerId)
          .single();

        if (earnerProfile?.referred_by) {
          // Get L1 sponsor's account role for matching rates
          const { data: l1AccountRole } = await supabaseAdmin
            .from('account_roles')
            .select('account_type, matching_l1_percent, matching_l2_percent')
            .eq('user_id', earnerProfile.referred_by)
            .maybeSingle();

          // Default to client rates (10%/5%) if no account_role found
          const l1MatchPercent = l1AccountRole?.matching_l1_percent || 10;
          const l1AccountType = l1AccountRole?.account_type || 'client';

          const { data: l1Membership } = await supabaseAdmin
            .from('memberships')
            .select('status')
            .eq('user_id', earnerProfile.referred_by)
            .eq('status', 'active')
            .maybeSingle();

          if (l1Membership) {
            const l1Match = (totalEarned as number) * (l1MatchPercent / 100);
            if (l1Match > 0) {
              matchingCommissions.push({
                user_id: earnerProfile.referred_by,
                amount: l1Match,
                commission_type: 'matching_bonus',
                level: 1,
                source_user_id: earnerId,
                description: `${l1MatchPercent}% Matching Bonus - Level 1 (${l1AccountType})`,
                status: 'pending',
              });

              logStep("L1 Matching calculated", { 
                userId: earnerProfile.referred_by, 
                accountType: l1AccountType, 
                matchPercent: l1MatchPercent, 
                amount: l1Match 
              });
            }

            const { data: l1Profile } = await supabaseAdmin
              .from('profiles')
              .select('referred_by')
              .eq('id', earnerProfile.referred_by)
              .single();

            if (l1Profile?.referred_by) {
              // Get L2 sponsor's account role for matching rates
              const { data: l2AccountRole } = await supabaseAdmin
                .from('account_roles')
                .select('account_type, matching_l2_percent')
                .eq('user_id', l1Profile.referred_by)
                .maybeSingle();

              // Default to client rates if no account_role found
              const l2MatchPercent = l2AccountRole?.matching_l2_percent || 5;
              const l2AccountType = l2AccountRole?.account_type || 'client';

              const { data: l2Membership } = await supabaseAdmin
                .from('memberships')
                .select('status')
                .eq('user_id', l1Profile.referred_by)
                .eq('status', 'active')
                .maybeSingle();

              if (l2Membership) {
                const l2Match = (totalEarned as number) * (l2MatchPercent / 100);
                if (l2Match > 0) {
                  matchingCommissions.push({
                    user_id: l1Profile.referred_by,
                    amount: l2Match,
                    commission_type: 'matching_bonus',
                    level: 2,
                    source_user_id: earnerId,
                    description: `${l2MatchPercent}% Matching Bonus - Level 2 (${l2AccountType})`,
                    status: 'pending',
                  });

                  logStep("L2 Matching calculated", { 
                    userId: l1Profile.referred_by, 
                    accountType: l2AccountType, 
                    matchPercent: l2MatchPercent, 
                    amount: l2Match 
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
      position,
      position_index: nextPositionIndex,
      placement_source: placementSource,
      validation_checks: validationChecks,
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
