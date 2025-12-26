import { DollarSign, Users, Layers, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReferralSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Earn While You Groom
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
              BUILD YOUR<span className="text-primary"> EMPIRE</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our compensation plan rewards you for sharing Magnetic Barbering. 
              Earn one-time bonuses, recurring commissions, and product sales on 5 levels deep.
            </p>

            {/* Earnings Highlights */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-xl mb-1">Fast Start Bonus</h4>
                  <p className="text-muted-foreground text-sm">
                    Earn <span className="text-primary font-semibold">$25</span> per direct referral, plus <span className="text-primary font-semibold">$10</span> on level 2 and <span className="text-primary font-semibold">$5</span> on level 3. One-time payments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-xl mb-1">Level Bonuses</h4>
                  <p className="text-muted-foreground text-sm">
                    Recurring <span className="text-primary font-semibold">$25/mo</span> per level 1, <span className="text-primary font-semibold">$10/mo</span> level 2, <span className="text-primary font-semibold">$5/mo</span> level 3 for as long as they stay active.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-xl mb-1">Matrix Commissions</h4>
                  <p className="text-muted-foreground text-sm">
                    Earn <span className="text-primary font-semibold">10%</span> level 1, <span className="text-primary font-semibold">8%</span> level 2, <span className="text-primary font-semibold">5%</span> level 3, <span className="text-primary font-semibold">3%</span> level 4, <span className="text-primary font-semibold">2%</span> level 5 on all membership fees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-display text-xl mb-1">Product Commissions</h4>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-primary font-semibold">25%</span> on personal sales, plus matrix commissions through 5 levels on your network's purchases.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="premium" size="xl">
              Start Earning Today
            </Button>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-secondary rounded-2xl p-8 text-secondary-foreground">
              <h3 className="font-display text-2xl mb-6 text-center">Example Monthly Earnings</h3>
              
              {/* Matrix Visualization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-card/10 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-secondary-foreground/60">Level 1 (3 members)</span>
                    <p className="font-display text-xl">3 × $25 + 10%</p>
                  </div>
                  <span className="font-display text-2xl text-primary">$90</span>
                </div>
                
                <div className="flex items-center justify-between bg-card/10 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-secondary-foreground/60">Level 2 (9 members)</span>
                    <p className="font-display text-xl">9 × $10 + 8%</p>
                  </div>
                  <span className="font-display text-2xl text-primary">$126</span>
                </div>
                
                <div className="flex items-center justify-between bg-card/10 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-secondary-foreground/60">Level 3 (27 members)</span>
                    <p className="font-display text-xl">27 × $5 + 5%</p>
                  </div>
                  <span className="font-display text-2xl text-primary">$202</span>
                </div>
                
                <div className="flex items-center justify-between bg-card/10 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-secondary-foreground/60">Levels 4-5</span>
                    <p className="font-display text-xl">Matrix commissions</p>
                  </div>
                  <span className="font-display text-2xl text-primary">$180</span>
                </div>

                <div className="border-t border-border/20 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl">Total Monthly</span>
                    <span className="font-display text-4xl text-primary">$598</span>
                  </div>
                  <p className="text-sm text-secondary-foreground/60 mt-2 text-center">
                    *Example based on 3-wide filled matrix with $50 base memberships
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 bg-primary/20 rounded-2xl blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;
