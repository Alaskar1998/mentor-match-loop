import { Search, Users, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

export const HowItWorksSection = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const steps = [
    {
      icon: Search,
      title: t('howItWorks.steps.step1.title'),
      description: t('howItWorks.steps.step1.description'),
      color: "text-primary"
    },
    {
      icon: Users,
      title: t('howItWorks.steps.step2.title'),
      description: t('howItWorks.steps.step2.description'),
      color: "text-accent"
    },
    {
      icon: BookOpen,
      title: t('howItWorks.steps.step3.title'),
      description: t('howItWorks.steps.step3.description'),
      color: "text-success"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
            {t('howItWorks.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="text-center group animate-fade-in relative"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Step Number */}
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant group-hover:shadow-glow transition-all duration-300">
                  <step.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-white`} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
                {step.description}
              </p>

                             
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};