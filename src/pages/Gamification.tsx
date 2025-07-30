import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Users, 
  TrendingUp, 
  Gift, 
  Sparkles,
  Calendar,
  Award,
  Crown,
  Heart
} from "lucide-react";

const Gamification = () => {
  const futureFeatures = [
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Achievement System",
      description: "Earn badges and rewards for completing exchanges, helping others, and building your profile.",
      status: "Coming Soon",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      icon: <Star className="w-8 h-8 text-blue-500" />,
      title: "Skill Points & Levels",
      description: "Gain experience points for each skill you teach and level up your expertise.",
      status: "In Development",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: "Daily Challenges",
      description: "Complete daily missions to earn bonus rewards and unlock special features.",
      status: "Planned",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Learning Streaks",
      description: "Maintain daily learning streaks and unlock exclusive rewards for consistency.",
      status: "Coming Soon",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      title: "Community Leaderboards",
      description: "Compete with other learners and teachers on global and skill-specific leaderboards.",
      status: "In Development",
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed progress charts and milestones.",
      status: "Planned",
      color: "bg-orange-50 border-orange-200"
    },
    {
      icon: <Gift className="w-8 h-8 text-pink-500" />,
      title: "Reward Marketplace",
      description: "Spend earned points on premium features, exclusive content, and special privileges.",
      status: "Coming Soon",
      color: "bg-pink-50 border-pink-200"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-cyan-500" />,
      title: "Special Events",
      description: "Participate in seasonal events, competitions, and community challenges.",
      status: "Planned",
      color: "bg-cyan-50 border-cyan-200"
    },
    {
      icon: <Calendar className="w-8 h-8 text-red-500" />,
      title: "Mentorship Programs",
      description: "Join structured mentorship programs with guided learning paths and milestones.",
      status: "In Development",
      color: "bg-red-50 border-red-200"
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-500" />,
      title: "Certification System",
      description: "Earn verifiable certificates for completed courses and skill mastery.",
      status: "Coming Soon",
      color: "bg-emerald-50 border-emerald-200"
    },
    {
      icon: <Crown className="w-8 h-8 text-amber-500" />,
      title: "Elite Status",
      description: "Achieve elite status with exclusive perks, priority support, and special recognition.",
      status: "Planned",
      color: "bg-amber-50 border-amber-200"
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: "Community Recognition",
      description: "Get recognized by the community for your contributions and helpfulness.",
      status: "Coming Soon",
      color: "bg-rose-50 border-rose-200"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Coming Soon":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planned":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-accent to-warm rounded-full mb-6 shadow-elegant">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            🎮 Gamification
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We're building an amazing gamification system to make learning even more engaging and rewarding!
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="font-semibold text-lg">
              Coming Soon - Stay Tuned!
            </span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {futureFeatures.map((feature, index) => (
            <Card 
              key={index}
              className={`${feature.color} border-2 hover:shadow-elegant transition-all duration-300 hover:scale-105`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(feature.status)}`}
                  >
                    {feature.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                🚀 Be the First to Know!
              </h3>
              <p className="text-muted-foreground mb-6">
                We're working hard to bring these exciting features to life. 
                The gamification system will make learning more fun, engaging, and rewarding than ever before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => window.history.back()}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore Other Features
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/'}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gamification; 