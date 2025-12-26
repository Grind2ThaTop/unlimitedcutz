import PortalLayout from "@/components/portal/PortalLayout";
import { 
  Share2, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useReferrals } from "@/hooks/useReferrals";
import { format } from "date-fns";

const Referrals = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const {
    commissions,
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
  const levelBonusCommissions = commissions.filter(c => c.commission_type === 'level_bonus');
  const matrixCommissions = commissions.filter(c => c.commission_type === 'matrix_membership');
  const productCommissions = commissions.filter(c => c.commission_type === 'product_commission');

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
            Share Magnetic Barbering and earn commissions on 5 levels
          </p>
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
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-muted-foreground text-sm">Active Network</span>
            </div>
            <p className="font-display text-3xl">{directReferrals.length}</p>
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

        {/* Earnings Breakdown */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <Tabs defaultValue="faststart" className="w-full">
            <div className="border-b border-border/50 px-6 pt-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="faststart">Fast Start</TabsTrigger>
                <TabsTrigger value="level">Level Bonuses</TabsTrigger>
                <TabsTrigger value="matrix">Matrix</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
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
                      <span className="font-display text-lg text-primary">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No fast start bonuses yet. Refer someone to earn!
                </div>
              )}
            </TabsContent>

            <TabsContent value="level" className="p-6">
              {levelBonusCommissions.length > 0 ? (
                <div className="space-y-4">
                  {levelBonusCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{commission.description || 'Level Bonus'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-display text-lg text-primary">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Monthly level bonuses will appear here after the billing cycle.
                </div>
              )}
            </TabsContent>

            <TabsContent value="matrix" className="p-6">
              {matrixCommissions.length > 0 ? (
                <div className="space-y-4">
                  {matrixCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{commission.description || 'Matrix Commission'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-display text-lg text-primary">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Matrix commission details for the current period.
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="p-6">
              {productCommissions.length > 0 ? (
                <div className="space-y-4">
                  {productCommissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{commission.description || 'Product Commission'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(commission.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-display text-lg text-primary">+${Number(commission.amount).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Product commission history will appear here.
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
