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
import { useTranslation } from "react-i18next";

const Gamification = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      id: 'coin-system',
      title: t('gamification.features.coinSystem.title'),
      description: t('gamification.features.coinSystem.description'),
      icon: <Coins className="w-6 h-6 text-yellow-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'daily-rewards',
      title: t('gamification.features.dailyRewards.title'),
      description: t('gamification.features.dailyRewards.description'),
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'badge-system',
      title: t('gamification.features.badgeSystem.title'),
      description: t('gamification.features.badgeSystem.description'),
      icon: <Award className="w-6 h-6 text-purple-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'exchange-rewards',
      title: t('gamification.features.exchangeRewards.title'),
      description: t('gamification.features.exchangeRewards.description'),
      icon: <Target className="w-6 h-6 text-green-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'leaderboard',
      title: t('gamification.features.leaderboard.title'),
      description: t('gamification.features.leaderboard.description'),
      icon: <Trophy className="w-6 h-6 text-orange-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'coin-shop',
      title: t('gamification.features.coinShop.title'),
      description: t('gamification.features.coinShop.description'),
      icon: <ShoppingCart className="w-6 h-6 text-pink-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'streak-bonuses',
      title: t('gamification.features.streakBonuses.title'),
      description: t('gamification.features.streakBonuses.description'),
      icon: <TrendingUp className="w-6 h-6 text-red-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'achievement-tracking',
      title: t('gamification.features.achievementTracking.title'),
      description: t('gamification.features.achievementTracking.description'),
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'community-challenges',
      title: t('gamification.features.communityChallenges.title'),
      description: t('gamification.features.communityChallenges.description'),
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'quick-actions',
      title: t('gamification.features.quickActions.title'),
      description: t('gamification.features.quickActions.description'),
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'global-rankings',
      title: t('gamification.features.globalRankings.title'),
      description: t('gamification.features.globalRankings.description'),
      icon: <Globe className="w-6 h-6 text-green-600" />,
      status: t('status.comingSoon'),
      statusColor: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'mentor-bonuses',
      title: t('gamification.features.mentorBonuses.title'),
      description: t('gamification.features.mentorBonuses.description'),
      icon: <Crown className="w-6 h-6 text-yellow-600" />,
      status: t('status.inDevelopment'),
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'challenges-streaks',
      title: t('gamification.features.challengesStreaks.title'),
      description: t('gamification.features.challengesStreaks.description'),
      icon: <Target className="w-6 h-6 text-purple-600" />,
      status: t('status.planned'),
      statusColor: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      id: 'special-events',
      title: t('gamification.features.specialEvents.title'),
      description: t('gamification.features.specialEvents.description'),
      icon: <Gift className="w-6 h-6 text-pink-600" />,
      status: t('status.comingSoon'),
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
              {t('gamification.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('gamification.subtitle')}
            </p>
            <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span className="font-semibold text-lg">
                {t('gamification.comingSoon')}
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
                  {t('actions.beFirstToKnow')}
                </Badge>
                <h2 className="text-2xl font-bold mb-4">{t('gamification.stayTuned')}</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {t('gamification.description')}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t('gamification.backToHome')}
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