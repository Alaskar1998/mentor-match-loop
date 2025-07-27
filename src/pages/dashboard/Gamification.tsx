import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Trophy,
  Crown,
  Medal,
  ShoppingBag
} from 'lucide-react';

export default function Gamification() {
  const { state, earnCoins, watchAd } = useGamification();
  const { user } = useAuth();

  // Mock leaderboard data - replace with real data from your backend
  const leaderboardData = [
    { id: 1, name: 'Sarah Johnson', avatar: null, points: 2840, rank: 1, isCurrentUser: false },
    { id: 2, name: 'Mike Chen', avatar: null, points: 2650, rank: 2, isCurrentUser: false },
    { id: 3, name: 'Emma Davis', avatar: null, points: 2420, rank: 3, isCurrentUser: false },
    { id: 4, name: 'Alex Thompson', avatar: null, points: 2180, rank: 4, isCurrentUser: false },
    { id: 5, name: 'Lisa Wang', avatar: null, points: 1950, rank: 5, isCurrentUser: false },
    { id: 6, name: user?.name || 'You', avatar: user?.profilePicture, points: 1750, rank: 6, isCurrentUser: true },
    { id: 7, name: 'David Kim', avatar: null, points: 1620, rank: 7, isCurrentUser: false },
    { id: 8, name: 'Maria Garcia', avatar: null, points: 1480, rank: 8, isCurrentUser: false },
  ];

  // Mock coin shop items - replace with real data from your backend
  const coinShopItems = [
    {
      id: 1,
      name: 'Premium Profile Badge',
      description: 'Stand out with a premium profile badge',
      price: 500,
      category: 'badges',
      image: null,
      available: true
    },
    {
      id: 2,
      name: 'Priority Support',
      description: 'Get faster customer support responses',
      price: 300,
      category: 'services',
      image: null,
      available: true
    },
    {
      id: 3,
      name: 'Custom Avatar Frame',
      description: 'Unique avatar frame for your profile',
      price: 200,
      category: 'cosmetics',
      image: null,
      available: true
    },
    {
      id: 4,
      name: 'Extended Chat History',
      description: 'Keep chat history for 1 year',
      price: 150,
      category: 'services',
      image: null,
      available: true
    },
    {
      id: 5,
      name: 'Skill Verification Badge',
      description: 'Verified skill badge for your profile',
      price: 400,
      category: 'badges',
      image: null,
      available: false
    },
    {
      id: 6,
      name: 'Advanced Search Filters',
      description: 'Access to advanced search options',
      price: 250,
      category: 'features',
      image: null,
      available: true
    }
  ];

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

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  // Handle coin shop item purchase
  const handlePurchase = (item: any) => {
    if (state.appCoins < item.price) {
      // Show insufficient coins message
      return;
    }
    // Implement purchase logic here
    console.log('Purchasing:', item.name);
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

      {/* Leaderboard Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top performers this month
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  user.isCurrentUser 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(user.rank)}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className={`font-medium ${user.isCurrentUser ? 'text-primary' : ''}`}>
                      {user.name}
                      {user.isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {user.points.toLocaleString()} points
                    </p>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <Coins className="w-4 h-4 text-accent" />
                    {user.points.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coin Shop Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Coin Shop
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Redeem your coins for exclusive items and features
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coinShopItems.map((item) => (
              <Card 
                key={item.id} 
                className={`relative overflow-hidden transition-all hover:shadow-md ${
                  !item.available ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Item Image Placeholder */}
                  <div className="w-full h-32 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg mb-4 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-accent" />
                  </div>

                  {/* Item Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      {!item.available && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>

                    {/* Price and Purchase */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-accent" />
                        <span className="font-bold">{item.price}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        disabled={!item.available || state.appCoins < item.price}
                        onClick={() => handlePurchase(item)}
                        className="text-xs"
                      >
                        {!item.available 
                          ? 'Coming Soon' 
                          : state.appCoins < item.price 
                            ? 'Insufficient Coins' 
                            : 'Purchase'
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}