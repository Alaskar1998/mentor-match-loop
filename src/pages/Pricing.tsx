import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { UpgradeRequestButton } from "@/components/monetization/UpgradeRequestButton";

const PricingPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: t('pricing.plans.free.name'),
      description: t('pricing.plans.free.description'),
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: <Star className="w-6 h-6" />,
      popular: false,
      features: t('pricing.plans.free.features', { returnObjects: true }) as string[],
      // Fallback to empty array if limitations translation doesn't exist (e.g., for free plan)
      limitations: t('pricing.plans.free.limitations', { returnObjects: true }) as string[] || [],
      cta: t('pricing.plans.free.cta')
    },
    {
      name: t('pricing.plans.premium.name'),
      description: t('pricing.plans.premium.description'),
      monthlyPrice: 4.99, // Production amount
      yearlyPrice: 49.99, // Production amount (17% discount: 4.99 * 12 * 0.83 = 49.99)
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      features: t('pricing.plans.premium.features', { returnObjects: true }) as string[],
      cta: user ? t('pricing.plans.premium.cta') : t('pricing.plans.premium.ctaSignedOut')
    }
  ];

  const handleUpgrade = (planName: string, price: number) => {
    if (!user) {
      toast.error(t('pricing.upgradeError'));
      return;
    }
    
    // TODO: Implement Stripe integration
    toast.info(t('pricing.comingSoon', { 
      planName, 
      price, 
      cycle: billingCycle === "monthly" ? "mo" : "yr" 
    }));
  };

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0; // Free plan has no savings
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
          
          {/* Billing Selection */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className="text-sm font-medium">{t('pricing.billing.monthly')}</span>
            </button>
            
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">{t('pricing.billing.yearly')}</span>
                <span className="text-xs text-green-500 font-medium">
                  {t('pricing.billing.saveUpTo')}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? "border-primary shadow-elegant scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    {t('pricing.popular')}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      {plan.monthlyPrice === 0 ? t('pricing.plans.free.price') : `$${getPrice(plan)}`}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    )}
                  </div>
                  {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {t('pricing.saveAnnually', { percent: getSavings(plan) })}
                    </p>
                  )}
                </div>
                
                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3 text-green-600">{t('pricing.whatsIncluded')}</h4>
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Limitations section - only render if limitations exist, are an array, and have items */}
                  {plan.limitations && Array.isArray(plan.limitations) && plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-semibold text-sm mb-3 text-orange-600">{t('pricing.limitations')}</h4>
                      <ul className="space-y-3 mb-4">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start gap-3">
                            <span className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0 text-center">•</span>
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                
                {/* Only show button for premium plans - free plan has no button */}
                {plan.monthlyPrice > 0 && (
                  <UpgradeRequestButton
                    planName={plan.name}
                    price={getPrice(plan)}
                    billingCycle={billingCycle}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.faq.title')}</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.faq.questions.changePlan.question')}</h3>
              <p className="text-muted-foreground">
                {t('pricing.faq.questions.changePlan.answer')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.faq.questions.freeTrial.question')}</h3>
              <p className="text-muted-foreground">
                {t('pricing.faq.questions.freeTrial.answer')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.faq.questions.paymentMethods.question')}</h3>
              <p className="text-muted-foreground">
                {t('pricing.faq.questions.paymentMethods.answer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;