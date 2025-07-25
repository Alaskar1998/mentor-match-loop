import { Search, Users, BookOpen } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search for a skill",
    description: "Browse thousands of skills or search for exactly what you want to learn",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Connect with a teacher",
    description: "Find passionate teachers in your area or online who love sharing knowledge",
    color: "text-accent"
  },
  {
    icon: BookOpen,
    title: "Exchange knowledge for free",
    description: "Learn something new while teaching others what you know best",
    color: "text-success"
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. Join thousands of learners and teachers in our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Step Number */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant group-hover:shadow-glow transition-all duration-300">
                  <step.icon className={`w-8 h-8 text-white`} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Connection Line (for desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 transform translate-x-full w-full">
                  <div className="w-full h-0.5 bg-gradient-to-r from-primary/30 to-accent/30 relative">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-accent rounded-full" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};