import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lock,
  Sparkles,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Gamification = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Premium Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock advanced features and exclusive benefits with our premium subscription.
            </p>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Crown className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Personalized Messages</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Send personalized messages with your invitations to increase acceptance rates.
                    </p>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      Premium Only
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Get detailed insights into your learning progress and teaching effectiveness.
                    </p>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Crown className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Get priority customer support and faster response times.
                    </p>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      Premium Only
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Sparkles className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Unlimited Invitations</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Send unlimited invitations without monthly restrictions.
                    </p>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Premium Only
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
                <p className="text-muted-foreground mb-6">
                  Unlock all premium features and take your learning experience to the next level.
                </p>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View Pricing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification; 