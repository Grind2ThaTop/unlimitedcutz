import { cn } from "@/lib/utils";
import { useRank } from "@/hooks/useRank";
import { RANKS, RANK_ORDER, getMatchingBonusDisplay, getPoolsDisplay } from "@/lib/rankConfig";
import { Check, X } from "lucide-react";

const RankBenefitsTable = () => {
  const { currentRankId, isLoading } = useRank();

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <h3 className="font-display text-xl">Rank Benefits Overview</h3>
        <p className="text-sm text-muted-foreground">
          Your rank controls how deep you get paid. Build your downline to unlock more levels.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-3 px-4 text-left font-display">Rank</th>
              <th className="py-3 px-4 text-center font-display">Commission Depth</th>
              <th className="py-3 px-4 text-center font-display">Qualification</th>
              <th className="py-3 px-4 text-center font-display">Matching Bonus</th>
              <th className="py-3 px-4 text-center font-display">Pools</th>
            </tr>
          </thead>
          <tbody>
            {RANK_ORDER.map((rankId) => {
              const rank = RANKS[rankId];
              const isCurrentRank = rankId === currentRankId;
              
              return (
                <tr 
                  key={rankId}
                  className={cn(
                    "border-b border-border/30 transition-colors",
                    isCurrentRank ? `${rank.bgColor} ${rank.borderColor} border-l-4` : "hover:bg-muted/30"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rank.emoji}</span>
                      <div>
                        <span className={cn("font-medium", isCurrentRank && rank.color)}>
                          {rank.name}
                        </span>
                        {isCurrentRank && (
                          <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono">Levels 1-{rank.matrixLevels}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs text-muted-foreground">
                      {rank.qualificationText}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      rank.benefits.matchingDepth > 0 ? "text-purple-500 font-medium" : "text-muted-foreground"
                    )}>
                      {getMatchingBonusDisplay(rank)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      rank.benefits.pools.length > 0 ? "text-amber-500 font-medium" : "text-muted-foreground"
                    )}>
                      {getPoolsDisplay(rank)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-muted/30 border-t border-border/50 space-y-1">
        <p className="text-xs text-muted-foreground text-center">
          Ranks are earned by building your downline with active members of specific ranks.
        </p>
        <p className="text-xs text-muted-foreground text-center">
          If qualification drops, deeper commission levels pause until restored. Matrix placement is never removed.
        </p>
      </div>
    </div>
  );
};

export default RankBenefitsTable;
