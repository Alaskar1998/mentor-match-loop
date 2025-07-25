import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMonetization } from "@/hooks/useMonetization";
import { 
  Crown, 
  Check, 
  X, 
  MapPin, 
  MessageSquare, 
  Search,
  Filter,
  Calendar,
  Coins,
  Gift,
  Zap
} from 'lucide-react';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumUpgradeModal = ({ isOpen, onClose }: PremiumUpgradeModalProps) => {
  const { user } = useAuth();
  const { userTier } = useMonetization();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // This will integrate with Stripe subscription checkout
      console.log('Upgrading to Premium...');
      // Implement Stripe checkout integration here
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Unlimited Invites",
      description: "Send as many learning invitations as you want",
      free: "3 per month",
      premium: "Unlimited"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Worldwide Search",
      description: "Find teachers and learners globally",
      free: "Country only",
      premium: "Worldwide"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Map Search",
      description: "Discover teachers nearby with interactive map",
      free: false,
      premium: true
    },
    {
      icon: <Filter className="w-5 h-5" />,
      title: "Advanced Filters",
      description: "Filter by mentor status, skill level, and more",
      free: "Basic filters",
      premium: "All filters"
    },
    {
      icon: <X className="w-5 h-5" />,
      title: "Ad-Free Experience",
      description: "Enjoy learning without interruptions",
      free: "Ads visible",
      premium: "No ads"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Early Event Access",
      description: "Get first access to exclusive workshops",
      free: false,
      premium: true
    },
    {
      icon: <Coins className="w-5 h-5" />,
      title: "Monthly Coin Stipend",
      description: "Receive coins every month automatically",
      free: "0 coins",
      premium: "300 coins/month"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Discounted Purchases",
      description: "Save on profile boosts and premium features",
      free: "Full price",
      premium: "Up to 35% off"
    }
  ];

  const renderFeatureValue = (feature: any) => {
    if (typeof feature.free === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {feature.free ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
            <span className="text-sm">Free</span>
          </div>
          <div className="flex items-center gap-1">
            {feature.premium ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
            <span className="text-sm font-medium">Premium</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{feature.free}</span>
        <span className="text-sm">→</span>
        <span className="text-sm font-medium text-primary">{feature.premium}</span>
      </div>
    );
  };

  if (userTier === 'premium') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              You're Premium!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Premium Active</h3>
            <p className="text-muted-foreground">
              You're enjoying all premium features! Manage your subscription anytime.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button className="flex-1">
              Manage Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        {/* Pricing */}
        <Card className="border-primary bg-gradient-to-r from-primary/5 to-yellow-500/5">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
            </div>
            <div className="text-4xl font-bold">$9.99<span className="text-lg text-muted-foreground">/month</span></div>
            <p className="text-muted-foreground">Unlock unlimited learning potential</p>
          </CardHeader>
        </Card>

        {/* Features Comparison */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center mb-4">What you get with Premium</h3>
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    {renderFeatureValue(feature)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button 
            onClick={handleUpgrade} 
            disabled={isLoading}
            className="flex-1 gap-2"
          >
            <Crown className="w-4 h-4" />
            {isLoading ? "Processing..." : "Upgrade Now"}
          </Button>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          💝 Cancel anytime • 30-day money-back guarantee
        </div>
      </DialogContent>
    </Dialog>
  );
};