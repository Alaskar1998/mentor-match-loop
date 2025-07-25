import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Review {
  id: string;
  reviewerName?: string;
  recipientName?: string;
  skill: string;
  rating: number;
  comment: string;
  timestamp: string;
  exchangeDate: string;
}

export default function Reviews() {
  const { user } = useAuth();
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [givenReviews, setGivenReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch reviews received by the user
      const { data: receivedData, error: receivedError } = await supabase
        .from('reviews')
        .select(`
          id,
          skill,
          rating,
          comment,
          created_at,
          profiles!reviewer_id (
            display_name
          )
        `)
        .eq('reviewee_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch reviews given by the user
      const { data: givenData, error: givenError } = await supabase
        .from('reviews')
        .select(`
          id,
          skill,
          rating,
          comment,
          created_at,
          profiles!reviewee_id (
            display_name
          )
        `)
        .eq('reviewer_id', user?.id)
        .order('created_at', { ascending: false });

      if (receivedError || givenError) {
        console.error('Error fetching reviews:', receivedError || givenError);
        toast.error("Failed to load reviews");
        return;
      }

      const formatReviews = (data: any[], type: 'received' | 'given'): Review[] => {
        return data?.map(review => ({
          id: review.id,
          [type === 'received' ? 'reviewerName' : 'recipientName']: 
            review.profiles?.display_name || 'Unknown User',
          skill: review.skill,
          rating: review.rating,
          comment: review.comment || '',
          timestamp: formatTimeAgo(new Date(review.created_at)),
          exchangeDate: formatDate(new Date(review.created_at))
        })) || [];
      };

      setReceivedReviews(formatReviews(receivedData, 'received'));
      setGivenReviews(formatReviews(givenData, 'given'));
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
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

  const averageRating = receivedReviews.length > 0 
    ? receivedReviews.reduce((acc, review) => acc + review.rating, 0) / receivedReviews.length 
    : 0;

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
              <div className="text-4xl font-bold text-primary">
                {receivedReviews.length > 0 ? averageRating.toFixed(1) : '-'}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Based on {receivedReviews.length} reviews
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = receivedReviews.filter(r => r.rating === stars).length;
                const percentage = receivedReviews.length > 0 ? (count / receivedReviews.length) * 100 : 0;
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
            Reviews I Received ({receivedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Reviews I Gave ({givenReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading reviews...</div>
              </CardContent>
            </Card>
          ) : receivedReviews.map((review) => (
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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading reviews...</div>
              </CardContent>
            </Card>
          ) : givenReviews.map((review) => (
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