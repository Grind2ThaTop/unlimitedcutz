import { Scissors } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-8 h-8 text-primary" />
              <span className="font-display text-2xl">MAGNETIC BARBERING</span>
            </div>
            <p className="text-secondary-foreground/60 max-w-sm">
              Premium grooming membership by Rog tha Barber. 
              Unlimited cuts, exclusive benefits, and earning potential.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Membership</h4>
            <ul className="space-y-2 text-secondary-foreground/60">
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Referral Program</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-secondary-foreground/60">
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Member Login</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © 2024 Magnetic Barbering. All rights reserved.
          </p>
          <p className="text-sm text-secondary-foreground/50">
            by <span className="text-primary">Rog tha Barber</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
