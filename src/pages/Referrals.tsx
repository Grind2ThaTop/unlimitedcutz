import PortalLayout from "@/components/portal/PortalLayout";
import { 
  Share2, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp,
  Check,
  Zap,
  GitBranch,
  Percent,
  Info,
  Grid3X3,
  BarChart3
} from "lucide-react";
import MatrixCommissionTable from "@/components/referrals/MatrixCommissionTable";
import MatrixCalculator from "@/components/referrals/MatrixCalculator";
import FastStartChart from "@/components/referrals/FastStartChart";
import MatchingBonusChart from "@/components/referrals/MatchingBonusChart";
import MatrixTreeVisualization from "@/components/referrals/MatrixTreeVisualization";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useReferrals } from "@/hooks/useReferrals";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Referrals = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const {
    commissions,
    matrixNode,
    directReferrals,
    earningsSummary,
    totalEarnings,
    pendingEarnings,
    referralLink,
    referralCode,
    isLoading,
  } = useReferrals();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Group commissions by type
  const fastStartCommissions = commissions.filter(c => c.commission_type === 'fast_start');
  const matchingCommissions = commissions.filter(c => c.commission_type === 'matching_bonus');
  const matrixCommissions = commissions.filter(c => c.commission_type === 'matrix_membership');

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Referral Center</h1>
          <p className="text-muted-foreground">
            Earn commissions through Fast Start, Matrix, and Matching Bonuses
          </p>
        </div>

        {/* Compensation Explainer Cards - Collapsed */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm">Fast Start</h3>
              <p className="text-xs text-muted-foreground truncate">$25 / $10 / $5 per level</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0">
              <Grid3X3 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm">Matrix Income</h3>
              <p className="text-xs text-muted-foreground truncate">2×15 forced • 2.5%/level</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm">Matching Bonus</h3>
              <p className="text-xs text-muted-foreground truncate">10% L1 • 5% L2</p>
            </div>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-secondary text-secondary-foreground rounded-xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl">Your Referral Link</h2>
          </div>

          {referralLink ? (
            <>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-card/10 rounded-lg px-4 py-3 font-mono text-sm truncate">
                  {referralLink}
                </div>
                <Button 
                  variant="hero" 
                  onClick={() => copyToClipboard(referralLink)}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-secondary-foreground/60 text-sm">Code:</span>
                <code className="bg-card/10 px-3 py-1 rounded text-primary font-mono">
                  {referralCode}
                </code>
              </div>
            </>
          ) : (
            <p className="text-secondary-foreground/60">
              Your referral link will be available once your profile is set up.
            </p>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-muted-foreground text-sm">Direct Referrals</span>
            </div>
            <p className="font-display text-3xl">{directReferrals.length}</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-muted-foreground text-sm">Matrix Position</span>
            </div>
            <p className="font-display text-3xl">
              {matrixNode ? `L${matrixNode.level}` : '—'}
            </p>
            {matrixNode && (
              <p className="text-xs text-muted-foreground mt-1">
                Position {matrixNode.position || 'Root'}
              </p>
            )}
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground text-sm">Pending</span>
            </div>
            <p className="font-display text-3xl text-primary">${pendingEarnings.toFixed(0)}</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-muted-foreground text-sm">All Time</span>
            </div>
            <p className="font-display text-3xl">${totalEarnings.toFixed(0)}</p>
          </div>
        </div>

        {/* Earnings Breakdown Mini Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-500" />
              <span className="text-sm">Fast Start</span>
            </div>
            <span className="font-display text-lg">${earningsSummary.fastStart.toFixed(0)}</span>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Matrix</span>
            </div>
            <span className="font-display text-lg">${earningsSummary.matrixMembership.toFixed(0)}</span>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Matching</span>
            </div>
            <span className="font-display text-lg">${earningsSummary.levelBonus.toFixed(0)}</span>
          </div>
        </div>

        {/* Compensation Visualizations */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl">Compensation Overview</h2>
              <p className="text-sm text-muted-foreground">Visual breakdown of all earning opportunities</p>
            </div>
          </div>
          
          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <FastStartChart />
            <MatchingBonusChart />
          </div>
          
          {/* Matrix Tree */}
          <MatrixTreeVisualization />
        </div>

        {/* Matrix Commission Table & Calculator */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-display text-xl">Matrix Commissions</h2>
              <p className="text-sm text-muted-foreground">2×15 forced matrix with rank-based eligibility</p>
            </div>
          </div>
          
          <MatrixCommissionTable />
          
          <div className="mt-8">
            <MatrixCalculator />
          </div>
        </div>

        {/* Direct Referrals List */}
        {directReferrals.length > 0 && (
          <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
            <h2 className="font-display text-xl mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Direct Referrals
            </h2>

            <div className="space-y-3">
              {directReferrals.map((referral) => (
                <div 
                  key={referral.id}
                  className="flex items-center gap-4 bg-muted/30 rounded-lg p-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-display text-primary text-sm">
                      {referral.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{referral.full_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {format(new Date(referral.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commission History Tabs */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <Tabs defaultValue="faststart" className="w-full">
            <div className="border-b border-border/50 px-6 pt-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="faststart">Fast Start</TabsTrigger>
                <TabsTrigger value="matrix">Matrix</TabsTrigger>
                <TabsTrigger value="matching">Matching</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="faststart" className="p-6">
              {fastStartCommissions.length > 0 ? (
                <div className="space-y-4">
                  {fastStartCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{commission.description || 'Fast Start Bonus'}</p>
                        <p className="text-sm text-muted-foreground">
                          Level {commission.level} • {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-display text-lg text-green-500">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No fast start bonuses yet</p>
                  <p className="text-sm mt-1">Refer someone to earn up to $40!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="matrix" className="p-6">
              {matrixCommissions.length > 0 ? (
                <div className="space-y-4">
                  {matrixCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{commission.description || 'Matrix Income'}</p>
                        <p className="text-sm text-muted-foreground">
                          Level {commission.level} • {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-display text-lg text-blue-500">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No matrix income yet</p>
                  <p className="text-sm mt-1">Earn as positions fill below you in the matrix</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="matching" className="p-6">
              {matchingCommissions.length > 0 ? (
                <div className="space-y-4">
                  {matchingCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{commission.description || 'Matching Bonus'}</p>
                        <p className="text-sm text-muted-foreground">
                          Level {commission.level} • {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-display text-lg text-purple-500">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Percent className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No matching bonuses yet</p>
                  <p className="text-sm mt-1">Earn 10% on L1 and 5% on L2 of your team's earnings</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Referrals;
