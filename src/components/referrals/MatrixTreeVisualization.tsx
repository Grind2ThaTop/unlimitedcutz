import { useState, useEffect } from "react";
import { GitBranch, User, UserCheck, UserX, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MatrixNodeData {
  id: string;
  user_id: string;
  parent_id: string | null;
  left_child: string | null;
  middle_child: string | null;
  right_child: string | null;
  level: number;
  position: number | null;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface DisplayNode {
  id: string;
  level: number;
  position: number;
  status: 'filled' | 'open' | 'inactive' | 'you';
  name?: string;
  earnings?: number;
}

const NodeIcon = ({ status }: { status: DisplayNode['status'] }) => {
  switch (status) {
    case 'you':
      return <User className="w-4 h-4" />;
    case 'filled':
      return <UserCheck className="w-4 h-4" />;
    case 'inactive':
      return <UserX className="w-4 h-4" />;
    case 'open':
      return <User className="w-4 h-4 opacity-40" />;
  }
};

const TreeNode = ({ node }: { node: DisplayNode }) => {
  const statusStyles = {
    you: 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background',
    filled: 'bg-green-500/20 text-green-500 border border-green-500/50',
    inactive: 'bg-amber-500/20 text-amber-500 border border-amber-500/50',
    open: 'bg-muted/50 text-muted-foreground border border-dashed border-muted-foreground/30',
  };

  const statusLabels = {
    you: 'Your Position',
    filled: 'Active Member',
    inactive: 'Inactive',
    open: 'Open Position',
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer",
            statusStyles[node.status]
          )}
        >
          <NodeIcon status={node.status} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              statusStyles[node.status]
            )}>
              <NodeIcon status={node.status} />
            </div>
            <div>
              <p className="font-medium text-sm">{node.name || 'Available'}</p>
              <p className="text-xs text-muted-foreground">{statusLabels[node.status]}</p>
            </div>
          </div>
          <div className="text-xs space-y-1 pt-2 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level:</span>
              <span>{node.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span>{node.position}</span>
            </div>
            {node.earnings !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly:</span>
                <span className="text-green-500">${node.earnings.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Get display name from profile
const getDisplayName = (node: MatrixNodeData): string => {
  if (node.profiles?.full_name) {
    return node.profiles.full_name;
  }
  if (node.profiles?.email) {
    return node.profiles.email.split('@')[0];
  }
  return `Member ${node.id.slice(0, 4)}`;
};

// Build tree structure from flat node array (3-wide)
const buildTreeLevels = (nodes: MatrixNodeData[], userId: string): DisplayNode[][] => {
  if (nodes.length === 0) {
    return generateEmptyTree();
  }

  // Find user's node
  const userNode = nodes.find(n => n.user_id === userId);
  if (!userNode) {
    return generateEmptyTree();
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const levels: DisplayNode[][] = [];
  
  // Level 0 - User
  levels.push([{
    id: userNode.id,
    level: 0,
    position: 1,
    status: 'you',
    name: 'You',
  }]);

  // Build subsequent levels using BFS (3-wide)
  let currentLevelNodes = [userNode];
  let levelNum = 1;
  const maxDisplayLevels = 4; // Show 4 levels max for visualization

  while (levelNum < maxDisplayLevels && currentLevelNodes.length > 0) {
    const nextLevel: DisplayNode[] = [];
    let position = 1;

    for (const parentNode of currentLevelNodes) {
      // Left child
      if (parentNode.left_child) {
        const child = nodeMap.get(parentNode.left_child);
        if (child) {
          nextLevel.push({
            id: child.id,
            level: levelNum,
            position: position++,
            status: 'filled',
            name: getDisplayName(child),
            earnings: 1.25,
          });
        }
      } else {
        nextLevel.push({
          id: `open-${levelNum}-${position}`,
          level: levelNum,
          position: position++,
          status: 'open',
        });
      }

      // Middle child
      if (parentNode.middle_child) {
        const child = nodeMap.get(parentNode.middle_child);
        if (child) {
          nextLevel.push({
            id: child.id,
            level: levelNum,
            position: position++,
            status: 'filled',
            name: getDisplayName(child),
            earnings: 1.25,
          });
        }
      } else {
        nextLevel.push({
          id: `open-${levelNum}-${position}`,
          level: levelNum,
          position: position++,
          status: 'open',
        });
      }

      // Right child
      if (parentNode.right_child) {
        const child = nodeMap.get(parentNode.right_child);
        if (child) {
          nextLevel.push({
            id: child.id,
            level: levelNum,
            position: position++,
            status: 'filled',
            name: getDisplayName(child),
            earnings: 1.25,
          });
        }
      } else {
        nextLevel.push({
          id: `open-${levelNum}-${position}`,
          level: levelNum,
          position: position++,
          status: 'open',
        });
      }
    }

    if (nextLevel.length > 0) {
      levels.push(nextLevel);
      // Get actual nodes for next iteration
      currentLevelNodes = nextLevel
        .filter(n => n.status === 'filled')
        .map(n => nodeMap.get(n.id))
        .filter((n): n is MatrixNodeData => n !== undefined);
    }
    levelNum++;
  }

  return levels;
};

// Generate empty tree structure for display when no data (3-wide)
const generateEmptyTree = (): DisplayNode[][] => {
  const levels: DisplayNode[][] = [];
  
  levels.push([{ id: 'you', level: 0, position: 1, status: 'you', name: 'You' }]);
  
  // Level 1: 3 positions
  levels.push([
    { id: 'l1-1', level: 1, position: 1, status: 'open' },
    { id: 'l1-2', level: 1, position: 2, status: 'open' },
    { id: 'l1-3', level: 1, position: 3, status: 'open' },
  ]);
  
  // Level 2: 9 positions
  levels.push([
    { id: 'l2-1', level: 2, position: 1, status: 'open' },
    { id: 'l2-2', level: 2, position: 2, status: 'open' },
    { id: 'l2-3', level: 2, position: 3, status: 'open' },
    { id: 'l2-4', level: 2, position: 4, status: 'open' },
    { id: 'l2-5', level: 2, position: 5, status: 'open' },
    { id: 'l2-6', level: 2, position: 6, status: 'open' },
    { id: 'l2-7', level: 2, position: 7, status: 'open' },
    { id: 'l2-8', level: 2, position: 8, status: 'open' },
    { id: 'l2-9', level: 2, position: 9, status: 'open' },
  ]);
  
  // Level 3: 27 positions
  const level3: DisplayNode[] = [];
  for (let i = 1; i <= 27; i++) {
    level3.push({ id: `l3-${i}`, level: 3, position: i, status: 'open' });
  }
  levels.push(level3);
  
  return levels;
};

const MatrixTreeVisualization = () => {
  const [expanded, setExpanded] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch matrix nodes with profile names
  const { data: matrixNodes, isLoading } = useQuery({
    queryKey: ['matrixTree', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get matrix nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('matrix_nodes')
        .select('id, user_id, parent_id, left_child, middle_child, right_child, level, position')
        .order('level', { ascending: true });
      
      if (nodesError) throw nodesError;
      if (!nodes || nodes.length === 0) return [];

      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(nodes.map(n => n.user_id))];
      
      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Merge profiles into nodes
      return nodes.map(node => ({
        ...node,
        profiles: profileMap.get(node.user_id) || null,
      })) as MatrixNodeData[];
    },
    enabled: !!user?.id,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('matrix-tree-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matrix_nodes',
        },
        () => {
          // Refetch the matrix tree when changes occur
          queryClient.invalidateQueries({ queryKey: ['matrixTree', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const treeData = matrixNodes && user?.id 
    ? buildTreeLevels(matrixNodes, user.id) 
    : generateEmptyTree();
  
  // Calculate stats
  const filledCount = treeData.flat().filter(n => n.status === 'filled' || n.status === 'you').length;
  const openCount = treeData.flat().filter(n => n.status === 'open').length;
  const inactiveCount = treeData.flat().filter(n => n.status === 'inactive').length;

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-display text-lg">Matrix Tree</h3>
            <p className="text-xs text-muted-foreground">3×8 structure (showing 4 levels)</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Expand
            </>
          )}
        </Button>
      </div>

      {/* Matrix Info */}
      <div className="bg-background/50 rounded-lg p-3 mb-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">This is a 3×8 Matrix.</p>
        <p>Everyone joins the same system. When positions under you fill, you earn.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span>You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-green-500/50 border border-green-500" />
          <span>Filled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-amber-500/50 border border-amber-500" />
          <span>Inactive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full border border-dashed border-muted-foreground/50" />
          <span>Open</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : expanded && (
        <div className="space-y-4 overflow-x-auto pb-4">
          {treeData.map((level, levelIndex) => (
            <div key={levelIndex} className="flex flex-col items-center">
              {/* Level label */}
              <span className="text-xs text-muted-foreground mb-2">
                {levelIndex === 0 ? 'You' : `Level ${levelIndex} (${Math.pow(3, levelIndex)} positions)`}
              </span>
              
              {/* Nodes */}
              <div 
                className="flex items-center justify-center gap-1 sm:gap-2"
                style={{ minWidth: `${level.length * 48}px` }}
              >
                {level.map((node) => (
                  <TreeNode key={node.id} node={node} />
                ))}
              </div>
              
              {/* Connectors */}
              {levelIndex < treeData.length - 1 && (
                <div className="w-0.5 h-4 bg-border my-1" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-display text-green-500">{filledCount}</p>
          <p className="text-xs text-muted-foreground">Filled</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-muted-foreground">{openCount}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-amber-500">{inactiveCount}</p>
          <p className="text-xs text-muted-foreground">Inactive</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Click on any position to see details. Tree updates in real-time.
      </p>
    </div>
  );
};

export default MatrixTreeVisualization;