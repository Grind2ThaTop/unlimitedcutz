import { useState } from "react";
import { GitBranch, User, UserCheck, UserX, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MatrixNode {
  id: string;
  level: number;
  position: number;
  status: 'filled' | 'open' | 'inactive' | 'you';
  name?: string;
  earnings?: number;
}

// Generate mock tree data for visualization (2x tree, first 4 levels)
const generateMockTree = (): MatrixNode[][] => {
  const levels: MatrixNode[][] = [];
  
  // Level 0 - You
  levels.push([{ id: 'you', level: 0, position: 1, status: 'you', name: 'You' }]);
  
  // Level 1 - 2 positions
  levels.push([
    { id: 'l1-1', level: 1, position: 1, status: 'filled', name: 'Sarah M.', earnings: 1.25 },
    { id: 'l1-2', level: 1, position: 2, status: 'filled', name: 'John D.', earnings: 1.25 },
  ]);
  
  // Level 2 - 4 positions
  levels.push([
    { id: 'l2-1', level: 2, position: 1, status: 'filled', name: 'Mike R.', earnings: 1.25 },
    { id: 'l2-2', level: 2, position: 2, status: 'filled', name: 'Lisa K.', earnings: 1.25 },
    { id: 'l2-3', level: 2, position: 3, status: 'inactive', name: 'Tom H.' },
    { id: 'l2-4', level: 2, position: 4, status: 'open' },
  ]);
  
  // Level 3 - 8 positions
  levels.push([
    { id: 'l3-1', level: 3, position: 1, status: 'filled', name: 'Emma W.', earnings: 1.25 },
    { id: 'l3-2', level: 3, position: 2, status: 'open' },
    { id: 'l3-3', level: 3, position: 3, status: 'filled', name: 'Chris B.', earnings: 1.25 },
    { id: 'l3-4', level: 3, position: 4, status: 'open' },
    { id: 'l3-5', level: 3, position: 5, status: 'open' },
    { id: 'l3-6', level: 3, position: 6, status: 'open' },
    { id: 'l3-7', level: 3, position: 7, status: 'open' },
    { id: 'l3-8', level: 3, position: 8, status: 'open' },
  ]);
  
  return levels;
};

const NodeIcon = ({ status }: { status: MatrixNode['status'] }) => {
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

const TreeNode = ({ node }: { node: MatrixNode }) => {
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

const MatrixTreeVisualization = () => {
  const [expanded, setExpanded] = useState(true);
  const treeData = generateMockTree();
  
  // Calculate stats
  const filledCount = treeData.flat().filter(n => n.status === 'filled' || n.status === 'you').length;
  const openCount = treeData.flat().filter(n => n.status === 'open').length;
  const inactiveCount = treeData.flat().filter(n => n.status === 'inactive').length;
  const totalPositions = treeData.flat().length;

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-display text-lg">Matrix Tree</h3>
            <p className="text-xs text-muted-foreground">2×15 structure (showing 4 levels)</p>
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

      {expanded && (
        <div className="space-y-4 overflow-x-auto pb-4">
          {treeData.map((level, levelIndex) => (
            <div key={levelIndex} className="flex flex-col items-center">
              {/* Level label */}
              <span className="text-xs text-muted-foreground mb-2">
                {levelIndex === 0 ? 'You' : `Level ${levelIndex}`}
              </span>
              
              {/* Nodes */}
              <div 
                className="flex items-center justify-center gap-2 sm:gap-4"
                style={{ minWidth: `${level.length * 56}px` }}
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
        Click on any position to see details. Tree updates as positions fill.
      </p>
    </div>
  );
};

export default MatrixTreeVisualization;
