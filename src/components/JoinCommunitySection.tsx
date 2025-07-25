import { ArrowRight, Users, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Users,
    title: "Connect with 15K+ learners",
    description: "Join a vibrant community of passionate teachers and students"
  },
  {
    icon: BookOpen,
    title: "Learn anything for free",
    description: "Access thousands of skills from cooking to coding, music to marketing"
  },
  {
    icon: Heart,
    title: "Make meaningful connections",
    description: "Build lasting friendships while sharing knowledge and growing together"
  }
];

export const JoinCommunitySection = () => {
  const handleSignUp = () => {
    console.log("Navigate to signup flow");
    // Navigation logic would go here
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-warm/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <div className="mb-16 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Start Your
              <br />
              <span className="bg-gradient-to-r from-accent to-warm bg-clip-text text-transparent">
                Learning Journey?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of learners and teachers sharing knowledge every day. 
              It's completely free to start!
            </p>
            
            <Button 
              variant="hero"
              size="lg"
              onClick={handleSignUp}
              className="bg-white text-primary hover:bg-white/90 text-xl px-12 py-6 rounded-full shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-105 font-semibold"
            >
              Sign up and start learning for free
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title}
                className="bg-white/10 backdrop-blur-sm border-white/20 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-white/80 text-sm">Free to Use</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80 text-sm">Community Support</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Safe</div>
              <div className="text-white/80 text-sm">Verified Members</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Global</div>
              <div className="text-white/80 text-sm">Worldwide Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};