import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <Scissors className="w-96 h-96" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium">Limited Spots Available</span>
          </span>

          <h2 className="font-display text-4xl md:text-5xl lg:text-7xl mb-6">
            READY TO<span className="text-primary"> JOIN?</span>
          </h2>

          <p className="text-xl text-secondary-foreground/70 mb-10 max-w-xl mx-auto">
            Stop paying per cut. Start building your grooming empire. 
            Lock in your membership before we hit capacity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              Join Membership
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Join Waitlist
            </Button>
          </div>

          <p className="mt-8 text-sm text-secondary-foreground/50">
            $50/month for 2 people • Add more for $25/month each • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
