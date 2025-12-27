import { useState, useEffect } from "react";
import { Scissors, Mail, Lock, User, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BarberSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
    phone: "",
  });

  const referralCode = searchParams.get('ref') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/portal/barber`;
      
      // Sign up as barber - we'll need to update account_type after
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            referral_code: referralCode || null,
            account_type: 'barber', // Signal to handle_new_user trigger
          },
        },
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        // Barber type is now set by the handle_new_user trigger server-side
        // based on the account_type metadata passed during signup
        
        // Get the referral sponsor_id for matrix placement
        const { data: profileData } = await supabase
          .from('profiles')
          .select('referred_by')
          .eq('id', data.user.id)
          .single();
        
        // Trigger matrix placement for barber immediately
        try {
          const { error: placementError } = await supabase.functions.invoke('process-new-member', {
            body: {
              user_id: data.user.id,
              sponsor_id: profileData?.referred_by || null,
            },
          });
          
          if (placementError) {
            console.error('Placement error:', placementError);
          }
        } catch (placementErr) {
          console.error('Failed to trigger placement:', placementErr);
        }
        
        toast({
          title: "Account created!",
          description: "Your barber account is pending verification. You'll be notified once approved.",
        });
        navigate('/portal/barber');
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
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-secondary via-secondary to-primary/20 p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20">
            <Scissors className="w-64 h-64 rotate-45" />
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
            JOIN OUR<br />
            <span className="text-primary">BARBER TEAM</span>
          </h2>

          <p className="text-secondary-foreground/70 text-lg max-w-md">
            Sign up to become a Magnetic barber. Earn 50% on enrolled clients, pool payouts, and matrix commissions with full 8-level depth unlocked.
          </p>

          <div className="mt-6 space-y-2 text-secondary-foreground/60 text-sm">
            <p>✓ 50% recurring on clients you enroll ($25/month per client)</p>
            <p>✓ Levels 1-8 unlocked immediately</p>
            <p>✓ Pool/kitty payouts for membership cuts</p>
            <p>✓ 5% matrix commission rate</p>
          </div>
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

          {/* Referral Banner */}
          {referralCode && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-secondary-foreground">
                🎉 Referral code: <span className="font-mono font-bold text-primary">{referralCode}</span>
              </p>
            </div>
          )}

          {/* Form Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-4">
              <Scissors className="w-4 h-4" />
              Barber Application
            </div>
            <h2 className="font-display text-3xl text-secondary-foreground mb-2">
              BARBER SIGNUP
            </h2>
            <p className="text-secondary-foreground/60">
              Create your barber account. Verification required.
            </p>
            <p className="text-sm text-secondary-foreground/40 mt-2">
              Already a barber? <Link to="/barber/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-secondary-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="pl-11 bg-card/10 border-border/20 text-secondary-foreground placeholder:text-secondary-foreground/40 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="barber@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 bg-card/10 border-border/20 text-secondary-foreground placeholder:text-secondary-foreground/40 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-secondary-foreground">
                Phone Number (Optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-11 bg-card/10 border-border/20 text-secondary-foreground placeholder:text-secondary-foreground/40 h-12"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-secondary-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-11 bg-card/10 border-border/20 text-secondary-foreground placeholder:text-secondary-foreground/40 h-12"
                  required
                />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-400">
                ⚠️ Barber accounts require admin verification before full access is granted.
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : "Apply as Barber"}
            </Button>
          </form>

          {/* Other login links */}
          <div className="mt-8 text-center space-y-2">
            <Link to="/client/signup" className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm block">
              Want to be a member instead? Sign up here →
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

export default BarberSignup;
