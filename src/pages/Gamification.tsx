import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Coins,
  Lock,
  Sparkles,
  Crown,
  Trophy,
  Target,
  Calendar,
  Star,
  Gift,
  ShoppingCart,
  TrendingUp,
  Award,
  Users,
  Zap,
  Globe,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Gamification = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'coin-system',
      title: 'Coin System',
      description: 'Earn coins through daily logins, completing exchanges, and achieving milestones.',
      icon: <Coins className="w-6 h-6 text-yellow-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'daily-rewards',
      title: 'Daily Rewards',
      description: 'Log in daily to earn coins and maintain your streak for bonus rewards.',
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'badge-system',
      title: 'Badge System',
      description: 'Unlock badges for achievements, mentoring, and special milestones.',
      icon: <Award className="w-6 h-6 text-purple-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'exchange-rewards',
      title: 'Exchange Rewards',
      description: 'Earn coins and experience points for completing successful skill exchanges.',
      icon: <Target className="w-6 h-6 text-green-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Compete with other users and climb the leaderboard rankings.',
      icon: <Trophy className="w-6 h-6 text-orange-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'coin-shop',
      title: 'Coin Shop',
      description: 'Spend your coins on premium features and exclusive items.',
      icon: <ShoppingCart className="w-6 h-6 text-pink-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'streak-bonuses',
      title: 'Streak Bonuses',
      description: 'Earn increasing rewards for maintaining daily login streaks.',
      icon: <TrendingUp className="w-6 h-6 text-red-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'achievement-tracking',
      title: 'Achievement Tracking',
      description: 'Track your progress and unlock achievements as you learn and teach.',
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'community-challenges',
      title: 'Community Challenges',
      description: 'Participate in community-wide challenges and earn special rewards.',
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'One-click actions to claim daily rewards and complete tasks efficiently.',
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'global-rankings',
      title: 'Global Rankings',
      description: 'Compare your progress with learners and teachers worldwide.',
      icon: <Globe className="w-6 h-6 text-green-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'mentor-bonuses',
      title: 'Mentor Bonuses',
      description: 'Help someone without asking for anything in return and earn extra mentor coins as a thank-you for your contribution.',
      icon: <Crown className="w-6 h-6 text-yellow-600" />,
      status: 'In Development',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'challenges-streaks',
      title: 'Challenges & Streaks',
      description: 'Daily and weekly challenges to keep you motivated and reward you for consistency.',
      icon: <Target className="w-6 h-6 text-purple-600" />,
      status: 'Planned',
      statusColor: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      id: 'special-events',
      title: 'Special Events & Giveaways',
      description: 'Seasonal events and giveaways for top mentors and active learners.',
      icon: <Gift className="w-6 h-6 text-pink-600" />,
      status: 'Coming Soon',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coins className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Gamification System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building an exciting gamification system with coins, badges, and rewards to enhance your learning experience!
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="font-semibold text-lg">
                Coming Soon - Stay Tuned!
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature) => (
              <Card key={feature.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                    <Badge className={`text-xs ${feature.statusColor}`}>
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-4xl mx-auto border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Be the First to Know!
                </Badge>
                <h2 className="text-2xl font-bold mb-4">Stay Tuned!</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  We're working hard to bring these exciting features to life. The gamification system will revolutionize how you learn, teach, and engage with the community!
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification; 