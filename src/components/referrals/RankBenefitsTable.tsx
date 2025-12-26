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
          Your rank controls how deep you get paid. Stay active. Build consistently. Move up.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-3 px-4 text-left font-display">Rank</th>
              <th className="py-3 px-4 text-center font-display">Matrix Levels</th>
              <th className="py-3 px-4 text-center font-display">Fast Start</th>
              <th className="py-3 px-4 text-center font-display">Matching</th>
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
                    <span className="font-mono">1-{rank.matrixLevels}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rank.benefits.fastStart ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      rank.benefits.matching ? "text-purple-500 font-medium" : "text-muted-foreground"
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

      <div className="p-4 bg-muted/30 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Ranks are earned monthly and must be maintained. Benefits pause when inactive.
        </p>
      </div>
    </div>
  );
};

export default RankBenefitsTable;
