import { useRank } from "@/hooks/useRank";
import { useAccountRole } from "@/hooks/useAccountRole";
import { CheckCircle, XCircle, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

const BarberQualificationDebug = () => {
  const { 
    currentRankId,
    personalActiveDirects,
    pamHasSilver,
    pamHasGold,
    pamHasPlatinum,
    pamHasDiamond,
    maxPayableLevel,
    commissionRate,
    isLoading 
  } = useRank();
  
  const { isBarber } = useAccountRole();

  // Only show for barbers
  if (!isBarber) return null;

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  const BoolIndicator = ({ value, label }: { value: boolean; label: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {value ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={cn("text-sm font-mono", value ? "text-green-500" : "text-muted-foreground")}>
          {value ? "TRUE" : "FALSE"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-amber-500/30 rounded-xl overflow-hidden">
      <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2">
        <Bug className="w-4 h-4 text-amber-500" />
        <h4 className="font-display text-sm text-amber-500">Qualification Debug (PAM)</h4>
      </div>
      
      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Personal Active Directs</span>
          <span className="text-sm font-mono font-medium">{personalActiveDirects}</span>
        </div>
        
        <BoolIndicator value={pamHasSilver} label="PAM Has Silver" />
        <BoolIndicator value={pamHasGold} label="PAM Has Gold" />
        <BoolIndicator value={pamHasPlatinum} label="PAM Has Platinum" />
        <BoolIndicator value={pamHasDiamond} label="PAM Has Diamond" />
        
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Current Rank</span>
          <span className="text-sm font-mono font-medium uppercase">{currentRankId}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">Max Paid Level</span>
          <span className="text-sm font-mono font-medium">{maxPayableLevel}</span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Commission Rate</span>
          <span className="text-sm font-mono font-medium text-primary">{commissionRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default BarberQualificationDebug;
