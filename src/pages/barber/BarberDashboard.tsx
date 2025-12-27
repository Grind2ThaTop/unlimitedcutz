import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccountRole } from "@/hooks/useAccountRole";
import PortalLayout from "@/components/portal/PortalLayout";
import BarberPendingVerification from "@/components/barber/BarberPendingVerification";
import BarberDashboardContent from "@/components/barber/BarberDashboardContent";

const BarberDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { accountRole, accountType, isLoading: roleLoading } = useAccountRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/barber/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is not a barber
  if (accountType !== 'barber') {
    return (
      <PortalLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="font-display text-3xl mb-4">Not a Barber Account</h1>
          <p className="text-muted-foreground mb-6">
            This dashboard is for barber accounts only.
          </p>
          <a href="/portal" className="text-primary hover:underline">
            Go to Member Dashboard →
          </a>
        </div>
      </PortalLayout>
    );
  }

  // Check verification status
  const isVerified = accountRole?.barber_verified === true;

  if (!isVerified) {
    return (
      <PortalLayout>
        <BarberPendingVerification />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <BarberDashboardContent />
    </PortalLayout>
  );
};

export default BarberDashboard;
