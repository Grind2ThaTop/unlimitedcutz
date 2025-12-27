import { useRank } from "@/hooks/useRank";
import { useAccountRole } from "@/hooks/useAccountRole";
import { Bug, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANKS, RANK_ORDER, type RankId } from "@/lib/rankConfig";

const BarberQualificationDebug = () => {
  const { 
    currentRankId,
    personalDownlineBronze,
    personalDownlineSilver,
    personalDownlineGold,
    personalDownlinePlatinum,
    maxPayableLevel,
    commissionRate,
    isLoading 
  } = useRank();
  
  const { isBarber } = useAccountRole();

  // Only show for barbers
  if (!isBarber) return null;

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  // Calculate next rank requirement
  const getNextRankInfo = (): { needed: string; progress: string } | null => {
    const currentIndex = RANK_ORDER.indexOf(currentRankId);
    if (currentIndex >= RANK_ORDER.length - 1) return null;
    
    const nextRankId = RANK_ORDER[currentIndex + 1];
    
    switch (nextRankId) {
      case 'silver':
        return { 
          needed: `${2 - personalDownlineBronze} more Bronze`,
          progress: `${personalDownlineBronze}/2 Bronze`
        };
      case 'gold':
        return { 
          needed: `${2 - personalDownlineSilver} more Silver`,
          progress: `${personalDownlineSilver}/2 Silver`
        };
      case 'platinum':
        return { 
          needed: `${2 - personalDownlineGold} more Gold`,
          progress: `${personalDownlineGold}/2 Gold`
        };
      case 'diamond':
        return { 
          needed: `${2 - personalDownlinePlatinum} more Platinum`,
          progress: `${personalDownlinePlatinum}/2 Platinum`
        };
      default:
        return null;
    }
  };

  const nextRankInfo = getNextRankInfo();

  return (
    <div className="bg-card border border-amber-500/30 rounded-xl overflow-hidden">
      <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2">
        <Bug className="w-4 h-4 text-amber-500" />
        <h4 className="font-display text-sm text-amber-500">Rank Qualification Debug</h4>
      </div>
      
      <div className="p-4">
        {/* Personal Downline Counts */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Personal Downline Counts (for rank)</p>
          <div className="grid grid-cols-4 gap-2">
            {(['bronze', 'silver', 'gold', 'platinum'] as RankId[]).map(rank => {
              const config = RANKS[rank];
              const count = rank === 'bronze' ? personalDownlineBronze 
                : rank === 'silver' ? personalDownlineSilver
                : rank === 'gold' ? personalDownlineGold
                : personalDownlinePlatinum;
              return (
                <div key={rank} className={cn("text-center p-2 rounded-lg", config.bgColor)}>
                  <p className="text-lg font-display">{count}</p>
                  <p className="text-xs">{config.emoji}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">Current Rank</span>
            <span className="font-mono font-medium uppercase flex items-center gap-2">
              {RANKS[currentRankId]?.emoji} {currentRankId}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">Max Paid Level</span>
            <span className="font-mono font-medium">{maxPayableLevel}</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-muted-foreground">Commission Rate</span>
            <span className="font-mono font-medium text-primary">{commissionRate}%</span>
          </div>

          {nextRankInfo && (
            <div className="flex items-center justify-between py-2 bg-primary/10 rounded-lg px-3 mt-3">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Next Rank
              </span>
              <span className="font-medium text-primary">
                Need {nextRankInfo.needed}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarberQualificationDebug;
