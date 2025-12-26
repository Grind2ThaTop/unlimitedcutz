import { useAccountRole } from "@/hooks/useAccountRole";
import { Badge } from "@/components/ui/badge";
import { Scissors, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountRoleBadgeProps {
  className?: string;
  showPercent?: boolean;
}

const AccountRoleBadge = ({ className, showPercent = false }: AccountRoleBadgeProps) => {
  const { accountType, matrixPercent, isLoading } = useAccountRole();

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("animate-pulse", className)}>
        Loading...
      </Badge>
    );
  }

  const isBarber = accountType === 'barber';

  return (
    <Badge 
      variant={isBarber ? "default" : "secondary"}
      className={cn(
        "gap-1.5",
        isBarber 
          ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" 
          : "bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30",
        className
      )}
    >
      {isBarber ? (
        <Scissors className="w-3 h-3" />
      ) : (
        <User className="w-3 h-3" />
      )}
      <span className="font-medium capitalize">{accountType}</span>
      {showPercent && (
        <span className="text-xs opacity-75">({matrixPercent}%)</span>
      )}
    </Badge>
  );
};

export default AccountRoleBadge;
