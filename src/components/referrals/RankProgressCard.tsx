import { cn } from "@/lib/utils";
import { useRank } from "@/hooks/useRank";
import { useAccountRole } from "@/hooks/useAccountRole";
import RankBadge from "./RankBadge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock, ArrowRight, TrendingUp, Zap, Percent, Award, Users, Star } from "lucide-react";
import { getMatchingBonusDisplay, getPoolsDisplay } from "@/lib/rankConfig";

const RankProgressCard = () => {
  const { 
    currentRank, 
    nextRank, 
    isActive, 
    progress,
    maxPayableLevel,
    commissionRate,
    personalActiveDirects,
    pamHasSilver,
    pamHasGold,
    pamHasPlatinum,
    pamHasDiamond,
    isLoading 
  } = useRank();
  
  const { isBarber } = useAccountRole();

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  // Get the PAM status for the next rank
  const getPamStatusForNextRank = () => {
    if (!nextRank || !isBarber) return null;
    
    const rankToCheck = nextRank.requirements.pamHasRank;
    if (!rankToCheck) return null;
    
    switch (rankToCheck) {
      case 'silver': return pamHasSilver;
      case 'gold': return pamHasGold;
      case 'platinum': return pamHasPlatinum;
      case 'diamond': return pamHasDiamond;
      default: return false;
    }
  };

  const pamStatus = getPamStatusForNextRank();

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
              Commission Depth
            </div>
            <p className="font-display text-lg">Levels 1-{maxPayableLevel}</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Star className="w-3 h-3" />
              Commission Rate
            </div>
            <p className="font-display text-lg text-primary">{commissionRate}%</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Percent className="w-3 h-3" />
              Matching Bonus
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
              <span className="text-muted-foreground">{progress.label}</span>
              <span className="font-medium">{progress.current} / {progress.required}</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress.percentage}% complete
            </p>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            {/* Personal Active Directs requirement (for barbers) */}
            {isBarber && nextRank.requirements.personalActiveDirects && (
              <div className="flex items-center gap-2 text-sm">
                {personalActiveDirects >= nextRank.requirements.personalActiveDirects ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Users className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={personalActiveDirects >= nextRank.requirements.personalActiveDirects ? "text-green-500" : ""}>
                  {nextRank.requirements.personalActiveDirects} Personal Active Directs ({personalActiveDirects}/{nextRank.requirements.personalActiveDirects})
                </span>
              </div>
            )}

            {/* PAM Has Rank requirement (for barbers) */}
            {isBarber && nextRank.requirements.pamHasRank && (
              <div className="flex items-center gap-2 text-sm">
                {pamStatus ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Users className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={pamStatus ? "text-green-500" : ""}>
                  1 {nextRank.requirements.pamHasRank.toUpperCase()} member in your personal team
                </span>
              </div>
            )}

            {/* Standard qualification text (for clients) */}
            {!isBarber && (
              <div className="flex items-center gap-2 text-sm">
                {progress.current >= progress.required ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Users className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={progress.current >= progress.required ? "text-green-500" : ""}>
                  {nextRank.qualificationText}
                </span>
              </div>
            )}

            {nextRank.requirements.adminApproval && (
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Admin approval required</span>
              </div>
            )}
          </div>

          {/* What You'll Unlock */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">What you'll unlock:</p>
            <div className="flex flex-wrap gap-2">
              {(isBarber ? nextRank.barberMatrixLevels : nextRank.matrixLevels) > maxPayableLevel && (
                <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                  +{(isBarber ? nextRank.barberMatrixLevels : nextRank.matrixLevels) - maxPayableLevel} Commission Level{(isBarber ? nextRank.barberMatrixLevels : nextRank.matrixLevels) - maxPayableLevel > 1 ? 's' : ''}
                </span>
              )}
              {nextRank.benefits.matchingDepth > currentRank.benefits.matchingDepth && (
                <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded">
                  {currentRank.benefits.matchingDepth === 0 
                    ? `Matching Bonus (${nextRank.benefits.matchingDepth} levels)` 
                    : `+${nextRank.benefits.matchingDepth - currentRank.benefits.matchingDepth} Matching Level`
                  }
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
            {isBarber 
              ? `Full ${maxPayableLevel}-level matrix at ${commissionRate}% and ${currentRank.benefits.matchingDepth}-level matching unlocked.`
              : 'Full 8-level matrix commissions and 4-level matching unlocked.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RankProgressCard;
