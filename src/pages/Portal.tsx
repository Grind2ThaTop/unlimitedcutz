import PortalLayout from "@/components/portal/PortalLayout";
import { 
  QrCode, 
  Calendar, 
  Users, 
  CreditCard, 
  Share2, 
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Scissors,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import { useReferrals } from "@/hooks/useReferrals";
import { format } from "date-fns";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const quickActions = [
  { icon: Calendar, label: "Book Appointment", href: "/portal/booking", color: "bg-blue-500/10 text-blue-500" },
  { icon: Users, label: "Manage Connections", href: "/portal/connections", color: "bg-green-500/10 text-green-500" },
  { icon: Share2, label: "Referral Center", href: "/portal/referrals", color: "bg-purple-500/10 text-purple-500" },
  { icon: CreditCard, label: "Billing", href: "/portal/billing", color: "bg-orange-500/10 text-orange-500" },
  { icon: ShoppingBag, label: "Product Store", href: "/portal/store", color: "bg-pink-500/10 text-pink-500" },
  { icon: User, label: "Profile", href: "/portal/profile", color: "bg-cyan-500/10 text-cyan-500" },
];

const Portal = () => {
  const { profile } = useAuth();
  const { membership, connections, isEligibleForVisit, checkSubscription, createCheckout } = useMembership();
  const [searchParams] = useSearchParams();

  // Check for success/cancel from Stripe checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your membership is now active.');
      checkSubscription.mutate();
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout was canceled.');
    }
  }, [searchParams]);

  // Refresh subscription status on mount
  useEffect(() => {
    if (membership) {
      checkSubscription.mutate();
    }
  }, []);

  const { earningsSummary, totalEarnings } = useReferrals();

  const firstName = profile?.full_name?.split(' ')[0] || 'Member';
  const membershipStatus = membership?.status || 'pending';
  const memberId = membership?.membership_id || 'N/A';
  const totalMonthly = membership 
    ? `$${(Number(membership.base_amount) + Number(membership.addon_amount)).toFixed(0)}`
    : '$0';
  const nextBillingDate = membership?.current_period_end 
    ? format(new Date(membership.current_period_end), 'MMMM d, yyyy')
    : 'N/A';

  return (
    <PortalLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Welcome Back, {firstName}</h1>
          <p className="text-muted-foreground">Manage your membership and connections</p>
        </div>

        {/* Membership Card */}
        <div className="bg-secondary text-secondary-foreground rounded-2xl p-6 lg:p-8 mb-8 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute top-8 right-8 opacity-10">
            <Scissors className="w-32 h-32 rotate-45" />
          </div>

          <div className="relative grid lg:grid-cols-3 gap-8">
            {/* Left - Status */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-6 h-6 text-primary" />
                <span className="font-display text-xl">MAGNETIC BARBERING</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {membershipStatus === "active" ? (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Active Member</span>
                  </div>
                ) : membershipStatus === "past_due" ? (
                  <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Past Due</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{membershipStatus}</span>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-secondary-foreground/60 mb-1">Member ID</p>
                  <p className="font-mono text-lg">{memberId}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-foreground/60 mb-1">Connections</p>
                  <p className="font-display text-2xl">{connections.length} <span className="text-sm font-sans text-secondary-foreground/60">people</span></p>
                </div>
                <div>
                  <p className="text-sm text-secondary-foreground/60 mb-1">Next Billing</p>
                  <p className="font-medium">{nextBillingDate}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-foreground/60 mb-1">Monthly Total</p>
                  <p className="font-display text-2xl text-primary">{totalMonthly}</p>
                </div>
              </div>

              <Button variant="hero" size="lg">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            </div>

            {/* Right - QR Code */}
            <div className="flex flex-col items-center justify-center bg-card/10 rounded-xl p-6">
              <div className="w-32 h-32 bg-secondary-foreground rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-secondary" />
              </div>
              <p className="text-sm text-secondary-foreground/60 text-center">
                Show at check-in
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display text-2xl mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="bg-card border border-border/50 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {action.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Connections Overview */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connections */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl">Connections</h3>
              <Link to="/portal/connections" className="text-sm text-primary hover:underline flex items-center gap-1">
                Manage <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {connections.length > 0 ? (
              <div className="space-y-4">
                {connections.slice(0, 3).map((connection) => {
                  const eligible = isEligibleForVisit(connection);
                  return (
                    <div key={connection.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-display text-sm text-primary">
                            {connection.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Last: {connection.last_visit ? format(new Date(connection.last_visit), 'MMM d, yyyy') : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        eligible 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {eligible ? "Eligible" : "Used This Week"}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No connections yet</p>
                <Link to="/portal/connections" className="text-primary hover:underline text-sm">
                  Add your first connection
                </Link>
              </div>
            )}
          </div>

          {/* Earnings Snapshot */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl">Earnings This Month</h3>
              <Link to="/portal/referrals" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Fast Start Bonuses</p>
                <p className="font-display text-2xl text-primary">${earningsSummary.fastStart.toFixed(0)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Level Bonuses</p>
                <p className="font-display text-2xl text-primary">${earningsSummary.levelBonus.toFixed(0)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Matrix Commissions</p>
                <p className="font-display text-2xl text-primary">${earningsSummary.matrixMembership.toFixed(0)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Product Sales</p>
                <p className="font-display text-2xl text-primary">${earningsSummary.productCommission.toFixed(0)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-secondary rounded-lg p-4">
              <span className="text-secondary-foreground font-medium">Total Earnings</span>
              <span className="font-display text-3xl text-primary">${totalEarnings.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Portal;
