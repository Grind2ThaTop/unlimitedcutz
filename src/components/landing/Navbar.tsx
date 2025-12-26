import { useState } from "react";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-border/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" />
            <span className="font-display text-xl text-secondary-foreground">MAGNETIC</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#referrals" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
              Earn
            </a>
            <a href="#faq" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
              FAQ
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-secondary-foreground hover:text-primary">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="default" size="sm">
                Join Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-secondary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary border-t border-border/10">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a href="#features" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#referrals" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
              Earn
            </a>
            <a href="#faq" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
              FAQ
            </a>
            <div className="pt-4 border-t border-border/10 space-y-2">
              <Link to="/auth" className="block">
                <Button variant="ghost" className="w-full justify-start text-secondary-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth" className="block">
                <Button variant="default" className="w-full">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
