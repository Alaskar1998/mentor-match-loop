import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Trophy, Target, TrendingUp, Gift, Star } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { LeaderboardModal } from '@/components/gamification/LeaderboardModal';
import { CoinShopModal } from '@/components/gamification/CoinShopModal';

export default function Gamification() {
  const { state } = useGamification();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCoinShop, setShowCoinShop] = useState(false);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Star className="w-5 h-5 text-gray-400" />;
      case 3: return <Star className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gamification Center</h1>
          <p className="text-muted-foreground">Track your progress, earn rewards, and compete with others!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.appCoins}</div>
              <p className="text-xs text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.loginStreak}</div>
              <p className="text-xs text-muted-foreground">Consecutive days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exchanges</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.totalExchanges}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.badges.length}</div>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => setShowDashboard(true)}
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Target className="w-6 h-6" />
            <span>View Dashboard</span>
          </Button>

          <Button 
            onClick={() => setShowLeaderboard(true)}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Trophy className="w-6 h-6" />
            <span>Leaderboard</span>
          </Button>

          <Button 
            onClick={() => setShowCoinShop(true)}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Coins className="w-6 h-6" />
            <span>Coin Shop</span>
          </Button>
        </div>

        {/* Challenges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.challenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={challenge.isCompleted ? "default" : "secondary"}>
                      {challenge.isCompleted ? "Completed" : "Active"}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Coins className="w-4 h-4" />
                      <span>{challenge.reward}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
          </CardHeader>
          <CardContent>
            {state.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {state.badges.map((badge) => (
                  <div key={badge.id} className="text-center p-4 border rounded-lg">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h3 className="font-semibold text-sm">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No badges earned yet. Complete challenges to earn badges!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <GamificationDashboard 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)} 
      />
      
      <LeaderboardModal 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
      
      <CoinShopModal 
        isOpen={showCoinShop} 
        onClose={() => setShowCoinShop(false)} 
      />
    </div>
  );
} 