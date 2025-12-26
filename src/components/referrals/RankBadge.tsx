import { cn } from "@/lib/utils";
import { type RankConfig } from "@/lib/rankConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RankBadgeProps {
  rank: RankConfig;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  isActive?: boolean;
  className?: string;
}

const RankBadge = ({ rank, size = 'md', showTooltip = true, isActive = true, className }: RankBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const emojiSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium border transition-all",
        rank.bgColor,
        rank.borderColor,
        rank.color,
        sizeClasses[size],
        !isActive && "opacity-50 grayscale",
        className
      )}
    >
      <span className={emojiSizes[size]}>{rank.emoji}</span>
      <span>{rank.name}</span>
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">{rank.emoji} {rank.name}</div>
            <p className="text-xs text-muted-foreground">{rank.description}</p>
            <div className="text-xs space-y-1 pt-1 border-t border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matrix Depth:</span>
                <span>Levels 1-{rank.matrixLevels}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fast Start:</span>
                <span>{rank.benefits.fastStart ? 'Yes' : 'No'}</span>
              </div>
              {!isActive && (
                <p className="text-amber-500 text-xs mt-2">
                  ⚠️ Rank benefits paused due to inactivity
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RankBadge;
