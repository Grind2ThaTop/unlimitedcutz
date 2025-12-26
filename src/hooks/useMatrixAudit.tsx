import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MatrixNode {
  id: string;
  user_id: string;
  parent_id: string | null;
  sponsor_id: string | null;
  level: number;
  position: number | null;
  position_index: number | null;
  placement_source: string | null;
  placed_at: string | null;
  created_at: string;
  left_child: string | null;
  middle_child: string | null;
  right_child: string | null;
  profile?: {
    full_name: string | null;
    email: string;
  };
}

export interface PlacementLog {
  id: string;
  matrix_node_id: string;
  user_id: string;
  placed_under_user_id: string | null;
  sponsor_id: string | null;
  level: number;
  position: number | null;
  position_index: number;
  placement_source: string;
  checks_passed: Record<string, boolean>;
  related_events: Record<string, any>;
  created_at: string;
}

export interface ValidationResult {
  passed: boolean;
  checks: {
    width_check: { passed: boolean; details: string };
    depth_check: { passed: boolean; details: string };
    parent_children_check: { passed: boolean; details: string };
    position_index_check: { passed: boolean; details: string };
    no_holes_check: { passed: boolean; details: string };
    no_cycles_check: { passed: boolean; details: string };
  };
}

export interface IntegrityReport {
  totalNodes: number;
  nodesPerLevel: Record<number, number>;
  expectedNodesPerLevel: Record<number, number>;
  holes: { positionIndex: number; expectedLevel: number }[];
  duplicatePositionIndexes: number[];
  orphanNodes: string[];
  cycleDetected: boolean;
  overallHealth: 'healthy' | 'warning' | 'critical';
}

// Calculate expected level from position_index
function calculateExpectedLevel(positionIndex: number): number {
  if (positionIndex === 1) return 1;
  
  let cumulativePositions = 1;
  let level = 1;
  
  while (cumulativePositions < positionIndex) {
    level++;
    const positionsAtLevel = Math.pow(3, level - 1);
    if (cumulativePositions + positionsAtLevel >= positionIndex) {
      return level;
    }
    cumulativePositions += positionsAtLevel;
  }
  
  return level;
}

export const useMatrixAudit = () => {
  const queryClient = useQueryClient();

  // Fetch all matrix nodes with profiles
  const allNodesQuery = useQuery({
    queryKey: ['matrixAudit', 'allNodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matrix_nodes')
        .select('*')
        .order('position_index', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return (data || []) as MatrixNode[];
    },
  });

  // Fetch placement logs
  const placementLogsQuery = useQuery({
    queryKey: ['matrixAudit', 'placementLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('placement_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return (data || []) as PlacementLog[];
    },
  });

  // Search for a specific user's matrix node
  const searchUser = async (searchTerm: string): Promise<MatrixNode | null> => {
    // Try searching by email first
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('email', `%${searchTerm}%`)
      .limit(1)
      .maybeSingle();
    
    const userId = profileData?.id || searchTerm;
    
    const { data, error } = await supabase
      .from('matrix_nodes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error || !data) return null;
    
    return { ...data, profile: profileData ? { full_name: profileData.full_name, email: profileData.email } : undefined } as MatrixNode;
  };

  // Get parent chain for a node
  const getParentChain = async (nodeId: string): Promise<MatrixNode[]> => {
    const chain: MatrixNode[] = [];
    let currentId: string | null = nodeId;
    
    while (currentId) {
      const { data } = await supabase
        .from('matrix_nodes')
        .select('*')
        .eq('id', currentId)
        .single();
      
      if (!data) break;
      chain.push(data as MatrixNode);
      currentId = data.parent_id;
    }
    
    return chain;
  };

  // Verify a single node placement
  const verifyNodePlacement = async (node: MatrixNode): Promise<ValidationResult> => {
    const checks = {
      width_check: { passed: true, details: '' },
      depth_check: { passed: true, details: '' },
      parent_children_check: { passed: true, details: '' },
      position_index_check: { passed: true, details: '' },
      no_holes_check: { passed: true, details: '' },
      no_cycles_check: { passed: true, details: '' },
    };

    // Width check - node should have at most 3 children
    const childCount = [node.left_child, node.middle_child, node.right_child].filter(Boolean).length;
    checks.width_check.passed = childCount <= 3;
    checks.width_check.details = `Has ${childCount} children (max 3)`;

    // Depth check - level should be 1-8
    checks.depth_check.passed = node.level >= 1 && node.level <= 8;
    checks.depth_check.details = `Level ${node.level} (valid: 1-8)`;

    // Parent children check - if has parent, verify parent references this node
    if (node.parent_id) {
      const { data: parent } = await supabase
        .from('matrix_nodes')
        .select('left_child, middle_child, right_child')
        .eq('id', node.parent_id)
        .single();
      
      if (parent) {
        const isReferenced = parent.left_child === node.id || 
                            parent.middle_child === node.id || 
                            parent.right_child === node.id;
        checks.parent_children_check.passed = isReferenced;
        checks.parent_children_check.details = isReferenced 
          ? 'Parent correctly references this node' 
          : 'Parent does NOT reference this node!';
      }
    } else {
      checks.parent_children_check.details = 'Root node (no parent)';
    }

    // Position index check
    if (node.position_index) {
      const expectedLevel = calculateExpectedLevel(node.position_index);
      checks.position_index_check.passed = expectedLevel === node.level;
      checks.position_index_check.details = `Position ${node.position_index} → Expected level ${expectedLevel}, Actual level ${node.level}`;
    } else {
      checks.position_index_check.passed = false;
      checks.position_index_check.details = 'Missing position_index';
    }

    // No holes check - verify all previous positions exist
    if (node.position_index && node.position_index > 1) {
      const { count } = await supabase
        .from('matrix_nodes')
        .select('*', { count: 'exact', head: true })
        .lt('position_index', node.position_index);
      
      checks.no_holes_check.passed = count === node.position_index - 1;
      checks.no_holes_check.details = `${count} nodes before this (expected ${node.position_index - 1})`;
    } else {
      checks.no_holes_check.details = 'First node or no position_index';
    }

    // Cycle check
    const chain = await getParentChain(node.id);
    const userIds = chain.map(n => n.user_id);
    const hasDuplicates = userIds.length !== new Set(userIds).size;
    checks.no_cycles_check.passed = !hasDuplicates;
    checks.no_cycles_check.details = hasDuplicates 
      ? 'CYCLE DETECTED in ancestry!' 
      : `Clean ancestry (${chain.length} levels to root)`;

    const passed = Object.values(checks).every(c => c.passed);
    return { passed, checks };
  };

  // Run full integrity audit
  const runFullIntegrityAudit = async (): Promise<IntegrityReport> => {
    const nodes = allNodesQuery.data || [];
    
    const report: IntegrityReport = {
      totalNodes: nodes.length,
      nodesPerLevel: {},
      expectedNodesPerLevel: {},
      holes: [],
      duplicatePositionIndexes: [],
      orphanNodes: [],
      cycleDetected: false,
      overallHealth: 'healthy',
    };

    // Count nodes per level
    nodes.forEach(node => {
      report.nodesPerLevel[node.level] = (report.nodesPerLevel[node.level] || 0) + 1;
    });

    // Calculate expected nodes per level for a complete tree
    for (let level = 1; level <= 8; level++) {
      report.expectedNodesPerLevel[level] = Math.pow(3, level - 1);
    }

    // Find holes in position_index sequence
    const positionIndexes = nodes
      .map(n => n.position_index)
      .filter((pi): pi is number => pi !== null)
      .sort((a, b) => a - b);
    
    for (let i = 1; i <= positionIndexes.length; i++) {
      if (!positionIndexes.includes(i)) {
        report.holes.push({ 
          positionIndex: i, 
          expectedLevel: calculateExpectedLevel(i) 
        });
      }
    }

    // Find duplicate position_indexes
    const seen = new Set<number>();
    positionIndexes.forEach(pi => {
      if (seen.has(pi)) {
        report.duplicatePositionIndexes.push(pi);
      }
      seen.add(pi);
    });

    // Find orphan nodes (have parent_id but parent doesn't exist)
    const nodeIds = new Set(nodes.map(n => n.id));
    nodes.forEach(node => {
      if (node.parent_id && !nodeIds.has(node.parent_id)) {
        report.orphanNodes.push(node.id);
      }
    });

    // Determine overall health
    if (report.holes.length > 0 || report.duplicatePositionIndexes.length > 0 || report.cycleDetected) {
      report.overallHealth = 'critical';
    } else if (report.orphanNodes.length > 0) {
      report.overallHealth = 'warning';
    }

    return report;
  };

  return {
    allNodes: allNodesQuery.data || [],
    placementLogs: placementLogsQuery.data || [],
    isLoading: allNodesQuery.isLoading || placementLogsQuery.isLoading,
    searchUser,
    getParentChain,
    verifyNodePlacement,
    runFullIntegrityAudit,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['matrixAudit'] });
    },
  };
};
