import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Target, 
  Clock, 
  MapPin, 
  Star, 
  Sparkles,
  Users,
  TrendingUp,
  Heart,
  Award,
  Zap,
  Globe,
  Filter,
  MessageSquare,
  BookOpen
} from "lucide-react";
import { useTranslation } from "react-i18next";

const CreateRequest = () => {
  const { t } = useTranslation();

  const futureFeatures = [
    {
      icon: <Plus className="w-8 h-8 text-blue-500" />,
      title: t('createRequest.features.createLearningRequest.title'),
      description: t('createRequest.features.createLearningRequest.description'),
      status: t('status.comingSoon'),
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: t('createRequest.features.smartRequestTemplates.title'),
      description: t('createRequest.features.smartRequestTemplates.description'),
      status: t('status.inDevelopment'),
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: t('createRequest.features.urgencySettings.title'),
      description: t('createRequest.features.urgencySettings.description'),
      status: t('status.comingSoon'),
      color: "bg-orange-50 border-orange-200"
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-500" />,
      title: t('createRequest.features.locationBasedMatching.title'),
      description: t('createRequest.features.locationBasedMatching.description'),
      status: t('status.inDevelopment'),
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: t('createRequest.features.teacherPreferences.title'),
      description: t('createRequest.features.teacherPreferences.description'),
      status: t('status.comingSoon'),
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-cyan-500" />,
      title: t('createRequest.features.aiPoweredMatching.title'),
      description: t('createRequest.features.aiPoweredMatching.description'),
      status: t('status.planned'),
      color: "bg-cyan-50 border-cyan-200"
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      title: t('createRequest.features.multipleTeacherResponses.title'),
      description: t('createRequest.features.multipleTeacherResponses.description'),
      status: t('status.comingSoon'),
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
      title: t('createRequest.features.requestAnalytics.title'),
      description: t('createRequest.features.requestAnalytics.description'),
      status: t('status.inDevelopment'),
      color: "bg-emerald-50 border-emerald-200"
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: t('createRequest.features.favoriteTeachers.title'),
      description: t('createRequest.features.favoriteTeachers.description'),
      status: t('status.planned'),
      color: "bg-pink-50 border-pink-200"
    },
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      title: t('createRequest.features.requestRewards.title'),
      description: t('createRequest.features.requestRewards.description'),
      status: t('status.comingSoon'),
      color: "bg-amber-50 border-amber-200"
    },
    {
      icon: <Zap className="w-8 h-8 text-lime-500" />,
      title: t('createRequest.features.quickRequestBuilder.title'),
      description: t('createRequest.features.quickRequestBuilder.description'),
      status: t('status.planned'),
      color: "bg-lime-50 border-lime-200"
    },
    {
      icon: <Globe className="w-8 h-8 text-teal-500" />,
      title: t('createRequest.features.globalLearningNetwork.title'),
      description: t('createRequest.features.globalLearningNetwork.description'),
      status: t('status.inDevelopment'),
      color: "bg-teal-50 border-teal-200"
    },
    {
      icon: <Filter className="w-8 h-8 text-violet-500" />,
      title: t('createRequest.features.advancedFiltering.title'),
      description: t('createRequest.features.advancedFiltering.description'),
      status: t('status.comingSoon'),
      color: "bg-violet-50 border-violet-200"
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-red-500" />,
      title: t('createRequest.features.directCommunication.title'),
      description: t('createRequest.features.directCommunication.description'),
      status: t('status.planned'),
      color: "bg-red-50 border-red-200"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-rose-500" />,
      title: t('createRequest.features.learningPaths.title'),
      description: t('createRequest.features.learningPaths.description'),
      status: t('status.comingSoon'),
      color: "bg-rose-50 border-rose-200"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('status.comingSoon'):
        return "bg-green-100 text-green-800 border-green-200";
      case t('status.inDevelopment'):
        return "bg-blue-100 text-blue-800 border-blue-200";
      case t('status.planned'):
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
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t('createRequest.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('createRequest.subtitle')}
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-warm text-warm-foreground px-6 py-3 rounded-full shadow-elegant">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="font-semibold text-lg">
              {t('createRequest.comingSoon')}
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
                {t('createRequest.beFirstToKnow')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('createRequest.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createRequest.backToHome')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;