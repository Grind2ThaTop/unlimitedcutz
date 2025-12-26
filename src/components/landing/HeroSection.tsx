import { Scissors, Star, Users, Calendar, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-barbershop.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Premium barbershop interior" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Scissors className="w-32 h-32 text-primary rotate-45" />
      </div>
      <div className="absolute bottom-40 right-20 opacity-10">
        <Crown className="w-24 h-24 text-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground/90">
              Limited Membership Available
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground leading-none mb-6 animate-fade-in-up delay-100">
            MAGNETIC
            <span className="block text-primary">BARBERING</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-4 animate-fade-in-up delay-200">
            by <span className="font-semibold text-primary-foreground">Rog tha Barber</span>
          </p>

          {/* Description */}
          <p className="text-lg text-primary-foreground/70 max-w-xl mb-8 animate-fade-in-up delay-300">
            Premium grooming membership for the modern gentleman. Unlimited cuts, 
            exclusive benefits, and a community that pays you to share.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-8 mb-10 animate-fade-in-up delay-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display text-primary-foreground">2+</p>
                <p className="text-sm text-primary-foreground/60">People Included</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display text-primary-foreground">∞</p>
                <p className="text-sm text-primary-foreground/60">Unlimited Cuts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display text-primary-foreground">$50</p>
                <p className="text-sm text-primary-foreground/60">Per Month</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-500">
            <Button variant="hero" size="xl">
              Join Membership
            </Button>
            <Button variant="heroOutline" size="xl">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
