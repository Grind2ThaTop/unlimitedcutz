import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Scissors,
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Share2,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Shield,
  Activity,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useAccountRole } from "@/hooks/useAccountRole";

interface PortalLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { icon: Shield, label: "Rank Management", href: "/portal/admin/ranks" },
  { icon: Activity, label: "Matrix Audit", href: "/portal/admin/matrix-audit" },
];

const PortalLayout = ({ children }: PortalLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isBarber } = useAccountRole();

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  // Build nav items based on account type
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/portal" },
    { icon: User, label: "Profile", href: "/portal/profile" },
    // Connections only for clients (not barbers)
    ...(!isBarber ? [{ icon: Users, label: "Connections", href: "/portal/connections" }] : []),
    { icon: Calendar, label: isBarber ? "Book a Client" : "Book Appointment", href: "/portal/booking" },
    { icon: Wallet, label: "Payouts", href: "/portal/payouts" },
    { icon: Share2, label: "Referral Center", href: "/portal/referrals" },
    { icon: ShoppingBag, label: "Product Store", href: "/portal/store" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-border/10 h-16 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-secondary-foreground"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="font-display text-lg text-secondary-foreground">MAGNETIC</span>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-secondary/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-secondary border-r border-border/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Scissors className="w-8 h-8 text-primary" />
              <div>
                <span className="font-display text-xl text-secondary-foreground block leading-none">MAGNETIC</span>
                <span className="text-xs text-secondary-foreground/50">Member Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-secondary-foreground/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-foreground/60 hover:bg-card/10 hover:text-secondary-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 px-4">
                  <span className="text-xs font-semibold text-secondary-foreground/40 uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-secondary-foreground/60 hover:bg-card/10 hover:text-secondary-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border/10">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-display text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-foreground truncate">
                  {profile?.full_name || 'Member'}
                </p>
                <p className="text-xs text-secondary-foreground/50 truncate">
                  {profile?.email || ''}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-secondary-foreground/60 hover:text-primary mt-2"
              onClick={signOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
