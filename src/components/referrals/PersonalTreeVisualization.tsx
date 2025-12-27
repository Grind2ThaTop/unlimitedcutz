import { useState, useEffect } from "react";
import { Users, User, UserCheck, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
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
import { RANKS, type RankId } from "@/lib/rankConfig";

interface PersonalNodeData {
  id: string;
  full_name: string | null;
  email: string;
  referred_by: string | null;
  memberRank?: {
    current_rank: RankId;
    is_active: boolean;
  } | null;
}

interface TreeNodeData {
  id: string;
  status: 'you' | 'active' | 'inactive';
  name: string;
  rank: RankId;
  isActive: boolean;
  children: TreeNodeData[];
}

// Get rank color styling
const getRankStyle = (rank: RankId) => {
  const rankConfig = RANKS[rank];
  return {
    bgColor: rankConfig?.bgColor || 'bg-amber-700/10',
    borderColor: rankConfig?.borderColor || 'border-amber-700/20',
    textColor: rankConfig?.color || 'text-amber-700',
  };
};

const NodePopover = ({ node }: { node: TreeNodeData }) => {
  const rankStyle = getRankStyle(node.rank);
  const rankConfig = RANKS[node.rank];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer flex-shrink-0 border-2",
            node.status === 'you' 
              ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
              : node.isActive 
                ? `${rankStyle.bgColor} ${rankStyle.textColor} border-current`
                : 'bg-muted/50 text-muted-foreground border-muted-foreground/30'
          )}
        >
          {node.status === 'you' ? (
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
              node.status === 'you'
                ? 'bg-primary text-primary-foreground'
                : `${rankStyle.bgColor} ${rankStyle.textColor}`
            )}>
              {node.status === 'you' ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-medium text-sm">{node.name}</p>
              <p className="text-xs text-muted-foreground">
                {rankConfig?.emoji} {rankConfig?.name || 'Bronze'}
              </p>
            </div>
          </div>
          <div className="text-xs space-y-1 pt-2 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={node.isActive ? 'text-green-500' : 'text-amber-500'}>
                {node.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rank:</span>
              <span>{rankConfig?.name || 'Bronze'}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Recursive tree rendering
const TreeBranch = ({ node, depth = 0, maxDepth = 4 }: { 
  node: TreeNodeData; 
  depth?: number;
  maxDepth?: number;
}) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const showExpander = hasChildren && depth < maxDepth;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 py-1">
        {/* Indent based on depth */}
        {depth > 0 && (
          <div 
            className="border-l border-border/50 ml-4" 
            style={{ width: `${depth * 16}px`, height: '100%' }}
          />
        )}
        
        {/* Expand/collapse button */}
        {showExpander ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 -rotate-90" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        
        {/* Node */}
        <NodePopover node={node} />
        
        {/* Name and rank */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{node.name}</p>
          <p className="text-xs text-muted-foreground">
            {RANKS[node.rank]?.emoji} {RANKS[node.rank]?.name}
            {!node.isActive && ' (Inactive)'}
          </p>
        </div>
      </div>
      
      {/* Children */}
      {expanded && hasChildren && depth < maxDepth && (
        <div className="ml-6 border-l border-border/30">
          {node.children.map(child => (
            <TreeBranch key={child.id} node={child} depth={depth + 1} maxDepth={maxDepth} />
          ))}
        </div>
      )}
    </div>
  );
};

// Build personal tree from profiles data
const buildPersonalTree = (
  profiles: PersonalNodeData[], 
  userId: string,
  rankMap: Map<string, { current_rank: RankId; is_active: boolean }>
): TreeNodeData | null => {
  const userProfile = profiles.find(p => p.id === userId);
  if (!userProfile) return null;

  const childrenMap = new Map<string, PersonalNodeData[]>();
  profiles.forEach(p => {
    if (p.referred_by) {
      const existing = childrenMap.get(p.referred_by) || [];
      existing.push(p);
      childrenMap.set(p.referred_by, existing);
    }
  });

  const buildNode = (profile: PersonalNodeData, isUser: boolean = false): TreeNodeData => {
    const rankData = rankMap.get(profile.id);
    const children = childrenMap.get(profile.id) || [];
    
    return {
      id: profile.id,
      status: isUser ? 'you' : (rankData?.is_active ? 'active' : 'inactive'),
      name: isUser ? 'You' : (profile.full_name || profile.email.split('@')[0]),
      rank: (rankData?.current_rank as RankId) || 'bronze',
      isActive: rankData?.is_active ?? true,
      children: children.map(c => buildNode(c)),
    };
  };

  return buildNode(userProfile, true);
};

// Count ranks in tree
const countRanks = (node: TreeNodeData): Record<RankId, number> => {
  const counts: Record<RankId, number> = {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
  };

  const countNode = (n: TreeNodeData, isRoot: boolean = false) => {
    if (!isRoot && n.isActive) {
      counts[n.rank] = (counts[n.rank] || 0) + 1;
    }
    n.children.forEach(c => countNode(c));
  };

  countNode(node, true);
  return counts;
};

// Get total count
const getTotalCount = (node: TreeNodeData): number => {
  let count = 0;
  const countNode = (n: TreeNodeData, isRoot: boolean = false) => {
    if (!isRoot) count++;
    n.children.forEach(c => countNode(c));
  };
  countNode(node, true);
  return count;
};

const PersonalTreeVisualization = () => {
  const [expanded, setExpanded] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all profiles in personal downline
  const { data: treeData, isLoading } = useQuery({
    queryKey: ['personalTree', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get all profiles (we need to traverse the referral tree)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, referred_by');
      
      if (profilesError) throw profilesError;
      if (!profiles) return null;

      // Get all member ranks
      const { data: ranks, error: ranksError } = await supabase
        .from('member_ranks')
        .select('user_id, current_rank, is_active');
      
      if (ranksError) throw ranksError;

      const rankMap = new Map(
        (ranks || []).map(r => [r.user_id, { 
          current_rank: r.current_rank as RankId, 
          is_active: r.is_active 
        }])
      );

      // Build tree starting from current user
      const tree = buildPersonalTree(profiles, user.id, rankMap);
      return tree;
    },
    enabled: !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('personal-tree-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['personalTree', user.id] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'member_ranks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['personalTree', user.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const rankCounts = treeData ? countRanks(treeData) : { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
  const totalDownline = treeData ? getTotalCount(treeData) : 0;

  // Calculate next rank requirement
  const getNextRankMessage = (): string => {
    if (rankCounts.bronze < 2) return `Need ${2 - rankCounts.bronze} more Bronze to reach Silver`;
    if (rankCounts.silver < 2) return `Need ${2 - rankCounts.silver} more Silver to reach Gold`;
    if (rankCounts.gold < 2) return `Need ${2 - rankCounts.gold} more Gold to reach Platinum`;
    if (rankCounts.platinum < 2) return `Need ${2 - rankCounts.platinum} more Platinum to reach Diamond`;
    return 'You have qualified for Diamond rank!';
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-display text-lg">Your Personal Tree</h3>
            <p className="text-xs text-muted-foreground">Referral line used for rank advancement</p>
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

      {/* Info Box */}
      <div className="bg-background/50 rounded-lg p-3 mb-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Personal Tree = Referral Line
        </p>
        <p>This shows people YOU personally referred and their referrals. Your rank is based ONLY on this tree (not global matrix placements).</p>
      </div>

      {/* Next Rank Requirement */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-primary">{getNextRankMessage()}</p>
      </div>

      {/* Rank Breakdown Stats */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as RankId[]).map(rank => {
          const config = RANKS[rank];
          return (
            <div key={rank} className={cn("text-center p-2 rounded-lg", config.bgColor)}>
              <p className="text-lg font-display">{rankCounts[rank]}</p>
              <p className="text-xs">{config.emoji}</p>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : expanded && treeData ? (
        <div className="bg-background/30 rounded-lg p-4 max-h-96 overflow-y-auto">
          <TreeBranch node={treeData} maxDepth={5} />
        </div>
      ) : !treeData ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No referrals yet</p>
          <p className="text-xs">Share your referral link to start building your Personal Tree</p>
        </div>
      ) : null}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-2xl font-display text-purple-500">{totalDownline}</p>
          <p className="text-xs text-muted-foreground">Total in Personal Downline</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-green-500">
            {Object.values(rankCounts).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Active Members</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalTreeVisualization;
