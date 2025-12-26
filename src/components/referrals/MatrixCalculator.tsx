import { useState, useMemo } from "react";
import { Calculator, Info } from "lucide-react";
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

// Rank configuration with max positions
const RANKS = [
  { name: 'Unranked', paidLevels: 12, maxPositions: 8190 },
  { name: 'Bronze', paidLevels: 13, maxPositions: 16382 },
  { name: 'Silver', paidLevels: 13, maxPositions: 16382 },
  { name: 'Gold', paidLevels: 14, maxPositions: 32766 },
  { name: 'Platinum', paidLevels: 14, maxPositions: 32766 },
  { name: 'Diamond', paidLevels: 15, maxPositions: 65534 },
];

const BASE_COMMISSION = 1.25; // 2.5% of $50
const ADDON_COMMISSION = 0.625; // 2.5% of $25

const MatrixCalculator = () => {
  const [selectedRank, setSelectedRank] = useState('Unranked');
  const [baseMembers, setBaseMembers] = useState<string>('');
  const [addonConnections, setAddonConnections] = useState<string>('');

  const currentRank = RANKS.find(r => r.name === selectedRank) || RANKS[0];

  const calculation = useMemo(() => {
    const base = parseInt(baseMembers) || 0;
    const addon = parseInt(addonConnections) || 0;
    
    // Cap at max positions for rank
    const cappedBase = Math.min(base, currentRank.maxPositions);
    const cappedAddon = Math.min(addon, currentRank.maxPositions);
    
    const baseEarnings = cappedBase * BASE_COMMISSION;
    const addonEarnings = cappedAddon * ADDON_COMMISSION;
    const total = baseEarnings + addonEarnings;
    
    return {
      baseEarnings,
      addonEarnings,
      total,
      cappedBase,
      cappedAddon,
      wasCapped: base > currentRank.maxPositions || addon > currentRank.maxPositions,
    };
  }, [baseMembers, addonConnections, currentRank]);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl">Matrix Income Calculator</h3>
          <p className="text-sm text-muted-foreground">Estimate your monthly matrix commissions</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Rank Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="rank">Your Rank</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Your rank determines how many levels you can earn from. Higher ranks unlock more levels.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={selectedRank} onValueChange={setSelectedRank}>
            <SelectTrigger id="rank">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANKS.map((rank) => (
                <SelectItem key={rank.name} value={rank.name}>
                  {rank.name} (L1-{rank.paidLevels})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Max positions: {currentRank.maxPositions.toLocaleString()}
          </p>
        </div>

        {/* Base Members Input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="base-members">Base Members</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
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
            max={currentRank.maxPositions}
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
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
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
            max={currentRank.maxPositions}
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
            * Values capped at max positions for {selectedRank} rank
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
