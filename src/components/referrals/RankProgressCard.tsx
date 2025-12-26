import { cn } from "@/lib/utils";
import { useRank } from "@/hooks/useRank";
import RankBadge from "./RankBadge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock, ArrowRight, TrendingUp, Users, Zap, Percent, Award } from "lucide-react";
import { getMatchingBonusDisplay, getPoolsDisplay } from "@/lib/rankConfig";

const RankProgressCard = () => {
  const { 
    currentRank, 
    nextRank, 
    isActive, 
    personallyEnrolled, 
    progress,
    additionalRequirements,
    isLoading 
  } = useRank();

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Current Rank Header */}
      <div className={cn("p-6 border-b", currentRank.bgColor, currentRank.borderColor)}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your Current Rank</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentRank.emoji}</span>
              <div>
                <h2 className={cn("font-display text-2xl", currentRank.color)}>{currentRank.name}</h2>
                <p className="text-sm text-muted-foreground">{currentRank.description}</p>
              </div>
            </div>
          </div>
          {!isActive && (
            <div className="bg-amber-500/20 text-amber-500 px-3 py-1.5 rounded-full text-xs font-medium">
              Benefits Paused
            </div>
          )}
        </div>

        {/* Current Benefits */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" />
              Matrix Depth
            </div>
            <p className="font-display text-lg">1-{currentRank.matrixLevels}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Zap className="w-3 h-3" />
              Fast Start
            </div>
            <p className="font-display text-lg text-green-500">Yes</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Percent className="w-3 h-3" />
              Matching
            </div>
            <p className="font-display text-lg">{getMatchingBonusDisplay(currentRank)}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Award className="w-3 h-3" />
              Pools
            </div>
            <p className="font-display text-lg">{getPoolsDisplay(currentRank)}</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Rank */}
      {nextRank && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Next Rank:</span>
            <RankBadge rank={nextRank} size="sm" showTooltip={false} />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Personal Enrollments</span>
              <span className="font-medium">{personallyEnrolled} / {nextRank.requirements.personallyEnrolled}</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress.percentage}% complete
            </p>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {personallyEnrolled >= nextRank.requirements.personallyEnrolled ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Users className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={personallyEnrolled >= nextRank.requirements.personallyEnrolled ? "text-green-500" : ""}>
                {nextRank.requirements.personallyEnrolled} personally enrolled active members
              </span>
            </div>

            {additionalRequirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{req}</span>
              </div>
            ))}
          </div>

          {/* What You'll Unlock */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">What you'll unlock:</p>
            <div className="flex flex-wrap gap-2">
              {nextRank.matrixLevels > currentRank.matrixLevels && (
                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                  +{nextRank.matrixLevels - currentRank.matrixLevels} Matrix Level{nextRank.matrixLevels - currentRank.matrixLevels > 1 ? 's' : ''}
                </span>
              )}
              {!currentRank.benefits.matching && nextRank.benefits.matching && (
                <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded">
                  Matching Bonus
                </span>
              )}
              {nextRank.benefits.influencerBonuses && !currentRank.benefits.influencerBonuses && (
                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                  Influencer Bonuses
                </span>
              )}
              {nextRank.benefits.pools.length > currentRank.benefits.pools.length && (
                <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
                  {nextRank.benefits.pools.filter(p => !currentRank.benefits.pools.includes(p)).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ')} Pool
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Max Rank Message */}
      {!nextRank && (
        <div className="p-6 text-center">
          <Award className="w-12 h-12 mx-auto text-purple-500 mb-2" />
          <p className="font-display text-lg">You've reached the top!</p>
          <p className="text-sm text-muted-foreground">
            You're at the highest rank with full benefits unlocked.
          </p>
        </div>
      )}
    </div>
  );
};

export default RankProgressCard;
