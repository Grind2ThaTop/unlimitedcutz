import PortalLayout from "@/components/portal/PortalLayout";
import { 
  Wallet, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePayouts } from "@/hooks/usePayouts";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Payouts = () => {
  const { profile } = useAuth();
  const { 
    payoutRequests, 
    balance, 
    settings, 
    hasPendingPayout,
    requestPayout,
    isRequestingPayout,
    isLoading 
  } = usePayouts();

  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'cashapp' | 'paypal'>('cashapp');
  const [methodDetails, setMethodDetails] = useState('');

  const minimumPayout = settings?.minimum_payout || 50;
  const canRequestPayout = balance.available >= minimumPayout && !hasPendingPayout;

  const handleRequestPayout = () => {
    requestPayout({ 
      method: payoutMethod, 
      method_details: methodDetails || undefined 
    });
    setShowPayoutDialog(false);
    setMethodDetails('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
            <AlertCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Payouts</h1>
          <p className="text-muted-foreground">
            Request withdrawals and view your payout history
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-muted-foreground text-sm">Available Balance</span>
            </div>
            <p className="font-display text-3xl text-green-500">${balance.available.toFixed(2)}</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-muted-foreground text-sm">Pending Payout</span>
            </div>
            <p className="font-display text-3xl">${balance.pending_payout.toFixed(2)}</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground text-sm">Total Paid</span>
            </div>
            <p className="font-display text-3xl">${balance.paid.toFixed(2)}</p>
          </div>
        </div>

        {/* Request Payout Card */}
        <div className="bg-secondary text-secondary-foreground rounded-xl p-6 lg:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl mb-2">Request Withdrawal</h2>
              <p className="text-secondary-foreground/70 text-sm">
                Minimum payout: ${minimumPayout}. Payouts are processed via Cash App or PayPal.
              </p>
            </div>
            <Button
              variant="hero"
              onClick={() => setShowPayoutDialog(true)}
              disabled={!canRequestPayout || isRequestingPayout}
              className="shrink-0"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Request Payout
            </Button>
          </div>

          {hasPendingPayout && (
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg flex items-center gap-2 text-yellow-500 text-sm">
              <Clock className="w-4 h-4" />
              You have a pending payout request. Please wait for it to be processed.
            </div>
          )}

          {balance.available < minimumPayout && !hasPendingPayout && (
            <div className="mt-4 p-3 bg-muted/20 rounded-lg flex items-center gap-2 text-muted-foreground text-sm">
              <AlertCircle className="w-4 h-4" />
              Earn ${(minimumPayout - balance.available).toFixed(2)} more to reach the minimum payout.
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-display text-xl">Payout History</h2>
          </div>

          {payoutRequests.length > 0 ? (
            <div className="divide-y divide-border/50">
              {payoutRequests.map((payout) => (
                <div key={payout.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-display text-lg">${Number(payout.amount).toFixed(2)}</span>
                      {getStatusBadge(payout.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="capitalize">{payout.method}</span>
                      <span>•</span>
                      <span>{format(new Date(payout.requested_at), 'MMM d, yyyy')}</span>
                      {payout.processed_at && (
                        <>
                          <span>•</span>
                          <span>Processed {format(new Date(payout.processed_at), 'MMM d, yyyy')}</span>
                        </>
                      )}
                    </div>
                    {payout.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{payout.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout history yet</p>
              <p className="text-sm mt-1">Your withdrawal requests will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>
              Your available balance of ${balance.available.toFixed(2)} will be sent to your selected payout method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Payout Method</Label>
              <Select value={payoutMethod} onValueChange={(v) => setPayoutMethod(v as 'cashapp' | 'paypal')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashapp">Cash App</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{payoutMethod === 'cashapp' ? 'Cash App Username' : 'PayPal Email'}</Label>
              <Input
                placeholder={payoutMethod === 'cashapp' ? '$username' : 'email@example.com'}
                value={methodDetails}
                onChange={(e) => setMethodDetails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {payoutMethod === 'cashapp' 
                  ? 'Enter your Cash App $cashtag (e.g., $YourName)' 
                  : 'Enter your PayPal email address'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestPayout} 
              disabled={isRequestingPayout}
            >
              {isRequestingPayout ? 'Requesting...' : `Request $${balance.available.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
};

export default Payouts;
