import { Clock, Scissors, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const BarberPendingVerification = () => {
  const { profile } = useAuth();
  
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <CardTitle className="font-display text-2xl">
            Pending Verification
          </CardTitle>
          <CardDescription className="text-base">
            Your barber account is awaiting admin approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-card rounded-lg p-6 border border-border/50">
            <h3 className="font-semibold mb-4">Account Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{profile?.full_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{profile?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" />
                  Barber
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-amber-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Pending Verification
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Admin Review</p>
                  <p className="text-sm text-muted-foreground">Our team will review your application</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Verification</p>
                  <p className="text-sm text-muted-foreground">You'll be notified once your account is verified</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Full Access</p>
                  <p className="text-sm text-muted-foreground">Access your barber dashboard with Levels 1-8 unlocked</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Once Verified, You'll Have Access To:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full 8-level matrix depth unlocked immediately</li>
              <li>• 50% recurring on clients you enroll ($25/month per client)</li>
              <li>• Pool/kitty payouts for membership cuts</li>
              <li>• 5% matrix commission rate</li>
              <li>• Enrolled members tracking</li>
              <li>• Earnings and payout history</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarberPendingVerification;
