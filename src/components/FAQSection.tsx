import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this really free?",
    answer: "Yes! Our core skill exchange platform is completely free to use. You can search for skills, connect with teachers, and exchange knowledge without any cost. We believe learning should be accessible to everyone. We do offer premium features for enhanced experiences, but the fundamental skill sharing remains free forever."
  },
  {
    question: "What is a Mentor Badge?",
    answer: "A Mentor Badge (🌟) is earned by active teachers who consistently provide high-quality learning experiences. To earn this badge, teachers need to maintain a 4.5+ star rating, help at least 10 students, and be active in the community. Mentor Badge holders get priority visibility in search results and access to exclusive teacher tools."
  },
  {
    question: "Can I search locally?",
    answer: "Absolutely! You can filter your search to find teachers and learners in your local area. We support both in-person and online learning options. Use our location filters to find people nearby for face-to-face sessions, or connect with anyone globally for virtual learning experiences."
  },
  {
    question: "How do I ensure my safety when meeting someone?",
    answer: "Your safety is our top priority. We verify all users through email and phone verification. We recommend starting with video calls before meeting in person, meeting in public places, and using our in-app messaging system initially. All users can be rated and reviewed, helping maintain a trustworthy community."
  },
  {
    question: "What if I'm not satisfied with a learning session?",
    answer: "We have a community-driven rating system where you can leave honest feedback about your experience. If there are serious issues, our support team investigates reports and can take action including warnings or removing users who violate our community guidelines."
  },
  {
    question: "How do I become a good teacher on the platform?",
    answer: "Great teachers are patient, prepared, and passionate about sharing knowledge. Create a detailed profile highlighting your expertise, be responsive to messages, prepare structured lessons, and always be encouraging. Our top teachers often share resources, give homework, and follow up with students' progress."
  }
];

export const FAQSection = () => {
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
              Our community support team is here to help you get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Contact Support
              </button>
              <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
                Join Discord Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};