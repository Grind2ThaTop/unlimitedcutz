import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, Scissors, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RANKS, RANK_ORDER, type RankId, CLIENT_MATRIX_PERCENT, BARBER_MATRIX_PERCENT } from "@/lib/rankConfig";
import { useRank } from "@/hooks/useRank";
import { useAccountRole } from "@/hooks/useAccountRole";
import { cn } from "@/lib/utils";

// Pre-calculated positions per rank (3×8 matrix)
// Level positions: L1=3, L2=9, L3=27, L4=81, L5=243, L6=729, L7=2187, L8=6561
// Cumulative: L1-3=39, L1-4=120, L1-5=363, L1-6=1092, L1-7=3279, L1-8=9840
const RANK_POSITIONS: Record<RankId, number> = {
  rookie: 39,       // L1-3
  hustla: 120,      // L1-4
  grinder: 363,     // L1-5
  influencer: 1092, // L1-6
  executive: 3279,  // L1-7
  partner: 9840,    // L1-8
};

// Calculate totals based on rate
const calculateTotals = (positions: number, rate: number, baseAmount: number) => {
  const perPosition = baseAmount * (rate / 100);
  return positions * perPosition;
};

// Get positions for a level (3^level)
const getPositions = (level: number) => Math.pow(3, level);

const MatrixCommissionTable = () => {
  const [showAddons, setShowAddons] = useState(false);
  const { currentRankId } = useRank();
  const { accountType, matrixPercent, isBarber } = useAccountRole();

  // Generate levels 1-8
  const levels = Array.from({ length: 8 }, (_, i) => i + 1);

  // Check if level is eligible for a rank
  const isEligible = (level: number, rankId: RankId) => {
    return level <= RANKS[rankId].matrixLevels;
  };

  return (
    <div className="space-y-6">
      {/* Role-based Rate Display */}
      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isBarber ? "bg-primary/20" : "bg-blue-500/20"
          )}>
            {isBarber ? (
              <Scissors className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div>
            <p className="font-display text-lg">Your Rate: <span className={isBarber ? "text-primary" : "text-blue-500"}>{matrixPercent}%</span></p>
            <p className="text-sm text-muted-foreground capitalize">{accountType} Account</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Per $50 membership</p>
          <p className="font-display text-xl">${(50 * matrixPercent / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Rate Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-4 rounded-xl border",
          !isBarber ? "bg-blue-500/10 border-blue-500/30" : "bg-card border-border/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            <span className="font-medium">Client Rate</span>
            {!isBarber && <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full">Your rate</span>}
          </div>
          <p className="text-2xl font-display">{CLIENT_MATRIX_PERCENT}%</p>
          <p className="text-sm text-muted-foreground">${(50 * CLIENT_MATRIX_PERCENT / 100).toFixed(2)} per position</p>
        </div>
        <div className={cn(
          "p-4 rounded-xl border",
          isBarber ? "bg-primary/10 border-primary/30" : "bg-card border-border/50"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="w-4 h-4" />
            <span className="font-medium">Barber Rate</span>
            {isBarber && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Your rate</span>}
          </div>
          <p className="text-2xl font-display">{BARBER_MATRIX_PERCENT}%</p>
          <p className="text-sm text-muted-foreground">${(50 * BARBER_MATRIX_PERCENT / 100).toFixed(2)} per position</p>
        </div>
      </div>

      {/* Header Text */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-display text-xl mb-3">This is a 3×8 Matrix</h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Everyone joins the same system. When positions under you fill, you earn.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Our Matrix is <strong className="text-foreground">3 wide</strong> and <strong className="text-foreground">8 levels deep</strong>. 
          It fills automatically using spillover. Bigger structure. Bigger potential.
        </p>
      </div>

      {/* Level Breakdown */}
      <div className="bg-card border border-border/50 rounded-xl p-4">
        <h4 className="font-display text-sm mb-3 text-muted-foreground">Level Breakdown</h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
          {levels.map((level) => (
            <div key={level} className="bg-muted/30 rounded-lg p-2">
              <p className="text-muted-foreground">L{level}</p>
              <p className="font-medium">{getPositions(level).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Total positions (Levels 1–8): <strong className="text-foreground">9,840</strong>
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
                        <span className={cn(
                          "font-medium",
                          isBarber ? "text-primary" : "text-blue-500"
                        )}>{matrixPercent}%</span>
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
                const total = calculateTotals(RANK_POSITIONS[rankId], matrixPercent, 50);
                return (
                  <td 
                    key={rankId} 
                    className={cn(
                      "py-3 px-3 text-center font-display text-base",
                      isBarber ? "text-primary" : "text-blue-500",
                      isCurrentRank && "bg-primary/20"
                    )}
                  >
                    ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  const total = calculateTotals(RANK_POSITIONS[rankId], matrixPercent, 25);
                  return (
                    <td 
                      key={rankId} 
                      className={cn(
                        "py-3 px-3 text-center font-display text-base text-blue-500",
                        isCurrentRank && "bg-blue-500/20"
                      )}
                    >
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  const baseTotal = calculateTotals(RANK_POSITIONS[rankId], matrixPercent, 50);
                  const addonTotal = calculateTotals(RANK_POSITIONS[rankId], matrixPercent, 25);
                  const total = baseTotal + addonTotal;
                  return (
                    <td 
                      key={rankId} 
                      className={cn(
                        "py-3 px-3 text-center font-display text-base text-green-600",
                        isCurrentRank && "bg-green-500/20"
                      )}
                    >
                      ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
        Rates shown are based on your <strong className="capitalize">{accountType}</strong> account ({matrixPercent}%). 
        All calculations use <strong>$50 membership</strong> and <strong>$25 add-on connections</strong>.
      </p>
    </div>
  );
};

export default MatrixCommissionTable;
