import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import { 
  Coins, 
  Flame, 
  Star, 
  Play,
  Gift,
  CheckCircle,
  Calendar,
  Target,
  Trophy
} from 'lucide-react';

export default function Gamification() {
  const { state, earnCoins, watchAd } = useGamification();
  const { user } = useAuth();

  const dailyBonusAmount = Math.min(5 + (state.loginStreak - 1) * 5, 30);
  const nextStreakBonus = Math.min(5 + state.loginStreak * 5, 30);

  const handleWatchAd = () => {
    watchAd();
  };

  const earningOptions = [
    {
      id: 'daily-login',
      title: 'Daily Login Bonus',
      description: `Day ${state.loginStreak} - Get ${dailyBonusAmount} coins`,
      icon: <Calendar className="w-5 h-5" />,
      status: 'claimed',
      reward: dailyBonusAmount,
      action: null
    },
    {
      id: 'profile-complete',
      title: 'Complete Profile',
      description: 'Fill out 100% of your profile for 50 coins',
      icon: <Star className="w-5 h-5" />,
      status: state.profileCompletion === 100 ? 'claimed' : 'available',
      reward: 50,
      progress: state.profileCompletion,
      action: state.profileCompletion < 100 ? 'complete-profile' : null
    },
    {
      id: 'watch-ad',
      title: 'Watch Advertisement',
      description: `Earn 10 coins per ad (${state.dailyAdsWatched}/5 today)`,
      icon: <Play className="w-5 h-5" />,
      status: user?.userType === 'premium' ? 'unavailable' : 
              state.dailyAdsWatched >= 5 ? 'limit-reached' : 'available',
      reward: 10,
      action: 'watch-ad'
    },
    {
      id: 'exchange-complete',
      title: 'Complete Exchange',
      description: 'Finish a skill exchange session',
      icon: <Target className="w-5 h-5" />,
      status: 'ongoing',
      reward: 20,
      mentorBonus: 10,
      action: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'claimed':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="w-3 h-3 mr-1" />
          Claimed
        </Badge>;
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'limit-reached':
        return <Badge variant="secondary">Limit Reached</Badge>;
      case 'unavailable':
        return <Badge variant="outline">Premium User</Badge>;
      case 'ongoing':
        return <Badge variant="outline">Active</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coins & Gamification</h1>
        <p className="text-muted-foreground">Earn coins and track your progress</p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-accent/10 to-accent/5">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold">
              <Coins className="w-8 h-8 text-accent" />
              {state.appCoins}
            </div>
            <p className="text-muted-foreground">Total Coins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-100/50 to-red-100/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold">
              <Flame className="w-8 h-8 text-orange-500" />
              {state.loginStreak}
            </div>
            <p className="text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-100/50 to-blue-100/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold">
              <Trophy className="w-8 h-8 text-purple-500" />
              {state.badges.length}
            </div>
            <p className="text-muted-foreground">Badges Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Streak Milestone */}
      <Card className="border border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-800">Streak Reward</h3>
              <p className="text-orange-600">
                Come back tomorrow for {nextStreakBonus} coins!
              </p>
            </div>
            <Flame className="w-12 h-12 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Earning Options */}
      <Card>
        <CardHeader>
          <CardTitle>Ways to Earn Coins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {earningOptions.map((option) => (
            <Card key={option.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{option.title}</h4>
                        {getStatusBadge(option.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      
                      {option.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={option.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {option.progress.toFixed(0)}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold">
                      <Coins className="w-4 h-4 text-accent" />
                      {option.reward}
                      {option.mentorBonus && (
                        <span className="text-sm text-green-600">
                          (+{option.mentorBonus} 🌟)
                        </span>
                      )}
                    </div>
                    
                    {option.action === 'watch-ad' && option.status === 'available' && (
                      <Button size="sm" onClick={handleWatchAd} className="mt-2">
                        <Play className="w-3 h-3 mr-1" />
                        Watch Ad
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.challenges.map((challenge) => (
            <Card key={challenge.id} className="border border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{challenge.title}</h4>
                      {challenge.isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                    
                    <Progress 
                      value={(challenge.progress / challenge.target) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {challenge.progress}/{challenge.target} completed
                    </p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1 text-lg font-bold">
                      <Gift className="w-4 h-4 text-blue-600" />
                      {challenge.reward}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}