import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RANKS, RANK_ORDER, type RankId } from "@/lib/rankConfig";
import { useRank } from "@/hooks/useRank";
import { cn } from "@/lib/utils";

// Pre-calculated totals for each rank (locked values)
const RANK_TOTALS: Record<RankId, { baseTotal: number; addonTotal: number }> = {
  rookie: { baseTotal: 10237.50, addonTotal: 5118.75 },
  hustla: { baseTotal: 20477.50, addonTotal: 10238.75 },
  grinder: { baseTotal: 20477.50, addonTotal: 10238.75 },
  influencer: { baseTotal: 40957.50, addonTotal: 20478.75 },
  executive: { baseTotal: 81917.50, addonTotal: 40958.75 },
  partner: { baseTotal: 81917.50, addonTotal: 40958.75 },
};

const COMMISSION_RATE = "2.50%";

const MatrixCommissionTable = () => {
  const [showAddons, setShowAddons] = useState(false);
  const { currentRankId } = useRank();

  // Generate levels 1-15
  const levels = Array.from({ length: 15 }, (_, i) => i + 1);

  // Check if level is eligible for a rank
  const isEligible = (level: number, rankId: RankId) => {
    return level <= RANKS[rankId].matrixLevels;
  };

  // Get positions for a level (2^level)
  const getPositions = (level: number) => Math.pow(2, level);

  return (
    <div className="space-y-6">
      {/* Header Text */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-display text-xl mb-3">How the Matrix Works</h3>
        <p className="text-muted-foreground leading-relaxed">
          When you lock in your position, you're placed into our fast-filling <strong className="text-foreground">2×15 Matrix</strong>. 
          As new members join each week, they're placed under existing positions using forced spillover. 
          The earlier you lock your position, the higher you sit in the Matrix.
        </p>
      </div>

      {/* Add-on Toggle */}
      <div className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="addon-toggle" className="text-sm font-medium">
            Show Add-on Connection Earnings
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Add-on connections are $25/month each. Toggle to see earnings from both base memberships and add-ons.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          id="addon-toggle"
          checked={showAddons}
          onCheckedChange={setShowAddons}
        />
      </div>

      {/* Commission Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-secondary text-secondary-foreground">
              <th className="py-3 px-3 text-left font-display text-base">Level</th>
              <th className="py-3 px-3 text-center font-display text-base">Positions</th>
              {RANK_ORDER.map((rankId) => {
                const rank = RANKS[rankId];
                const isCurrentRank = rankId === currentRankId;
                return (
                  <th 
                    key={rankId} 
                    className={cn(
                      "py-3 px-3 text-center font-display text-base",
                      isCurrentRank && "bg-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{rank.emoji}</span>
                      <span className="hidden sm:inline">{rank.name}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr 
                key={level} 
                className={`border-b border-border/30 ${level % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'}`}
              >
                <td className="py-2.5 px-3 font-medium">Level {level}</td>
                <td className="py-2.5 px-3 text-center text-muted-foreground">
                  {getPositions(level).toLocaleString()}
                </td>
                {RANK_ORDER.map((rankId) => {
                  const isCurrentRank = rankId === currentRankId;
                  return (
                    <td 
                      key={rankId} 
                      className={cn(
                        "py-2.5 px-3 text-center",
                        isCurrentRank && "bg-primary/10"
                      )}
                    >
                      {isEligible(level, rankId) ? (
                        <span className="text-primary font-medium">{COMMISSION_RATE}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Totals Row - Base Membership */}
          <tfoot>
            <tr className="bg-primary/10 border-t-2 border-primary/30">
              <td className="py-3 px-3 font-display text-base" colSpan={2}>
                Total (Base $50/mo)
              </td>
              {RANK_ORDER.map((rankId) => {
                const isCurrentRank = rankId === currentRankId;
                return (
                  <td 
                    key={rankId} 
                    className={cn(
                      "py-3 px-3 text-center font-display text-base text-primary",
                      isCurrentRank && "bg-primary/20"
                    )}
                  >
                    ${RANK_TOTALS[rankId].baseTotal.toLocaleString()}
                  </td>
                );
              })}
            </tr>
            {/* Add-on Totals Row */}
            {showAddons && (
              <tr className="bg-blue-500/10 border-t border-blue-500/30">
                <td className="py-3 px-3 font-display text-base" colSpan={2}>
                  Total (Add-on $25/mo)
                </td>
                {RANK_ORDER.map((rankId) => {
                  const isCurrentRank = rankId === currentRankId;
                  return (
                    <td 
                      key={rankId} 
                      className={cn(
                        "py-3 px-3 text-center font-display text-base text-blue-500",
                        isCurrentRank && "bg-blue-500/20"
                      )}
                    >
                      ${RANK_TOTALS[rankId].addonTotal.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            )}
            {/* Combined Totals Row */}
            {showAddons && (
              <tr className="bg-green-500/10 border-t border-green-500/30">
                <td className="py-3 px-3 font-display text-base" colSpan={2}>
                  Combined Total
                </td>
                {RANK_ORDER.map((rankId) => {
                  const isCurrentRank = rankId === currentRankId;
                  const total = RANK_TOTALS[rankId].baseTotal + RANK_TOTALS[rankId].addonTotal;
                  return (
                    <td 
                      key={rankId} 
                      className={cn(
                        "py-3 px-3 text-center font-display text-base text-green-600",
                        isCurrentRank && "bg-green-500/20"
                      )}
                    >
                      ${total.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Footer Note */}
      <p className="text-sm text-muted-foreground text-center">
        All percentages are based on our monthly <strong>$50 membership</strong> and <strong>$25 add-on connections</strong>.
      </p>
    </div>
  );
};

export default MatrixCommissionTable;
