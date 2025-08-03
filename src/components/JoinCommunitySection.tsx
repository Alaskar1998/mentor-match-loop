import { ArrowRight, Users, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const JoinCommunitySection = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Users,
      title: t('actions.connectWithLearners'),
      description: t('actions.joinVibrantCommunity')
    },
    {
      icon: BookOpen,
      title: t('actions.learnAnythingFree'),
      description: t('actions.accessThousandsSkills')
    },
    {
      icon: Heart,
      title: t('actions.makeMeaningfulConnections'),
      description: t('actions.buildLastingFriendships')
    }
  ];

  const handleSignUp = () => {
    console.log("Navigate to signup flow");
    // Navigation logic would go here
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 sm:w-48 sm:h-48 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-warm/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <div className="mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
              {t('joinCommunity.title')}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              {t('joinCommunity.subtitle')}
            </p>
            
            <Button 
              variant="hero"
              size="lg"
              onClick={handleSignUp}
              className="bg-white text-primary hover:bg-white/90 text-base sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-glow hover:shadow-elegant transition-all duration-300 hover:scale-105 font-semibold w-full sm:w-auto"
            >
              {t('joinCommunity.cta')}
              <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
            </Button>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title}
                className="bg-white/10 backdrop-blur-sm border-white/20 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">100%</div>
              <div className="text-white/80 text-xs sm:text-sm">{t('actions.freeToUse')}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">24/7</div>
              <div className="text-white/80 text-xs sm:text-sm">{t('actions.communitySupport')}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">Safe</div>
              <div className="text-white/80 text-xs sm:text-sm">{t('actions.verifiedMembers')}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">Global</div>
              <div className="text-white/80 text-xs sm:text-sm">{t('actions.worldwideAccess')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};