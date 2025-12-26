import PortalLayout from "@/components/portal/PortalLayout";
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { format } from "date-fns";

const Billing = () => {
  const { membership, isLoading } = useMembership();

  const status = membership?.status || 'pending';
  const baseAmount = Number(membership?.base_amount || 50);
  const addonAmount = Number(membership?.addon_amount || 0);
  const totalAmount = baseAmount + addonAmount;
  const nextBillingDate = membership?.current_period_end 
    ? format(new Date(membership.current_period_end), 'MMMM d, yyyy')
    : 'N/A';

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
          <h1 className="font-display text-3xl lg:text-4xl mb-2">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-secondary text-secondary-foreground rounded-xl p-6 lg:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl">Current Subscription</h2>
                <div className="flex items-center gap-2 mt-1">
                  {status === "active" ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : status === "past_due" ? (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Past Due
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="heroOutline" size="sm">
              Cancel Subscription
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Plan</p>
              <p className="font-medium">
                Base Membership{addonAmount > 0 ? ` + Add-ons` : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Monthly Amount</p>
              <p className="font-display text-2xl text-primary">${totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Next Billing Date</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {nextBillingDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Payment Method</p>
              <p className="font-medium">Not configured</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">Payment Method</h2>
            <Button variant="ghost" size="sm">Add Card</Button>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 rounded-lg p-4">
            <div className="w-14 h-10 bg-muted rounded flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">No payment method on file</p>
              <p className="text-sm text-muted-foreground">Add a card to activate your subscription</p>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-display text-xl flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Invoice History
            </h2>
          </div>

          <div className="p-8 text-center text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No invoices yet</p>
            <p className="text-sm">Your payment history will appear here</p>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-700">Cancellation Policy</p>
            <p className="text-sm text-amber-600/80">
              If you cancel, your membership will remain active until the end of your current billing cycle. 
              You'll lose access to the referral program and any pending commissions.
            </p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default Billing;
