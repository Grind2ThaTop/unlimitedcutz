import { 
  Scissors, 
  Users, 
  DollarSign, 
  CheckCircle, 
  TrendingUp,
  Wallet,
  Award,
  Lock,
  Unlock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAccountRole } from "@/hooks/useAccountRole";
import { useReferrals } from "@/hooks/useReferrals";
import { useBarberStats } from "@/hooks/useBarberStats";

const BarberDashboardContent = () => {
  const { profile } = useAuth();
  const { matrixPercent } = useAccountRole();
  const { earningsSummary, totalEarnings } = useReferrals();
  const { 
    enrolledMembersCount, 
    enrollmentResidualTotal,
    membershipCutsCount,
    poolEarnings,
    isLoading 
  } = useBarberStats();

  const firstName = profile?.full_name?.split(' ')[0] || 'Barber';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Welcome, {firstName}</h1>
          <p className="text-muted-foreground">Barber Dashboard</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-full">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Verified Barber</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Unlock className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Matrix Depth</span>
            </div>
            <p className="font-display text-3xl text-primary">Levels 1-8</p>
            <p className="text-xs text-muted-foreground mt-1">Full depth unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Matrix Rate</span>
            </div>
            <p className="font-display text-3xl text-primary">{matrixPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">Per level commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Enrolled Members</span>
            </div>
            <p className="font-display text-3xl">{isLoading ? '...' : enrolledMembersCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Active clients you enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Enrollment Residual</span>
            </div>
            <p className="font-display text-3xl text-green-500">${isLoading ? '...' : enrollmentResidualTotal}/mo</p>
            <p className="text-xs text-muted-foreground mt-1">50% recurring ($25/client)</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Earnings Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Earnings Summary
            </CardTitle>
            <CardDescription>Your earnings breakdown this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Matrix Commissions</p>
                <p className="font-display text-2xl text-primary">${earningsSummary.matrixMembership.toFixed(0)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Enrollment Residual</p>
                <p className="font-display text-2xl text-green-500">${enrollmentResidualTotal}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Pool/Kitty Payout</p>
                <p className="font-display text-2xl text-blue-500">${poolEarnings.toFixed(0)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Matching Bonus</p>
                <p className="font-display text-2xl text-purple-500">$0</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-secondary rounded-lg p-4">
              <span className="text-secondary-foreground font-medium">Total Earnings</span>
              <span className="font-display text-3xl text-primary">
                ${(totalEarnings + enrollmentResidualTotal + poolEarnings).toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Membership Cuts & Pool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Membership Cuts & Pool
            </CardTitle>
            <CardDescription>Track your cuts and pool earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Today</p>
                <p className="font-display text-2xl">{membershipCutsCount.today}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">This Week</p>
                <p className="font-display text-2xl">{membershipCutsCount.week}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <p className="font-display text-2xl">{membershipCutsCount.month}</p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <h4 className="font-medium mb-3">Pool Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Cuts This Period</span>
                  <span className="font-medium">{membershipCutsCount.month}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Pool Payout</span>
                  <span className="font-medium text-green-500">${poolEarnings.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership/Matching Bonuses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Leadership & Matching Bonuses
            </CardTitle>
            <CardDescription>
              These bonuses require rank qualification (separate from depth unlock)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Matching Bonus (GOLD+)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn 10% on L1 and 5% on L2 personal enrollees' earnings. Requires GOLD rank or higher.
                </p>
              </div>
              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Leadership Bonus (PLATINUM+)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Additional bonus for developing leaders in your organization.
                </p>
              </div>
              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Master Bonus (DIAMOND)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Top-tier bonus for reaching Diamond rank with qualifying team.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Note: Matrix depth (Levels 1-8) is automatically unlocked for verified barbers. 
              Leadership bonuses still require rank qualification through team building.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarberDashboardContent;
