import PortalLayout from "@/components/portal/PortalLayout";
import { 
  CreditCard, 
  Download, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Billing = () => {
  // Mock data
  const subscription = {
    status: "active",
    plan: "Base Membership + 1 Add-on",
    amount: "$75",
    nextBilling: "January 15, 2025",
    card: "**** **** **** 4242",
    cardBrand: "Visa",
  };

  const invoices = [
    { id: "INV-001234", date: "Dec 15, 2024", amount: "$75", status: "paid" },
    { id: "INV-001233", date: "Nov 15, 2024", amount: "$75", status: "paid" },
    { id: "INV-001232", date: "Oct 15, 2024", amount: "$50", status: "paid" },
    { id: "INV-001231", date: "Sep 15, 2024", amount: "$50", status: "paid" },
  ];

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
                  {subscription.status === "active" ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Past Due
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
              <p className="font-medium">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Monthly Amount</p>
              <p className="font-display text-2xl text-primary">{subscription.amount}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Next Billing Date</p>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {subscription.nextBilling}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/60 mb-1">Payment Method</p>
              <p className="font-medium">{subscription.cardBrand} {subscription.card}</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">Payment Method</h2>
            <Button variant="ghost" size="sm">Update Card</Button>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 rounded-lg p-4">
            <div className="w-14 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">VISA</span>
            </div>
            <div>
              <p className="font-medium">Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/2026</p>
            </div>
            <div className="ml-auto">
              <span className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded">Default</span>
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

          <div className="divide-y divide-border/50">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 lg:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-display text-lg">{invoice.amount}</p>
                    <span className="text-xs text-green-600 bg-green-500/10 px-2 py-0.5 rounded">
                      {invoice.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
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
