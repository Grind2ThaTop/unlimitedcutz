import { Check, Scissors, Users, Calendar, Gift, TrendingUp, ShoppingBag } from "lucide-react";

const features = [
  {
    icon: Scissors,
    title: "Unlimited Grooming",
    description: "Get fresh cuts as often as you like. One visit per person per week keeps you looking sharp.",
  },
  {
    icon: Users,
    title: "Connections Coverage",
    description: "Base membership covers 2 people. Add more connections — friends, partners, coworkers — for just $25/month each.",
  },
  {
    icon: Calendar,
    title: "Priority Booking",
    description: "Skip the wait with priority appointment scheduling. Your time matters.",
  },
  {
    icon: Gift,
    title: "Referral Rewards",
    description: "Earn $25 per referral plus ongoing monthly bonuses. Build your network, build your income.",
  },
  {
    icon: TrendingUp,
    title: "Matrix Commissions",
    description: "5-level deep matrix compensation. Earn on your entire network's membership fees.",
  },
  {
    icon: ShoppingBag,
    title: "Member Store",
    description: "Exclusive access to premium grooming products at member-only prices.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Membership Benefits
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
            MORE THAN JUST<span className="text-primary"> HAIRCUTS</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete grooming membership with built-in earning potential. 
            Look good, save money, and earn while you share.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group bg-card rounded-xl p-8 shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Check className="w-5 h-5 text-primary" />
            <span>Cancel anytime</span>
            <span className="mx-2">•</span>
            <Check className="w-5 h-5 text-primary" />
            <span>No long-term contracts</span>
            <span className="mx-2">•</span>
            <Check className="w-5 h-5 text-primary" />
            <span>Instant activation</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
