import { useState } from "react";
import { GitBranch, User, UserCheck, ChevronDown, ChevronUp, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MatrixNodeData {
  id: string;
  user_id: string;
  parent_id: string | null;
  left_child: string | null;
  middle_child: string | null;
  right_child: string | null;
  level: number;
  position: number | null;
  position_index: number | null;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface TreeNodeData {
  id: string;
  status: 'filled' | 'open' | 'root';
  name?: string;
  email?: string;
  level: number;
  positionIndex?: number;
  left: TreeNodeData | null;
  middle: TreeNodeData | null;
  right: TreeNodeData | null;
}

const NodeIcon = ({ status }: { status: TreeNodeData['status'] }) => {
  switch (status) {
    case 'root':
      return <Users className="w-3 h-3 sm:w-4 sm:h-4" />;
    case 'filled':
      return <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />;
    case 'open':
      return <User className="w-3 h-3 sm:w-4 sm:h-4 opacity-40" />;
  }
};

const statusStyles = {
  root: 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background',
  filled: 'bg-green-500/20 text-green-500 border border-green-500/50',
  open: 'bg-muted/50 text-muted-foreground border border-dashed border-muted-foreground/30',
};

const statusLabels = {
  root: 'Root Node',
  filled: 'Active Member',
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
      <PopoverContent className="w-56 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              statusStyles[node.status]
            )}>
              <NodeIcon status={node.status} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{node.name || 'Open'}</p>
              <p className="text-xs text-muted-foreground">{statusLabels[node.status]}</p>
            </div>
          </div>
          {node.email && (
            <p className="text-xs text-muted-foreground truncate">{node.email}</p>
          )}
          <div className="text-xs space-y-1 pt-2 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level:</span>
              <span>{node.level}</span>
            </div>
            {node.positionIndex && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Global Index:</span>
                <span>#{node.positionIndex}</span>
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
  const hasChildren = node.left || node.middle || node.right;
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
  return `Member`;
};

// Build hierarchical tree structure from flat node array
const buildHierarchicalTree = (nodes: MatrixNodeData[]): TreeNodeData | null => {
  if (nodes.length === 0) return null;

  // Find root node (level 1, no parent)
  const rootNode = nodes.find(n => n.level === 1 && !n.parent_id);
  if (!rootNode) return null;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Recursive function to build tree
  const buildNode = (matrixNode: MatrixNodeData, isRoot: boolean = false): TreeNodeData => {
    const leftChildData = matrixNode.left_child ? nodeMap.get(matrixNode.left_child) : null;
    const middleChildData = matrixNode.middle_child ? nodeMap.get(matrixNode.middle_child) : null;
    const rightChildData = matrixNode.right_child ? nodeMap.get(matrixNode.right_child) : null;

    return {
      id: matrixNode.id,
      status: isRoot ? 'root' : 'filled',
      name: getDisplayName(matrixNode),
      email: matrixNode.profiles?.email,
      level: matrixNode.level,
      positionIndex: matrixNode.position_index || undefined,
      left: leftChildData ? buildNode(leftChildData) : null,
      middle: middleChildData ? buildNode(middleChildData) : null,
      right: rightChildData ? buildNode(rightChildData) : null,
    };
  };

  return buildNode(rootNode, true);
};

// Create empty root for when there's no data
const createEmptyRoot = (): TreeNodeData => ({
  id: 'root',
  status: 'open',
  name: 'Root (Empty)',
  level: 1,
  left: null,
  middle: null,
  right: null,
});

// Count filled and open positions
const countNodes = (node: TreeNodeData | null, maxDepth: number, currentDepth: number = 0): { filled: number; open: number } => {
  if (currentDepth >= maxDepth) return { filled: 0, open: 0 };
  
  if (!node) {
    // This node is open, count its theoretical children
    const childCounts = currentDepth < maxDepth - 1 ? 3 : 0;
    let totalOpen = 1;
    if (currentDepth < maxDepth - 1) {
      for (let i = 0; i < 3; i++) {
        const childResult = countNodes(null, maxDepth, currentDepth + 1);
        totalOpen += childResult.open;
      }
    }
    return { filled: 0, open: totalOpen };
  }

  const isFilled = node.status === 'filled' || node.status === 'root';
  let filled = isFilled ? 1 : 0;
  let open = !isFilled ? 1 : 0;

  if (currentDepth < maxDepth - 1) {
    const leftResult = countNodes(node.left, maxDepth, currentDepth + 1);
    const middleResult = countNodes(node.middle, maxDepth, currentDepth + 1);
    const rightResult = countNodes(node.right, maxDepth, currentDepth + 1);

    filled += leftResult.filled + middleResult.filled + rightResult.filled;
    open += leftResult.open + middleResult.open + rightResult.open;
  }

  return { filled, open };
};

const AdminMatrixTree = () => {
  const [expanded, setExpanded] = useState(true);
  const [showLevels, setShowLevels] = useState(4);

  // Fetch ALL matrix nodes (admin view)
  const { data: matrixNodes, isLoading } = useQuery({
    queryKey: ['adminMatrixTree'],
    queryFn: async () => {
      const { data: nodes, error: nodesError } = await supabase
        .from('matrix_nodes')
        .select('id, user_id, parent_id, left_child, middle_child, right_child, level, position, position_index')
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
  });

  const treeRoot = matrixNodes && matrixNodes.length > 0 
    ? buildHierarchicalTree(matrixNodes) 
    : createEmptyRoot();

  const counts = treeRoot ? countNodes(treeRoot, showLevels) : { filled: 0, open: 1 };
  const totalPositions = counts.filled + counts.open;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg">Site-Wide Matrix</h3>
            <p className="text-xs text-muted-foreground">
              3×8 Structure — Each person has 3 children
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={showLevels}
            onChange={(e) => setShowLevels(Number(e.target.value))}
            className="text-xs bg-background border border-border rounded px-2 py-1"
          >
            <option value={3}>3 Levels</option>
            <option value={4}>4 Levels</option>
            <option value={5}>5 Levels</option>
          </select>
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
      </div>

      {/* Info Box */}
      <div className="bg-background/50 rounded-lg p-3 mb-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Forced 3×8 Matrix</p>
        <p>Each person gets exactly 3 child slots. System fills top-down, left-to-right (BFS). Growth happens by replication downward.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span>Root</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-green-500/50 border border-green-500" />
          <span>Filled</span>
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
      ) : expanded && treeRoot && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-fit flex justify-center">
            <TreeBranch node={treeRoot} maxDepth={showLevels} />
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-display text-green-500">{counts.filled}</p>
          <p className="text-xs text-muted-foreground">Filled</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-muted-foreground">{counts.open}</p>
          <p className="text-xs text-muted-foreground">Open</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-primary">{totalPositions}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Click any position to see member details. This shows the entire site matrix.
      </p>
    </div>
  );
};

export default AdminMatrixTree;
