import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the membership work?",
    answer: "Your membership includes unlimited grooming for up to 2 named connections. Each person can visit once per week. You can add additional connections for $25/month each. Book appointments through our system and show your membership card at check-in.",
  },
  {
    question: "Can I swap connections?",
    answer: "No, memberships are for named connections only. You cannot swap people in and out. If you remove a connection, that slot is locked for a period before it can be reassigned. This ensures fair usage and maintains our service quality.",
  },
  {
    question: "Who can I add as a connection?",
    answer: "Anyone! Connections don't need to live together. Add friends, partners, kids, coworkers, or anyone else you want to share your membership benefits with.",
  },
  {
    question: "What grooming services are included?",
    answer: "The membership covers all standard grooming services including haircuts, beard trims, lineups, and basic styling. Premium add-on services may be available for an additional fee.",
  },
  {
    question: "How do referral commissions work?",
    answer: "When you refer new members, you earn Fast Start Bonuses (one-time $25/$10/$5 for levels 1-3), Level Bonuses (recurring $25/$10/$5 monthly for levels 1-3), and Matrix Commissions (10%/8%/5%/3%/2% on membership fees through 5 levels). You must be an active paying member to earn.",
  },
  {
    question: "What is the 3-wide forced matrix?",
    answer: "Our compensation plan uses a 3-wide forced matrix. Each position can only have 3 direct referrals (Level 1). Additional referrals 'spill over' to fill your downline. This helps everyone build their network and earn together.",
  },
  {
    question: "When do I get paid?",
    answer: "Commissions are calculated monthly. You must maintain an active, paid membership to receive any commission payouts. Past due accounts have commissions paused until resolved.",
  },
  {
    question: "Can I cancel my membership?",
    answer: "Yes, you can cancel anytime. Cancellation takes effect at the end of your current billing cycle. You'll retain access until then. Canceled members lose access to the referral program and forfeit pending commissions.",
  },
  {
    question: "Is there a membership cap?",
    answer: "We maintain limited membership to ensure quality service. When our cap is reached, new signups join a waitlist. We'll notify waitlisted individuals when spots open up.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 mb-6">
            QUESTIONS?<span className="text-primary"> ANSWERED.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Magnetic Barbering membership.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
              >
                <AccordionTrigger className="text-left font-display text-xl hover:no-underline hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
