import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExchangeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: {
    id: string;
    otherUser: { name: string; avatar: string | null };
    skill: string;
    type: string;
    description: string;
  };
  onReviewSubmitted: () => void;
}

export const ExchangeReviewModal = ({
  isOpen,
  onClose,
  exchange,
  onReviewSubmitted
}: ExchangeReviewModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle star rating selection
  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user || !rating || !review.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a rating and review text.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save review to database
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewee_id: exchange.id, // This should be the other user's ID
          rating: rating,
          comment: review.trim(),
          skill: exchange.skill,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error submitting review:', error);
        throw error;
      }

      // Show success message
      toast({
        title: "✅ Review submitted!",
        description: "Thank you for your feedback. This helps improve our community.",
      });

      // Reset form and close modal
      setRating(0);
      setReview('');
      onReviewSubmitted();
      onClose();

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setReview('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Leave a Review
          </DialogTitle>
          <DialogDescription className="text-center">
            Rate your experience with {exchange.otherUser.name} to help improve our community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Exchange Info */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={exchange.otherUser.avatar} />
              <AvatarFallback>
                {exchange.otherUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{exchange.otherUser.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Exchange:</span>
                <Badge variant="secondary" className="text-xs">
                  {exchange.skill}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {exchange.type === 'mentorship' ? 'Mentorship' : 'Exchange'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How would you rate this experience? *
            </Label>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((starIndex) => (
                <button
                  key={starIndex}
                  type="button"
                  onClick={() => handleStarClick(starIndex)}
                  className="p-1 transition-colors hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      starIndex < rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 0 && "Click on a star to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-sm font-medium">
              Write your review *
            </Label>
            <Textarea
              id="review"
              placeholder="✨ Share your experience with this exchange. What went well? What could be improved?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Your review will be visible to other users</span>
              <span>{review.length}/500</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting || !rating || !review.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 