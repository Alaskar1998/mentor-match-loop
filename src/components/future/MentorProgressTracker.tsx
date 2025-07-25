import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MENTOR_TIERS, MentorTier } from "@/types/future-phase";
import { Crown, Star, Award, Users, Calendar } from 'lucide-react';

interface MentorProgressProps {
  currentExchanges: number;
  currentRating: number;
  mentorshipSessions: number;
  currentTier?: string;
}

export const MentorProgressTracker = ({ 
  currentExchanges, 
  currentRating, 
  mentorshipSessions,
  currentTier = 'basic_mentor'
}: MentorProgressProps) => {
  const currentTierIndex = MENTOR_TIERS.findIndex(tier => tier.id === currentTier);
  const nextTier = MENTOR_TIERS[currentTierIndex + 1];
  
  const calculateProgress = (current: number, required: number): number => {
    return Math.min((current / required) * 100, 100);
  };

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">Mentor Progression</CardTitle>
          <Badge variant="outline" className="text-xs bg-yellow-100">Future Feature</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tier */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <div className="text-2xl">{MENTOR_TIERS[currentTierIndex].icon}</div>
          <div>
            <div className="font-semibold">{MENTOR_TIERS[currentTierIndex].name}</div>
            <div className="text-sm text-muted-foreground">Current Tier</div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Progress to {nextTier.name}</span>
              <span className="text-2xl">{nextTier.icon}</span>
            </div>

            {/* Exchanges Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exchanges</span>
                <span>{currentExchanges}/{nextTier.requirements.minExchanges}</span>
              </div>
              <Progress 
                value={calculateProgress(currentExchanges, nextTier.requirements.minExchanges)} 
                className="h-2"
              />
            </div>

            {/* Rating Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rating</span>
                <span>{currentRating.toFixed(1)}/{nextTier.requirements.minRating}</span>
              </div>
              <Progress 
                value={calculateProgress(currentRating, nextTier.requirements.minRating)} 
                className="h-2"
              />
            </div>

            {/* Mentorship Sessions */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mentorship Sessions</span>
                <span>{mentorshipSessions}/{nextTier.requirements.minMentorshipSessions}</span>
              </div>
              <Progress 
                value={calculateProgress(mentorshipSessions, nextTier.requirements.minMentorshipSessions)} 
                className="h-2"
              />
            </div>

            {/* Special Criteria */}
            {nextTier.requirements.specialCriteria && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium mb-1">Additional Requirements:</div>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {nextTier.requirements.specialCriteria.map((criteria, index) => (
                    <li key={index}>{criteria.replace('_', ' ').toUpperCase()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Benefits Preview */}
        {nextTier && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg">
            <div className="text-sm font-medium mb-2">Unlock with {nextTier.name}:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {nextTier.benefits.priorityMatching && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Priority Matching
                </div>
              )}
              {nextTier.benefits.exclusiveEvents && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Exclusive Events
                </div>
              )}
              {nextTier.benefits.enhancedProfile && (
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Enhanced Profile
                </div>
              )}
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Custom Themes
              </div>
            </div>
          </div>
        )}

        {/* All Tiers Overview */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">All Mentor Tiers:</div>
          <div className="flex gap-2 overflow-x-auto">
            {MENTOR_TIERS.map((tier, index) => (
              <div 
                key={tier.id}
                className={`flex-shrink-0 p-2 rounded border text-center min-w-[80px] ${
                  index <= currentTierIndex 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="text-lg mb-1">{tier.icon}</div>
                <div className="text-xs font-medium">{tier.name.replace(/[🌟🥈🏅🏆]/g, '').trim()}</div>
                <div className="text-xs text-muted-foreground">{tier.requirements.minExchanges}+ exchanges</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};