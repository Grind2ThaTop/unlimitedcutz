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

// Rank configuration with locked totals
const RANKS = [
  { name: 'Unranked', paidLevels: 12, positions: 8190, baseTotal: 10237.50, addonTotal: 5118.75 },
  { name: 'Bronze', paidLevels: 13, positions: 16382, baseTotal: 20477.50, addonTotal: 10238.75 },
  { name: 'Silver', paidLevels: 13, positions: 16382, baseTotal: 20477.50, addonTotal: 10238.75 },
  { name: 'Gold', paidLevels: 14, positions: 32766, baseTotal: 40957.50, addonTotal: 20478.75 },
  { name: 'Platinum', paidLevels: 14, positions: 32766, baseTotal: 40957.50, addonTotal: 20478.75 },
  { name: 'Diamond', paidLevels: 15, positions: 65534, baseTotal: 81917.50, addonTotal: 40958.75 },
];

const COMMISSION_RATE = "2.50%";

const MatrixCommissionTable = () => {
  const [showAddons, setShowAddons] = useState(false);

  // Generate levels 1-15
  const levels = Array.from({ length: 15 }, (_, i) => i + 1);

  // Check if level is eligible for a rank
  const isEligible = (level: number, rankIndex: number) => {
    return level <= RANKS[rankIndex].paidLevels;
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
              {RANKS.map((rank) => (
                <th key={rank.name} className="py-3 px-3 text-center font-display text-base">
                  {rank.name}
                </th>
              ))}
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
                {RANKS.map((rank, rankIndex) => (
                  <td key={rank.name} className="py-2.5 px-3 text-center">
                    {isEligible(level, rankIndex) ? (
                      <span className="text-primary font-medium">{COMMISSION_RATE}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* Totals Row - Base Membership */}
          <tfoot>
            <tr className="bg-primary/10 border-t-2 border-primary/30">
              <td className="py-3 px-3 font-display text-base" colSpan={2}>
                Total (Base $50/mo)
              </td>
              {RANKS.map((rank) => (
                <td key={rank.name} className="py-3 px-3 text-center font-display text-base text-primary">
                  ${rank.baseTotal.toLocaleString()}
                </td>
              ))}
            </tr>
            {/* Add-on Totals Row */}
            {showAddons && (
              <tr className="bg-blue-500/10 border-t border-blue-500/30">
                <td className="py-3 px-3 font-display text-base" colSpan={2}>
                  Total (Add-on $25/mo)
                </td>
                {RANKS.map((rank) => (
                  <td key={rank.name} className="py-3 px-3 text-center font-display text-base text-blue-500">
                    ${rank.addonTotal.toLocaleString()}
                  </td>
                ))}
              </tr>
            )}
            {/* Combined Totals Row */}
            {showAddons && (
              <tr className="bg-green-500/10 border-t border-green-500/30">
                <td className="py-3 px-3 font-display text-base" colSpan={2}>
                  Combined Total
                </td>
                {RANKS.map((rank) => (
                  <td key={rank.name} className="py-3 px-3 text-center font-display text-base text-green-600">
                    ${(rank.baseTotal + rank.addonTotal).toLocaleString()}
                  </td>
                ))}
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
