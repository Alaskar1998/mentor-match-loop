import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Workshop } from "@/types/future-phase";
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Crown,
  Play,
  Gift
} from 'lucide-react';

interface WorkshopCardProps {
  workshop: Workshop;
  userTier: 'free' | 'premium';
}

export const WorkshopCard = ({ workshop, userTier }: WorkshopCardProps) => {
  const canAccess = userTier === 'premium' || workshop.access.tierRequired === 'free';
  const isUpcoming = workshop.status === 'upcoming';
  const spotsRemaining = workshop.access.maxParticipants - workshop.access.currentParticipants;

  return (
    <Card className={`${!canAccess ? 'opacity-60' : ''} transition-all hover:shadow-md`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{workshop.title}</CardTitle>
              <Badge variant="outline" className="text-xs bg-blue-100">Future Feature</Badge>
            </div>
            
            {/* Access Level Badge */}
            <div className="flex items-center gap-2 mb-2">
              {workshop.access.tierRequired === 'premium' && (
                <Badge className="gap-1">
                  <Crown className="w-3 h-3" />
                  Premium Only
                </Badge>
              )}
              <Badge variant="outline">
                {workshop.content.difficultyLevel.charAt(0).toUpperCase() + workshop.content.difficultyLevel.slice(1)}
              </Badge>
            </div>
          </div>
          
          {/* Instructor Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarImage src={workshop.instructor.profilePicture} />
            <AvatarFallback>{workshop.instructor.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {workshop.description}
        </p>

        {/* Schedule Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{workshop.schedule.startTime.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span>{workshop.schedule.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span>{workshop.access.currentParticipants}/{workshop.access.maxParticipants} enrolled</span>
          </div>
          {spotsRemaining > 0 && spotsRemaining <= 5 && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Only {spotsRemaining} spots left!
            </Badge>
          )}
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{workshop.instructor.name}</span>
              <Badge variant="secondary" className="text-xs">
                {workshop.instructor.mentorTier}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              <span className="text-xs text-muted-foreground">Expert Instructor</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {workshop.pricing.type === 'free' && 'Free'}
            {workshop.pricing.type === 'premium_included' && 'Included'}
            {workshop.pricing.type === 'coin_cost' && `${workshop.pricing.cost} coins`}
            {workshop.pricing.type === 'paid' && `$${workshop.pricing.cost}`}
          </div>
          
          {/* Action Button */}
          {canAccess ? (
            <Button size="sm" disabled={!isUpcoming || spotsRemaining === 0}>
              {spotsRemaining === 0 ? 'Full' : isUpcoming ? 'Register' : 'View Recording'}
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade for Access
            </Button>
          )}
        </div>

        {/* Prerequisites */}
        {workshop.content.prerequisites.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Prerequisites: </span>
            {workshop.content.prerequisites.join(', ')}
          </div>
        )}

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1">
          {workshop.content.recordingAvailable && (
            <Badge variant="outline" className="text-xs gap-1">
              <Play className="w-3 h-3" />
              Recording Available
            </Badge>
          )}
          {workshop.schedule.recurringPattern !== 'none' && (
            <Badge variant="outline" className="text-xs">
              {workshop.schedule.recurringPattern}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Workshop Management Dashboard (Future)
export const WorkshopDashboard = () => {
  // Remove or comment out all mockWorkshops and any mock data usage. Only show real data or an empty state.
  // Mock workshop data
  const mockWorkshops: Workshop[] = [
    {
      id: '1',
      title: 'Advanced JavaScript Patterns',
      description: 'Learn modern JavaScript patterns and best practices for building scalable applications.',
      instructor: {
        id: 'instructor1',
        name: 'Sarah Ahmad',
        profilePicture: '👩‍💻',
        mentorTier: '🏅 Gold Mentor'
      },
      schedule: {
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        timeZone: 'UTC',
        recurringPattern: 'none'
      },
      access: {
        tierRequired: 'premium',
        maxParticipants: 25,
        currentParticipants: 18,
        waitingList: 5
      },
      content: {
        skillCategory: 'Programming',
        difficultyLevel: 'advanced',
        prerequisites: ['JavaScript Fundamentals', 'ES6+ Knowledge'],
        materials: ['Code Editor', 'Node.js'],
        recordingAvailable: true
      },
      pricing: {
        type: 'premium_included',
        cost: 0,
        currency: 'USD'
      },
      status: 'upcoming',
      tags: ['javascript', 'programming', 'patterns']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Premium Workshops</h2>
          <p className="text-muted-foreground">Exclusive learning opportunities for premium members</p>
        </div>
        <Badge className="gap-1">
          <Gift className="w-3 h-3" />
          Future Feature
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockWorkshops.map((workshop) => (
          <WorkshopCard 
            key={workshop.id} 
            workshop={workshop} 
            userTier="free" // This would come from user context
          />
        ))}
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">More Workshops Coming Soon!</h3>
          <p className="text-muted-foreground">
            We're building an amazing workshop system with live events, recordings, and expert instructors.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};