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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import { useMonetization } from "@/hooks/useMonetization";
import { useAuth } from "@/hooks/useAuth";
import { 
  Coins, 
  Gift, 
  Star, 
  MessageSquare, 
  FileText, 
  Zap, 
  Pin,
  Palette,
  Shield,
  Play,
  Crown
} from 'lucide-react';

interface CoinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinShopModal = ({ isOpen, onClose }: CoinShopModalProps) => {
  const { state, spendCoins, purchaseCoins } = useGamification();
  const { getCoinPrice, canUseFeature } = useMonetization();
  const { user } = useAuth();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const spendingOptions = [
    {
      id: 'extra-invite',
      name: 'Extra Invite',
      description: 'Send one additional invitation this month',
      price: 50,
      icon: <MessageSquare className="w-5 h-5" />,
      availability: user?.userType === 'free' ? 'available' : 'premium-only',
      category: 'features'
    },
    {
      id: 'message-invite',
      name: 'Message with Invite',
      description: 'Send a message along with your invitation',
      price: 30,
      icon: <MessageSquare className="w-5 h-5" />,
      availability: user?.userType === 'free' ? 'available' : 'premium-only',
      category: 'features'
    },
    {
      id: 'learning-request',
      name: 'Learning Request Post',
      description: 'Create a learning request post',
      price: 100,
      icon: <FileText className="w-5 h-5" />,
      availability: user?.userType === 'free' ? 'available' : 'premium-only',
      category: 'features'
    },
    {
      id: 'profile-boost',
      name: 'Profile Boost (24h)',
      description: 'Feature your profile for 24 hours',
      price: getCoinPrice('profile-boost', user?.userType === 'premium' ? 100 : 150),
      icon: <Zap className="w-5 h-5" />,
      availability: 'available',
      category: 'boost'
    },
    {
      id: 'pinned-review',
      name: 'Pinned Review',
      description: 'Pin your best review to the top of your profile',
      price: getCoinPrice('pinned-review', 200),
      icon: <Pin className="w-5 h-5" />,
      availability: 'available',
      category: 'boost'
    },
    {
      id: 'skill-verification',
      name: 'Skill Verification Badge',
      description: 'Get verified badge for your expertise (Coming Soon)',
      price: 500,
      icon: <Shield className="w-5 h-5" />,
      availability: 'coming-soon',
      category: 'badges'
    },
    {
      id: 'custom-theme',
      name: 'Custom Profile Theme',
      description: 'Unlock custom colors for your profile (Coming Soon)',
      price: 100,
      icon: <Palette className="w-5 h-5" />,
      availability: 'coming-soon',
      category: 'cosmetic'
    }
  ];

  const coinPacks = [
    {
      id: 'starter',
      name: 'Starter Pack',
      coins: 100,
      price: 0.99,
      bonus: 0,
      popular: false
    },
    {
      id: 'learner',
      name: 'Learner Pack',
      coins: 500,
      bonus: 100,
      price: 4.99,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      coins: 1000,
      bonus: 400,
      price: 9.99,
      popular: true
    },
    {
      id: 'mega',
      name: 'Mega Mentor Pack',
      coins: 2000,
      bonus: 1200,
      price: 19.99,
      popular: false
    }
  ];

  const handlePurchase = (itemId: string) => {
    const item = spendingOptions.find(opt => opt.id === itemId);
    if (!item) return;

    if (item.availability === 'coming-soon') {
      return;
    }

    if (item.availability === 'premium-only' && user?.userType !== 'free') {
      return;
    }

    const success = spendCoins(item.price, item.name);
    if (success) {
      // Handle the purchase logic here
      console.log('Purchased:', item.name);
    }
  };

  const handleCoinPackPurchase = (packId: string) => {
    setSelectedPack(packId);
    purchaseCoins(packId);
  };

  const categorizeItems = (category: string) => {
    return spendingOptions.filter(item => item.category === category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <Coins className="w-6 h-6 text-accent" />
            Coin Shop
          </DialogTitle>
        </DialogHeader>

        {/* Current Balance */}
        <div className="text-center p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            <Coins className="w-6 h-6 text-accent" />
            {state.appCoins} Coins
          </div>
        </div>

        <Tabs defaultValue="spend" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spend">Spend Coins</TabsTrigger>
            <TabsTrigger value="buy">Buy Coins</TabsTrigger>
          </TabsList>

          <TabsContent value="spend" className="space-y-4 max-h-[50vh] overflow-y-auto">
            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Features & Actions
              </h3>
              <div className="grid gap-3">
                {categorizeItems('features').map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <Coins className="w-4 h-4 text-accent" />
                          {item.price}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item.id)}
                          disabled={
                            state.appCoins < item.price || 
                            item.availability === 'premium-only' ||
                            item.availability === 'coming-soon'
                          }
                          className="mt-1"
                        >
                          {item.availability === 'premium-only' ? 'Premium Only' :
                           item.availability === 'coming-soon' ? 'Coming Soon' : 'Buy'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Boosts */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Profile Boosts
              </h3>
              <div className="grid gap-3">
                {categorizeItems('boost').map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <Coins className="w-4 h-4 text-accent" />
                          {item.price}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item.id)}
                          disabled={state.appCoins < item.price}
                          className="mt-1"
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Coming Soon */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Coming Soon
              </h3>
              <div className="grid gap-3">
                {[...categorizeItems('badges'), ...categorizeItems('cosmetic')].map((item) => (
                  <Card key={item.id} className="p-3 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold text-muted-foreground">
                          <Coins className="w-4 h-4" />
                          {item.price}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          Coming Soon
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="buy" className="space-y-4">
            <div className="grid gap-4">
              {coinPacks.map((pack) => (
                <Card key={pack.id} className={`relative ${pack.popular ? 'ring-2 ring-primary' : ''}`}>
                  {pack.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Crown className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{pack.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-accent" />
                            <span className="font-medium">{pack.coins}</span>
                          </div>
                          {pack.bonus > 0 && (
                            <>
                              <span className="text-muted-foreground">+</span>
                              <div className="flex items-center gap-1 text-green-600">
                                <Gift className="w-4 h-4" />
                                <span className="font-medium">{pack.bonus}</span>
                              </div>
                            </>
                          )}
                        </div>
                        {pack.bonus > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            +{Math.round((pack.bonus / pack.coins) * 100)}% bonus coins!
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${pack.price}</div>
                        <Button
                          onClick={() => handleCoinPackPurchase(pack.id)}
                          className="mt-2"
                          variant={pack.popular ? 'default' : 'outline'}
                        >
                          Purchase
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              💳 Secure payment powered by Stripe
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};