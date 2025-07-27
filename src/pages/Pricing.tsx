import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PricingPage = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started with skill exchange",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: <Star className="w-6 h-6" />,
      popular: false,
      features: [
        "Limited invites",
        "First 3 search results visible",
        "Basic filters only",
        "Country-only search",
        "Ads visible"
      ],
      limitations: [
        "Profiles beyond 3rd result are blurred",
        "No map search",
        "No mentor filter",
        "No early event access"
      ]
    },
    {
      name: "Premium",
      description: "Unlock unlimited learning opportunities",
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      features: [
        "Unlimited invites",
        "Worldwide search + map search",
        "Full filters (including Mentor filter)",
        "Up to 3 invite messages",
        "No ads",
        "Early event access"
      ]
    }
  ];

  const handleUpgrade = (planName: string, price: number) => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan");
      return;
    }
    
    // TODO: Implement Stripe integration
    toast.info(`${planName} plan upgrade coming soon! Price: $${price}/${billingCycle}`);
  };

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.yearlyPrice;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock your learning potential with our flexible pricing plans. 
            Start free and upgrade as you grow.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative h-6 w-11 rounded-full p-0"
            >
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-primary transition-transform ${
                billingCycle === "yearly" ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </Button>
            <span className={`text-sm ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <Badge variant="secondary" className="ml-2">Save up to 20%</Badge>
            )}
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
                    Most Popular
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
                      {plan.monthlyPrice === 0 ? "Free" : `$${getPrice(plan)}`}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    )}
                  </div>
                  {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Save {getSavings(plan)}% annually
                    </p>
                  )}
                </div>
                
                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-3 text-green-600">✅ What's Included:</h4>
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Limitations for Free tier */}
                  {plan.limitations && (
                    <>
                      <h4 className="font-semibold text-sm mb-3 text-orange-600">⚠️ Limitations:</h4>
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
                
                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleUpgrade(plan.name, getPrice(plan))}
                >
                  {plan.monthlyPrice === 0 ? "Get Started Free" : (user ? "Upgrade Now" : "Sign Up to Continue")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                You can start with limited free access. All paid plans come with a 14-day money-back guarantee.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;