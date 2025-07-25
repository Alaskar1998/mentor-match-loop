import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';

const mockReviews = {
  received: [
    {
      id: 'rev-1',
      reviewerName: 'Sarah Johnson',
      skill: 'React Development',
      rating: 5,
      comment: 'Excellent teacher! Really helped me understand React hooks and state management.',
      timestamp: '2 days ago',
      exchangeDate: 'Jan 15, 2024'
    },
    {
      id: 'rev-2',
      reviewerName: 'Mike Chen',
      skill: 'JavaScript',
      rating: 4,
      comment: 'Great session on advanced JavaScript concepts. Very patient and knowledgeable.',
      timestamp: '1 week ago',
      exchangeDate: 'Jan 8, 2024'
    },
    {
      id: 'rev-3',
      reviewerName: 'Emily Davis',
      skill: 'CSS',
      rating: 5,
      comment: 'Amazing help with CSS Grid and Flexbox. Clear explanations and practical examples.',
      timestamp: '2 weeks ago',
      exchangeDate: 'Dec 28, 2023'
    }
  ],
  given: [
    {
      id: 'rev-4',
      recipientName: 'John Smith',
      skill: 'Python',
      rating: 5,
      comment: 'John is an excellent Python teacher! Learned so much about data structures.',
      timestamp: '3 days ago',
      exchangeDate: 'Jan 12, 2024'
    },
    {
      id: 'rev-5',
      recipientName: 'Alice Wilson',
      skill: 'UI/UX Design',
      rating: 4,
      comment: 'Great design insights and feedback. Really improved my design thinking.',
      timestamp: '1 week ago',
      exchangeDate: 'Jan 6, 2024'
    }
  ]
};

export default function Reviews() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  const averageRating = mockReviews.received.reduce((acc, review) => acc + review.rating, 0) / mockReviews.received.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">See what others say about your teaching and your feedback to others</p>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Teaching Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Based on {mockReviews.received.length} reviews
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = mockReviews.received.filter(r => r.rating === stars).length;
                const percentage = mockReviews.received.length > 0 ? (count / mockReviews.received.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{stars}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList>
          <TabsTrigger value="received">
            Reviews I Received ({mockReviews.received.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Reviews I Gave ({mockReviews.given.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {mockReviews.received.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                    {review.reviewerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{review.reviewerName}</h3>
                        <Badge variant="outline">{review.skill}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm font-medium">{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Exchange: {review.exchangeDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Reviewed: {review.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="given" className="space-y-4">
          {mockReviews.given.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                    {review.recipientName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{review.recipientName}</h3>
                        <Badge variant="outline">{review.skill}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 text-sm font-medium">{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Exchange: {review.exchangeDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Reviewed: {review.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}