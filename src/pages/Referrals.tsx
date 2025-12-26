import PortalLayout from "@/components/portal/PortalLayout";
import { 
  Share2, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Referrals = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const referralLink = "https://magnetic.barber/ref/johndoe123";
  const referralCode = "JOHNDOE123";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock matrix data
  const matrixLevels = [
    { level: 1, count: 3, active: 3, earnings: "$90" },
    { level: 2, count: 7, active: 6, earnings: "$48" },
    { level: 3, count: 12, active: 10, earnings: "$25" },
    { level: 4, count: 8, active: 5, earnings: "$7.50" },
    { level: 5, count: 4, active: 2, earnings: "$2" },
  ];

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
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-muted-foreground text-sm">Total Referrals</span>
            </div>
            <p className="font-display text-3xl">34</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-muted-foreground text-sm">Active Members</span>
            </div>
            <p className="font-display text-3xl">26</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground text-sm">This Month</span>
            </div>
            <p className="font-display text-3xl text-primary">$280</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-muted-foreground text-sm">All Time</span>
            </div>
            <p className="font-display text-3xl">$1,845</p>
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <h2 className="font-display text-xl mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Your Matrix (5 Levels)
          </h2>

          <div className="space-y-3">
            {matrixLevels.map((level) => (
              <div 
                key={level.level}
                className="flex items-center gap-4 bg-muted/30 rounded-lg p-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display text-primary">{level.level}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Level {level.level}</span>
                    <span className="font-display text-lg text-primary">{level.earnings}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{level.count} total</span>
                    <span className="text-green-600">{level.active} active</span>
                    <span className="text-muted-foreground/50">{level.count - level.active} inactive</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(level.active / level.count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Level 1 • Dec 22, 2024</p>
                  </div>
                  <span className="font-display text-lg text-primary">+$25</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="font-medium">Mike Chen</p>
                    <p className="text-sm text-muted-foreground">Level 1 • Dec 20, 2024</p>
                  </div>
                  <span className="font-display text-lg text-primary">+$25</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Tom Williams</p>
                    <p className="text-sm text-muted-foreground">Level 2 • Dec 18, 2024</p>
                  </div>
                  <span className="font-display text-lg text-primary">+$10</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="level" className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                Monthly level bonuses will appear here after the billing cycle.
              </div>
            </TabsContent>

            <TabsContent value="matrix" className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                Matrix commission details for the current period.
              </div>
            </TabsContent>

            <TabsContent value="products" className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                Product commission history will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Referrals;
