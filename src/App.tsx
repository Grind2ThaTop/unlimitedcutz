import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Portal from "./pages/Portal";
import Connections from "./pages/Connections";
import Referrals from "./pages/Referrals";
import Billing from "./pages/Billing";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminRanks from "./pages/admin/AdminRanks";
import AdminMatrixAudit from "./pages/admin/AdminMatrixAudit";
import ClientLogin from "./pages/auth/ClientLogin";
import ClientSignup from "./pages/auth/ClientSignup";
import BarberLogin from "./pages/auth/BarberLogin";
import BarberSignup from "./pages/auth/BarberSignup";
import AdminLogin from "./pages/auth/AdminLogin";
import BarberDashboard from "./pages/barber/BarberDashboard";
const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isAdminLoading } = useAdmin();

  if (authLoading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* Role-specific auth routes */}
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/signup" element={<ClientSignup />} />
            <Route path="/barber/login" element={<BarberLogin />} />
            <Route path="/barber/signup" element={<BarberSignup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            {/* Portal routes */}
            <Route path="/portal" element={<ProtectedRoute><Portal /></ProtectedRoute>} />
            <Route path="/portal/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
            <Route path="/portal/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/portal/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="/portal/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/portal/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
            {/* Barber Routes */}
            <Route path="/portal/barber" element={<ProtectedRoute><BarberDashboard /></ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/portal/admin/ranks" element={<AdminRoute><AdminRanks /></AdminRoute>} />
            <Route path="/portal/admin/matrix-audit" element={<AdminRoute><AdminMatrixAudit /></AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
