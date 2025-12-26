import { useState } from "react";
import { Scissors, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual auth with Supabase
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: mode === "signin" ? "Welcome back!" : "Account created!",
        description: "Redirecting to your dashboard...",
      });
    }, 1500);
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
            YOUR GROOMING<br />
            <span className="text-primary">EMPIRE AWAITS</span>
          </h2>

          <p className="text-secondary-foreground/70 text-lg max-w-md">
            Join the exclusive membership that keeps you fresh and pays you to share. 
            Unlimited grooming, unlimited potential.
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

          {/* Tab Switcher */}
          <div className="flex bg-card/10 rounded-lg p-1 mb-8">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/60 hover:text-secondary-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/60 hover:text-secondary-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl text-secondary-foreground mb-2">
              {mode === "signin" ? "WELCOME BACK" : "JOIN THE FAMILY"}
            </h2>
            <p className="text-secondary-foreground/60">
              {mode === "signin"
                ? "Sign in to access your member portal"
                : "Create your account to get started"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
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
            )}

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

            {mode === "signup" && (
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
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
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
          >
            <Mail className="w-5 h-5 mr-2" />
            Send Magic Link
          </Button>

          {/* Mobile back link */}
          <div className="lg:hidden mt-8 text-center">
            <Link to="/" className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
