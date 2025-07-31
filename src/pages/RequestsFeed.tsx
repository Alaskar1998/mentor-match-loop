import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Search, 
  Users, 
  Clock, 
  MapPin, 
  Star, 
  Sparkles,
  Target,
  TrendingUp,
  Heart,
  Award,
  Zap,
  Globe,
  Filter
} from "lucide-react";

const RequestsFeed = () => {
  const futureFeatures = [
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
      title: "Learning Requests Feed",
      description: "Browse and respond to learning requests from students worldwide. Find opportunities to teach and help others grow.",
      status: "Coming Soon",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <div className="w-8 h-8 text-green-500 text-2xl">🔔</div>,
      title: "Skill Notifications",
      description: "When you create a request, users who teach that skill will instantly be notified, so you get help faster.",
      status: "In Development",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Community Responses",
      description: "Multiple teachers can respond to requests, giving learners options and creating healthy competition.",
      status: "Coming Soon",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Teacher Ratings",
      description: "Rate and review teachers based on their responses and teaching quality to build trust.",
      status: "Coming Soon",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-cyan-500" />,
      title: "Request Templates",
      description: "Pre-built templates for common learning requests to make posting faster and more effective.",
      status: "Planned",
      color: "bg-cyan-50 border-cyan-200"
    },
    {
      icon: <Target className="w-8 h-8 text-red-500" />,
      title: "Skill-Specific Feeds",
      description: "Filter requests by specific skills, levels, and categories to find your perfect teaching opportunities.",
      status: "Coming Soon",
      color: "bg-red-50 border-red-200"
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
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            📚 Learning Requests
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            We're building a powerful learning requests system to connect students with teachers worldwide!
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
                The learning requests system will revolutionize how students and teachers connect!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/'}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
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

export default RequestsFeed;