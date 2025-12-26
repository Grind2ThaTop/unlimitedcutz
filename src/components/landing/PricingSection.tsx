import { Check, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingSection = () => {
  return (
    <section className="py-24 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Simple Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
            ONE MEMBERSHIP,<span className="text-primary"> UNLIMITED VALUE</span>
          </h2>
          <p className="text-secondary-foreground/70 text-lg">
            Straightforward pricing with no hidden fees. Add household members as needed.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Base Membership */}
          <div className="relative bg-card/10 backdrop-blur-sm border border-border/20 rounded-2xl p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl">Base Membership</h3>
                  <p className="text-sm text-secondary-foreground/60">Includes 2 people</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-display text-6xl text-primary">$50</span>
                <span className="text-secondary-foreground/60">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "2 named household members",
                  "Unlimited grooming sessions",
                  "1 visit per person per week",
                  "Priority booking access",
                  "Referral program access",
                  "Member-only product store",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-secondary-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="hero" size="xl" className="w-full">
                Get Started
              </Button>
            </div>
          </div>

          {/* Add-On */}
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-8 overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/30 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl">Additional Member</h3>
                  <p className="text-sm text-secondary-foreground/60">Per person add-on</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="font-display text-6xl text-primary">$25</span>
                <span className="text-secondary-foreground/60">/month each</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Add any household member",
                  "Same unlimited grooming",
                  "Same weekly visit allowance",
                  "No limit on add-ons",
                  "Instant activation",
                  "Flexible management",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-secondary-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="heroOutline" size="xl" className="w-full border-primary/50 hover:border-primary">
                Add to Membership
              </Button>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-card/5 border border-border/20 rounded-xl p-6">
            <h4 className="font-display text-xl mb-4 text-center">Example: Family of 4</h4>
            <div className="flex items-center justify-between text-secondary-foreground/70">
              <span>Base Membership (2 people)</span>
              <span className="font-semibold">$50</span>
            </div>
            <div className="flex items-center justify-between text-secondary-foreground/70 mt-2">
              <span>2 Additional Members × $25</span>
              <span className="font-semibold">$50</span>
            </div>
            <div className="border-t border-border/20 mt-4 pt-4 flex items-center justify-between">
              <span className="font-display text-xl">Total Monthly</span>
              <span className="font-display text-2xl text-primary">$100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
