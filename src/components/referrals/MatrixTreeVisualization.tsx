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

interface TreeNodeData {
  id: string;
  status: 'you' | 'filled' | 'inactive' | 'open';
  name?: string;
  level: number;
  earnings?: number;
  left: TreeNodeData | null;
  middle: TreeNodeData | null;
  right: TreeNodeData | null;
}

const NodeIcon = ({ status }: { status: TreeNodeData['status'] }) => {
  switch (status) {
    case 'you':
      return <User className="w-3 h-3 sm:w-4 sm:h-4" />;
    case 'filled':
      return <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />;
    case 'inactive':
      return <UserX className="w-3 h-3 sm:w-4 sm:h-4" />;
    case 'open':
      return <User className="w-3 h-3 sm:w-4 sm:h-4 opacity-40" />;
  }
};

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

const NodePopover = ({ node }: { node: TreeNodeData }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer flex-shrink-0",
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
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
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

// Recursive tree branch component - each parent has its 3 children directly beneath
const TreeBranch = ({ node, maxDepth, currentDepth = 0 }: { 
  node: TreeNodeData; 
  maxDepth: number;
  currentDepth?: number;
}) => {
  const showChildren = currentDepth < maxDepth - 1;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <NodePopover node={node} />
      
      {/* Children - only render if we haven't reached max depth */}
      {showChildren && (
        <>
          {/* Connecting lines */}
          <div className="flex items-start justify-center w-full mt-1">
            <svg 
              className="h-6 w-full overflow-visible" 
              style={{ minWidth: '100px' }}
              preserveAspectRatio="none"
            >
              {/* Lines to children */}
              <line x1="50%" y1="0" x2="20%" y2="100%" stroke="hsl(var(--border))" strokeWidth="1.5" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(var(--border))" strokeWidth="1.5" />
              <line x1="50%" y1="0" x2="80%" y2="100%" stroke="hsl(var(--border))" strokeWidth="1.5" />
            </svg>
          </div>
          
          {/* Children row */}
          <div className="flex items-start justify-center gap-1 sm:gap-2">
            {/* Left child */}
            <TreeBranch 
              node={node.left || createOpenNode(node.level + 1, 'left', node.id)} 
              maxDepth={maxDepth}
              currentDepth={currentDepth + 1}
            />
            {/* Middle child */}
            <TreeBranch 
              node={node.middle || createOpenNode(node.level + 1, 'middle', node.id)} 
              maxDepth={maxDepth}
              currentDepth={currentDepth + 1}
            />
            {/* Right child */}
            <TreeBranch 
              node={node.right || createOpenNode(node.level + 1, 'right', node.id)} 
              maxDepth={maxDepth}
              currentDepth={currentDepth + 1}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Create an open placeholder node
const createOpenNode = (level: number, position: string, parentId: string): TreeNodeData => ({
  id: `open-${parentId}-${position}`,
  status: 'open',
  level,
  left: null,
  middle: null,
  right: null,
});

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

// Build hierarchical tree structure from user's node
const buildUserTree = (nodes: MatrixNodeData[], userId: string): TreeNodeData | null => {
  if (nodes.length === 0) return null;

  // Find user's node
  const userNode = nodes.find(n => n.user_id === userId);
  if (!userNode) return null;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Recursive function to build tree
  const buildNode = (matrixNode: MatrixNodeData, isUser: boolean = false): TreeNodeData => {
    const leftChildData = matrixNode.left_child ? nodeMap.get(matrixNode.left_child) : null;
    const middleChildData = matrixNode.middle_child ? nodeMap.get(matrixNode.middle_child) : null;
    const rightChildData = matrixNode.right_child ? nodeMap.get(matrixNode.right_child) : null;

    return {
      id: matrixNode.id,
      status: isUser ? 'you' : 'filled',
      name: isUser ? 'You' : getDisplayName(matrixNode),
      level: isUser ? 0 : matrixNode.level,
      earnings: isUser ? undefined : 1.25,
      left: leftChildData ? buildNode(leftChildData) : null,
      middle: middleChildData ? buildNode(middleChildData) : null,
      right: rightChildData ? buildNode(rightChildData) : null,
    };
  };

  return buildNode(userNode, true);
};

// Create empty tree for user who's not in matrix yet
const createEmptyUserTree = (): TreeNodeData => ({
  id: 'you',
  status: 'you',
  name: 'You',
  level: 0,
  left: null,
  middle: null,
  right: null,
});

// Count filled and open positions
const countNodes = (node: TreeNodeData | null, maxDepth: number, currentDepth: number = 0): { filled: number; open: number; inactive: number } => {
  if (currentDepth >= maxDepth) return { filled: 0, open: 0, inactive: 0 };
  
  if (!node) {
    let totalOpen = 1;
    if (currentDepth < maxDepth - 1) {
      for (let i = 0; i < 3; i++) {
        const childResult = countNodes(null, maxDepth, currentDepth + 1);
        totalOpen += childResult.open;
      }
    }
    return { filled: 0, open: totalOpen, inactive: 0 };
  }

  const isFilled = node.status === 'filled' || node.status === 'you';
  const isInactive = node.status === 'inactive';
  let filled = isFilled ? 1 : 0;
  let open = node.status === 'open' ? 1 : 0;
  let inactive = isInactive ? 1 : 0;

  if (currentDepth < maxDepth - 1) {
    const leftResult = countNodes(node.left, maxDepth, currentDepth + 1);
    const middleResult = countNodes(node.middle, maxDepth, currentDepth + 1);
    const rightResult = countNodes(node.right, maxDepth, currentDepth + 1);

    filled += leftResult.filled + middleResult.filled + rightResult.filled;
    open += leftResult.open + middleResult.open + rightResult.open;
    inactive += leftResult.inactive + middleResult.inactive + rightResult.inactive;
  }

  return { filled, open, inactive };
};

const MatrixTreeVisualization = () => {
  const [expanded, setExpanded] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const maxDepth = 2; // Show only current level + next level

  // Fetch matrix nodes with profile names
  const { data: matrixNodes, isLoading } = useQuery({
    queryKey: ['matrixTree', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: nodes, error: nodesError } = await supabase
        .from('matrix_nodes')
        .select('id, user_id, parent_id, left_child, middle_child, right_child, level, position')
        .order('level', { ascending: true });
      
      if (nodesError) throw nodesError;
      if (!nodes || nodes.length === 0) return [];

      const userIds = [...new Set(nodes.map(n => n.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

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
          queryClient.invalidateQueries({ queryKey: ['matrixTree', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const treeRoot = matrixNodes && user?.id 
    ? buildUserTree(matrixNodes, user.id) || createEmptyUserTree()
    : createEmptyUserTree();

  const counts = countNodes(treeRoot, maxDepth);

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-display text-lg">Your Matrix Tree</h3>
            <p className="text-xs text-muted-foreground">3×8 structure (showing 2 levels)</p>
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
        <p className="font-medium text-foreground mb-1">Forced 3×8 Matrix</p>
        <p>Each person gets exactly 3 child slots. System fills top-down, left-to-right. This shows your personal downline.</p>
      </div>

      {/* Legend */}
      <div className="space-y-3 mb-6">
        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-muted-foreground font-medium">Status:</span>
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
            <div className="w-4 h-4 rounded-full bg-secondary border border-secondary-foreground/50" />
            <span>Barber</span>
          </div>
        </div>
        
        {/* Rank Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-muted-foreground font-medium">Ranks:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-amber-700/50 border border-amber-700" />
            <span>Bronze</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-slate-400/50 border border-slate-400" />
            <span>Silver</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-yellow-500/50 border border-yellow-500" />
            <span>Gold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-cyan-400/50 border border-cyan-400" />
            <span>Platinum</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-blue-500/50 border border-blue-500" />
            <span>Diamond</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-purple-500 to-pink-500" />
            <span>Partner</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : expanded && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-fit flex justify-center">
            <TreeBranch node={treeRoot} maxDepth={maxDepth} />
          </div>
        </div>
      )}

      {/* Stats summary - only show filled and inactive, not open */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-display text-green-500">{counts.filled}</p>
          <p className="text-xs text-muted-foreground">Filled</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-amber-500">{counts.inactive}</p>
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
