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

interface DisplayNode {
  id: string;
  level: number;
  position: number;
  status: 'filled' | 'open' | 'root';
  name?: string;
  email?: string;
  positionIndex?: number;
}

const NodeIcon = ({ status }: { status: DisplayNode['status'] }) => {
  switch (status) {
    case 'root':
      return <Users className="w-4 h-4" />;
    case 'filled':
      return <UserCheck className="w-4 h-4" />;
    case 'open':
      return <User className="w-4 h-4 opacity-40" />;
  }
};

const TreeNode = ({ node }: { node: DisplayNode }) => {
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
      <PopoverContent className="w-56 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span>{node.position}</span>
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

const getDisplayName = (node: MatrixNodeData): string => {
  if (node.profiles?.full_name) {
    return node.profiles.full_name;
  }
  if (node.profiles?.email) {
    return node.profiles.email.split('@')[0];
  }
  return `Member`;
};

// Build full site-wide tree from root
const buildFullTree = (nodes: MatrixNodeData[], maxLevels: number = 4): DisplayNode[][] => {
  if (nodes.length === 0) {
    return generateEmptyTree(maxLevels);
  }

  // Find root node (level 1, no parent)
  const rootNode = nodes.find(n => n.level === 1 && !n.parent_id);
  if (!rootNode) {
    return generateEmptyTree(maxLevels);
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const levels: DisplayNode[][] = [];

  // Level 0 - Root
  levels.push([{
    id: rootNode.id,
    level: 0,
    position: 1,
    status: 'root',
    name: getDisplayName(rootNode),
    email: rootNode.profiles?.email,
    positionIndex: rootNode.position_index || undefined,
  }]);

  // Build subsequent levels using BFS
  let currentLevelNodes: (MatrixNodeData | null)[] = [rootNode];
  let levelNum = 1;

  while (levelNum < maxLevels) {
    const nextLevel: DisplayNode[] = [];
    const nextLevelNodes: (MatrixNodeData | null)[] = [];
    let position = 1;

    for (const parentNode of currentLevelNodes) {
      // Left child
      const leftChild = parentNode?.left_child ? nodeMap.get(parentNode.left_child) : null;
      if (leftChild) {
        nextLevel.push({
          id: leftChild.id,
          level: levelNum,
          position: position,
          status: 'filled',
          name: getDisplayName(leftChild),
          email: leftChild.profiles?.email,
          positionIndex: leftChild.position_index || undefined,
        });
        nextLevelNodes.push(leftChild);
      } else {
        nextLevel.push({
          id: `open-${levelNum}-${position}`,
          level: levelNum,
          position: position,
          status: 'open',
        });
        nextLevelNodes.push(null);
      }
      position++;

      // Middle child
      const middleChild = parentNode?.middle_child ? nodeMap.get(parentNode.middle_child) : null;
      if (middleChild) {
        nextLevel.push({
          id: middleChild.id,
          level: levelNum,
          position: position,
          status: 'filled',
          name: getDisplayName(middleChild),
          email: middleChild.profiles?.email,
          positionIndex: middleChild.position_index || undefined,
        });
        nextLevelNodes.push(middleChild);
      } else {
        nextLevel.push({
          id: `open-${levelNum}-${position}`,
          level: levelNum,
          position: position,
          status: 'open',
        });
        nextLevelNodes.push(null);
      }
      position++;

      // Right child
      const rightChild = parentNode?.right_child ? nodeMap.get(parentNode.right_child) : null;
      if (rightChild) {
        nextLevel.push({
          id: rightChild.id,
          level: levelNum,
          position: position,
          status: 'filled',
          name: getDisplayName(rightChild),
          email: rightChild.profiles?.email,
          positionIndex: rightChild.position_index || undefined,
        });
        nextLevelNodes.push(rightChild);
      } else {
        nextLevel.push({
          id: `open-${levelNum}-${position}`,
          level: levelNum,
          position: position,
          status: 'open',
        });
        nextLevelNodes.push(null);
      }
      position++;
    }

    levels.push(nextLevel);
    currentLevelNodes = nextLevelNodes;
    levelNum++;
  }

  return levels;
};

const generateEmptyTree = (maxLevels: number = 4): DisplayNode[][] => {
  const levels: DisplayNode[][] = [];

  levels.push([{ id: 'root', level: 0, position: 1, status: 'open' }]);

  for (let level = 1; level < maxLevels; level++) {
    const positions = Math.pow(3, level);
    const levelNodes: DisplayNode[] = [];
    for (let p = 1; p <= positions; p++) {
      levelNodes.push({ id: `l${level}-${p}`, level, position: p, status: 'open' });
    }
    levels.push(levelNodes);
  }

  return levels;
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

  const treeData = matrixNodes ? buildFullTree(matrixNodes, showLevels) : generateEmptyTree(showLevels);

  const filledCount = treeData.flat().filter(n => n.status === 'filled' || n.status === 'root').length;
  const openCount = treeData.flat().filter(n => n.status === 'open').length;
  const totalPositions = treeData.flat().length;

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
              Full 3×8 structure (showing {showLevels} levels)
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
      ) : expanded && (
        <div className="space-y-4 overflow-x-auto pb-4">
          {treeData.map((level, levelIndex) => (
            <div key={levelIndex} className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground mb-2">
                {levelIndex === 0 ? 'Root' : `Level ${levelIndex} (${level.filter(n => n.status !== 'open').length}/${level.length} filled)`}
              </span>

              <div
                className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap"
                style={{ maxWidth: '100%' }}
              >
                {level.map((node) => (
                  <TreeNode key={node.id} node={node} />
                ))}
              </div>

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