import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Trophy, Medal, Crown, Users, Target } from 'lucide-react';
import { useGamification } from "@/hooks/useGamification";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderUser {
  id: string;
  name: string;
  profilePicture: string;
  rating: number;
  exchangeCount: number;
  mentorBadge: boolean;
  totalCoins: number;
  position: number;
}

export const LeaderboardModal = ({ isOpen, onClose }: LeaderboardModalProps) => {
  const { state } = useGamification();

  // Mock leaderboard data - in real app, this would come from API
  // const topRatedUsers: LeaderUser[] = [
  //   {
  //     id: '1',
  //     name: 'Sarah Johnson',
  //     profilePicture: '👩‍🏫',
  //     rating: 4.9,
  //     exchangeCount: 45,
  //     mentorBadge: true,
  //     totalCoins: 2500,
  //     position: 1
  //   },
  //   {
  //     id: '2',
  //     name: 'Mike Chen',
  //     profilePicture: '👨‍💻',
  //     rating: 4.8,
  //     exchangeCount: 38,
  //     mentorBadge: false,
  //     totalCoins: 1900,
  //     position: 2
  //   },
  //   {
  //     id: '3',
  //     name: 'Emily Rodriguez',
  //     profilePicture: '👩‍🎨',
  //     rating: 4.7,
  //     exchangeCount: 52,
  //     mentorBadge: true,
  //     totalCoins: 3200,
  //     position: 3
  //   },
  //   {
  //     id: '4',
  //     name: 'Mohammad',
  //     profilePicture: '👨‍🔬',
  //     rating: 4.6,
  //     exchangeCount: 29,
  //     mentorBadge: false,
  //     totalCoins: 1500,
  //     position: 4
  //   },
  //   {
  //     id: '5',
  //     name: 'Anna Smith',
  //     profilePicture: '👩‍��',
  //     rating: 4.5,
  //     exchangeCount: 41,
  //     mentorBadge: true,
  //     totalCoins: 2100,
  //     position: 5
  //   }
  // ];

  // const mostActiveUsers = [...topRatedUsers].sort((a, b) => b.exchangeCount - a.exchangeCount);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-card border-border';
    }
  };

  const renderUserCard = (user: LeaderUser, metric: 'rating' | 'exchanges') => (
    <Card key={user.id} className={`${getPositionBg(user.position)} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {getPositionIcon(user.position)}
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{user.name}</h3>
              {user.mentorBadge && (
                <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                  🌟 Mentor
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {user.rating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {user.exchangeCount} exchanges
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold">
              {metric === 'rating' ? user.rating.toFixed(1) : user.exchangeCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {metric === 'rating' ? 'Rating' : 'Exchanges'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Community Leaderboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="rating" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Most Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating" className="space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground mb-4">
                🌟 Top-rated teachers and mentors in our community
              </div>
              {/* {topRatedUsers.map((user) => renderUserCard(user, 'rating'))} */}
              <p className="text-center text-muted-foreground">No top rated users available.</p>
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground mb-4">
                🔥 Most active learners and teachers this month
              </div>
              {/* {mostActiveUsers.map((user, index) => 
                renderUserCard({...user, position: index + 1}, 'exchanges')
              )} */}
              <p className="text-center text-muted-foreground">No most active users available.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Personal Stats */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Your Progress</h3>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{state.totalExchanges}</div>
                  <div className="text-xs text-muted-foreground">Exchanges</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{state.appCoins}</div>
                  <div className="text-xs text-muted-foreground">Coins</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{state.badges.length}</div>
                  <div className="text-xs text-muted-foreground">Badges</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Giveaway Notice */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-4 border">
          <div className="text-center">
            <h4 className="font-semibold text-sm mb-1">🎁 Monthly Giveaway</h4>
            <p className="text-xs text-muted-foreground">
              Top mentors and active users win special prizes! Keep teaching and learning to qualify.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};