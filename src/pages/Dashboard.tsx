import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { 
  Coins, 
  Trophy, 
  Target, 
  Flame, 
  Star,
  MessageSquare,
  Calendar,
  Map,
  Crown
} from 'lucide-react';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { CoinShopModal } from '@/components/gamification/CoinShopModal';
import { LeaderboardModal } from '@/components/gamification/LeaderboardModal';

const Dashboard = () => {
  const { user } = useAuth();
  const { state } = useGamification();
  const [showGamificationDashboard, setShowGamificationDashboard] = React.useState(false);
  const [showCoinShop, setShowCoinShop] = React.useState(false);
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);

  if (!user) return null;

  const profileCompletionItems = [
    { key: 'name', label: 'Name', completed: !!user.name },
    { key: 'email', label: 'Email', completed: !!user.email },
    { key: 'bio', label: 'Bio', completed: !!user.bio },
    { key: 'country', label: 'Country', completed: !!user.country },
    { key: 'skills', label: 'Skills', completed: user.skillsToTeach?.length > 0 },
    { key: 'photo', label: 'Profile Photo', completed: user.profilePicture !== '👤' },
  ];

  const completedItems = profileCompletionItems.filter(item => item.completed).length;
  const completionPercentage = (completedItems / profileCompletionItems.length) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">
              Manage your learning journey and track your progress
            </p>
          </div>
          {user.userType === 'premium' && (
            <Badge variant="default" className="gap-1">
              <Crown className="w-3 h-3" />
              Premium User
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Coins className="w-6 h-6 text-accent" />
                {state.appCoins}
              </div>
              <p className="text-sm text-muted-foreground">App Coins</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Flame className="w-6 h-6 text-orange-500" />
                {state.loginStreak}
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Target className="w-6 h-6 text-green-500" />
                {state.totalExchanges}
              </div>
              <p className="text-sm text-muted-foreground">Exchanges</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Trophy className="w-6 h-6 text-yellow-500" />
                {state.badges.length}
              </div>
              <p className="text-sm text-muted-foreground">Badges</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {completedItems}/{profileCompletionItems.length} sections completed
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              {completionPercentage < 100 && (
                <p className="text-sm text-muted-foreground">
                  Complete your profile to earn 50 coins and get better matches!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Active Chats</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Continue your conversations
              </p>
              <Button variant="outline" size="sm">View Chats</Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => setShowGamificationDashboard(true)}
          >
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h3 className="font-semibold">Earn Coins</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete tasks and earn rewards
              </p>
              <Button variant="outline" size="sm">Earn More</Button>
            </CardContent>
          </Card>

          {user.userType === 'premium' ? (
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-6 text-center">
                <Map className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold">Find Nearby</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover teachers around you
                </p>
                <Button variant="outline" size="sm">Open Map</Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-6 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-semibold">Upgrade Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock exclusive features
                </p>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Coins className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Earned 25 coins</p>
                  <p className="text-xs text-muted-foreground">Daily login bonus</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New message from Sarah</p>
                  <p className="text-xs text-muted-foreground">JavaScript exchange chat</p>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <GamificationDashboard
          isOpen={showGamificationDashboard}
          onClose={() => setShowGamificationDashboard(false)}
        />
        
        <CoinShopModal
          isOpen={showCoinShop}
          onClose={() => setShowCoinShop(false)}
        />
        
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;