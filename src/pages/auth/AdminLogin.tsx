import { useState, useEffect } from "react";
import { Scissors, Mail, Lock, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { isAdmin, isAdminLoading } = useAdmin();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user && !isAdminLoading) {
      if (isAdmin) {
        navigate('/portal/admin/ranks');
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate('/portal');
      }
    }
  }, [user, isAdmin, isAdminLoading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Checking admin status...",
        });
        // Navigation will be handled by useEffect after auth state updates
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-secondary via-secondary to-red-500/20 p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20">
            <Shield className="w-64 h-64" />
          </div>
          <div className="absolute bottom-20 right-20">
            <Scissors className="w-48 h-48 -rotate-12" />
          </div>
        </div>

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-secondary-foreground/70 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <Scissors className="w-12 h-12 text-primary" />
            <div>
              <h1 className="font-display text-4xl text-secondary-foreground">MAGNETIC</h1>
              <p className="text-secondary-foreground/60">BARBERING</p>
            </div>
          </div>

          <h2 className="font-display text-5xl text-secondary-foreground mb-6 leading-tight">
            ADMIN<br />
            <span className="text-red-500">ACCESS</span>
          </h2>

          <p className="text-secondary-foreground/70 text-lg max-w-md">
            Owner-only access to manage barbers, members, and compensation settings.
          </p>
        </div>

        <div className="relative text-secondary-foreground/50 text-sm">
          © 2024 Magnetic Barbering. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Scissors className="w-8 h-8 text-primary" />
            <span className="font-display text-2xl text-secondary-foreground">MAGNETIC</span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm mb-4">
              <Shield className="w-4 h-4" />
              Admin Only
            </div>
            <h2 className="font-display text-3xl text-secondary-foreground mb-2">
              ADMIN LOGIN
            </h2>
            <p className="text-secondary-foreground/60">
              Owner access only. Unauthorized access is prohibited.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary-foreground">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 bg-card/10 border-border/20 text-secondary-foreground placeholder:text-secondary-foreground/40 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-secondary-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 bg-card/10 border-border/20 text-secondary-foreground placeholder:text-secondary-foreground/40 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Sign In"}
            </Button>
          </form>

          {/* Other login links */}
          <div className="mt-8 text-center space-y-2">
            <Link to="/client/login" className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm block">
              Member login →
            </Link>
            <Link to="/barber/login" className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm block">
              Barber login →
            </Link>
            <Link to="/" className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm block lg:hidden">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
