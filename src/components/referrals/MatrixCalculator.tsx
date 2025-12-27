import { useState, useMemo, forwardRef } from "react";
import { Calculator, Info, LucideProps } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RANKS, RANK_ORDER, type RankId } from "@/lib/rankConfig";

// Wrap Info icon to forward refs properly for Tooltip
const InfoIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <Info ref={ref} {...props} />
));

// Pre-calculated max positions for 3×8 matrix by rank
// L1=3, L2=9, L3=27, L4=81, L5=243, L6=729, L7=2187, L8=6561
const RANK_MAX_POSITIONS: Record<RankId, { levels: number; maxPositions: number }> = {
  bronze: { levels: 3, maxPositions: 39 },       // 3+9+27
  silver: { levels: 4, maxPositions: 120 },      // 3+9+27+81
  gold: { levels: 5, maxPositions: 363 },        // +243
  platinum: { levels: 6, maxPositions: 1092 },   // +729
  diamond: { levels: 8, maxPositions: 9840 },    // Full 8 levels
};

const BASE_COMMISSION = 1.25; // 2.5% of $50
const ADDON_COMMISSION = 0.625; // 2.5% of $25

const MatrixCalculator = () => {
  const [selectedRank, setSelectedRank] = useState<RankId>('bronze');
  const [baseMembers, setBaseMembers] = useState<string>('');
  const [addonConnections, setAddonConnections] = useState<string>('');

  const currentRankConfig = RANK_MAX_POSITIONS[selectedRank];

  const calculation = useMemo(() => {
    const base = parseInt(baseMembers) || 0;
    const addon = parseInt(addonConnections) || 0;
    
    // Cap at max positions for rank
    const cappedBase = Math.min(base, currentRankConfig.maxPositions);
    const cappedAddon = Math.min(addon, currentRankConfig.maxPositions);
    
    const baseEarnings = cappedBase * BASE_COMMISSION;
    const addonEarnings = cappedAddon * ADDON_COMMISSION;
    const total = baseEarnings + addonEarnings;
    
    return {
      baseEarnings,
      addonEarnings,
      total,
      cappedBase,
      cappedAddon,
      wasCapped: base > currentRankConfig.maxPositions || addon > currentRankConfig.maxPositions,
    };
  }, [baseMembers, addonConnections, currentRankConfig]);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl">Matrix Income Calculator</h3>
          <p className="text-sm text-muted-foreground">Estimate your monthly 3×8 matrix commissions</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Rank Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="rank">Your Rank</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <InfoIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Your rank determines how many levels you can earn from. Higher ranks unlock more levels.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={selectedRank} onValueChange={(val) => setSelectedRank(val as RankId)}>
            <SelectTrigger id="rank">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANK_ORDER.map((rankId) => {
                const rank = RANKS[rankId];
                const config = RANK_MAX_POSITIONS[rankId];
                return (
                  <SelectItem key={rankId} value={rankId}>
                    {rank.emoji} {rank.name} (L1-{config.levels})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Max positions: {currentRankConfig.maxPositions.toLocaleString()}
          </p>
        </div>

        {/* Base Members Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="base-members">Base Members</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <InfoIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Number of paying $50/month base members in your eligible matrix levels.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="base-members"
            type="number"
            min="0"
            max={currentRankConfig.maxPositions}
            placeholder="0"
            value={baseMembers}
            onChange={(e) => setBaseMembers(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            × $1.25 each
          </p>
        </div>

        {/* Add-on Connections Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="addon-connections">Add-on Connections</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <InfoIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Number of paying $25/month add-on connections in your eligible matrix levels.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="addon-connections"
            type="number"
            min="0"
            max={currentRankConfig.maxPositions}
            placeholder="0"
            value={addonConnections}
            onChange={(e) => setAddonConnections(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            × $0.625 each
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="bg-muted/50 rounded-xl p-5">
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Base Earnings</p>
            <p className="font-display text-2xl text-primary">
              ${calculation.baseEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Add-on Earnings</p>
            <p className="font-display text-2xl text-blue-500">
              ${calculation.addonEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Monthly Total</p>
            <p className="font-display text-3xl text-green-600">
              ${calculation.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {calculation.wasCapped && (
          <p className="text-xs text-amber-500 text-center mb-3">
            * Values capped at max positions for {RANKS[selectedRank].name} rank
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          <strong>Formula:</strong> (Base Members × $1.25) + (Add-ons × $0.625)
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-4 italic">
        Estimates only. Earnings depend on active paying members and rank eligibility.
      </p>
    </div>
  );
};

export default MatrixCalculator;