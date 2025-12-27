import { useState, useEffect } from "react";
import { Scissors, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ClientLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, sendMagicLink } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate('/portal');
    }
  }, [user, navigate]);

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
          description: "Redirecting to your dashboard...",
        });
        navigate('/portal');
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

  const handleMagicLink = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await sendMagicLink(formData.email);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Failed to send link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Magic link sent!",
        description: "Check your email for a login link.",
      });
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
            MEMBER<br />
            <span className="text-primary">LOGIN</span>
          </h2>

          <p className="text-secondary-foreground/70 text-lg max-w-md">
            Access your member portal for unlimited grooming and referral earnings.
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
            <h2 className="font-display text-3xl text-secondary-foreground mb-2">
              MEMBER LOGIN
            </h2>
            <p className="text-secondary-foreground/60">
              Sign in to access your member portal
            </p>
            <p className="text-sm text-secondary-foreground/40 mt-2">
              New member? <Link to="/client/signup" className="text-primary hover:underline">Create an account</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
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

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-secondary px-4 text-secondary-foreground/50">
                or continue with
              </span>
            </div>
          </div>

          {/* Magic Link */}
          <Button
            type="button"
            variant="heroOutline"
            size="lg"
            className="w-full"
            onClick={handleMagicLink}
            disabled={isLoading}
          >
            <Mail className="w-5 h-5 mr-2" />
            Send Magic Link
          </Button>

          {/* Other login links */}
          <div className="mt-8 text-center space-y-2">
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

export default ClientLogin;
