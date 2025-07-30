import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the skill exchange work?",
    answer: "Our platform connects people who want to learn and teach skills. You can offer to teach something you're good at in exchange for learning something from someone else. It's a win-win system where everyone benefits from knowledge sharing."
  },
  {
    question: "Is it really free to use?",
    answer: "Yes! Our basic platform is completely free to use. You can create an account, find teachers, and start learning without paying anything. We also offer premium features for advanced users who want additional benefits."
  },
  {
    question: "How do I find a teacher for the skill I want to learn?",
    answer: "Use our search feature to find teachers by skill, location, or rating. You can filter results to find the perfect match for your learning goals. Once you find someone, you can send them an invitation to start an exchange."
  },
  {
    question: "What if I don't have any skills to teach?",
    answer: "Everyone has something valuable to share! Think about your hobbies, work experience, or even basic life skills. You might be surprised at what others want to learn. We also offer mentorship sessions where experienced teachers help beginners."
  },
  {
    question: "How do I ensure a safe learning environment?",
    answer: "We have several safety measures in place: verified profiles, user ratings and reviews, and community guidelines. We recommend meeting in public places for in-person exchanges and using video calls for online sessions. Always trust your instincts and report any concerns."
  },
  {
    question: "Can I learn multiple skills at once?",
    answer: "Absolutely! You can engage in multiple skill exchanges simultaneously. Many users learn several skills at once, which is a great way to maximize your learning potential and meet more people in our community."
  }
];

export const FAQSection = React.memo(() => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our skill exchange platform
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 shadow-card hover:shadow-elegant transition-all duration-300 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-subtle rounded-lg border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Contact Support
              </button>
              <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
                View Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});