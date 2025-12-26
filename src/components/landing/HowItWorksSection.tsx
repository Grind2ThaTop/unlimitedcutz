import { BookOpen, CreditCard, Scissors, UserPlus } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up",
    description: "Create your account and add your household members (up to 2 included in base).",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Subscribe",
    description: "Choose your plan and complete secure checkout. Instant activation on payment.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Book",
    description: "Schedule appointments for any named household member through our booking system.",
  },
  {
    icon: Scissors,
    step: "04",
    title: "Get Fresh",
    description: "Show your membership card at check-in. Enjoy unlimited grooming, one visit per week per person.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
            GET STARTED IN<span className="text-primary"> MINUTES</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps to unlimited grooming for your household.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="relative bg-card rounded-xl p-6 border border-border/50 text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-display text-sm flex items-center justify-center">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mt-4 mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display text-2xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
