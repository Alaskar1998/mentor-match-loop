import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { 
  Coins, 
  Trophy, 
  Target, 
  ShoppingCart,
  Calendar,
  Star,
  Gift
} from 'lucide-react';
import { GamificationDashboard } from './GamificationDashboard';
import { CoinShopModal } from './CoinShopModal';
import { LeaderboardModal } from './LeaderboardModal';

export const GamificationHeader = () => {
  const { state } = useGamification();
  const { user } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showCoinShop, setShowCoinShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!user) return null;

  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* User Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-accent" />
                <span className="font-semibold text-lg">{state.appCoins}</span>
                <span className="text-sm text-muted-foreground">coins</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">{state.loginStreak}</span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="font-semibold">{state.totalExchanges}</span>
                <span className="text-sm text-muted-foreground">exchanges</span>
              </div>

              {state.badges.length > 0 && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">{state.badges.length}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDashboard(true)}
                className="gap-2"
              >
                <Gift className="w-4 h-4" />
                Earn Coins
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCoinShop(true)}
                className="gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Coin Shop
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaderboard(true)}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </div>
          </div>

          {/* Active Challenge Preview */}
          {state.challenges.length > 0 && !state.challenges[0].isCompleted && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{state.challenges[0].title}</h4>
                  <Progress 
                    value={(state.challenges[0].progress / state.challenges[0].target) * 100} 
                    className="h-2 mt-1" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.challenges[0].progress}/{state.challenges[0].target} - 
                    Reward: {state.challenges[0].reward} coins
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Badges Display */}
          {state.badges.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Badges:</span>
              {state.badges.slice(0, 3).map((badge) => (
                <Badge key={badge.id} variant="secondary" className="gap-1">
                  {badge.icon} {badge.name}
                </Badge>
              ))}
              {state.badges.length > 3 && (
                <Badge variant="outline">
                  +{state.badges.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <GamificationDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
      
      <CoinShopModal
        isOpen={showCoinShop}
        onClose={() => setShowCoinShop(false)}
      />
      
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </>
  );
};