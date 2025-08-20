import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/notificationService';
import { logger } from '@/utils/logger';

interface ExchangeReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: {
    id: string;
    otherUser: { 
      id: string;
      name: string; 
      avatar: string | null 
    };
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
  const [skillRating, setSkillRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle star rating selection for skill
  const handleSkillStarClick = (starIndex: number) => {
    setSkillRating(starIndex + 1);
  };

  // Handle star rating selection for communication
  const handleCommunicationStarClick = (starIndex: number) => {
    setCommunicationRating(starIndex + 1);
  };

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user || !skillRating || !communicationRating) {
      toast({
        title: "Missing information",
        description: "Please provide both skill and communication ratings.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // console.log('🔍 Submitting review with data:', {
      //   chat_id: exchange.id,
      //   reviewer_id: user.id,
      //   reviewed_user_id: exchange.otherUser.id,
      //   skill_rating: skillRating,
      //   communication_rating: communicationRating,
      //   review_text: review.trim()
      // });

      // Save review to database
      const { error } = await supabase
        .from('reviews')
        .insert({
          chat_id: exchange.id,
          reviewer_id: user.id,
          reviewed_user_id: exchange.otherUser.id,
          skill_rating: skillRating,
          communication_rating: communicationRating,
          review_text: review.trim(),
          created_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Error submitting review:', error);
        throw error;
      }

      // Send notification to the other user
      try {
        const reviewerName = user?.name || user?.email || 'Someone';
        await notificationService.createNotification({
          userId: exchange.otherUser.id,
          title: 'Review Received',
          message: `${reviewerName} has reviewed your exchange. You can now leave your review too.`,
          isRead: false,
          type: 'learning_match',
          actionUrl: `/my-exchanges?tab=completed`,
          metadata: {
            senderId: user.id,
            senderName: reviewerName,
            exchangeId: exchange.id,
            rating: Math.round((skillRating + communicationRating) / 2)
          }
        });
      } catch (notificationError) {
        logger.error('Failed to create review notification:', notificationError);
      }

      // Show success message
      toast({
        title: "✅ Review submitted!",
        description: "Thank you for your feedback. This helps improve our community.",
      });

      // Reset form and close modal
      setSkillRating(0);
      setCommunicationRating(0);
      setReview('');
      onReviewSubmitted();
      onClose();

    } catch (error) {
      logger.error('Error submitting review:', error);
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
      setSkillRating(0);
      setCommunicationRating(0);
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
              </div>
            </div>
          </div>

          {/* Skill Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How would you rate their teaching skills? *
            </Label>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((starIndex) => (
                <button
                  key={starIndex}
                  type="button"
                  onClick={() => handleSkillStarClick(starIndex)}
                  className="p-1 transition-colors hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      starIndex < skillRating
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {skillRating === 0 && "Click to rate"}
              {skillRating === 1 && "Poor"}
              {skillRating === 2 && "Fair"}
              {skillRating === 3 && "Good"}
              {skillRating === 4 && "Very Good"}
              {skillRating === 5 && "Excellent"}
            </p>
          </div>

          {/* Communication Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              How would you rate their communication? *
            </Label>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((starIndex) => (
                <button
                  key={starIndex}
                  type="button"
                  onClick={() => handleCommunicationStarClick(starIndex)}
                  className="p-1 transition-colors hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      starIndex < communicationRating
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {communicationRating === 0 && "Click to rate"}
              {communicationRating === 1 && "Poor"}
              {communicationRating === 2 && "Fair"}
              {communicationRating === 3 && "Good"}
              {communicationRating === 4 && "Very Good"}
              {communicationRating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-sm font-medium">
              Additional comments (optional)
            </Label>
            <Textarea
              id="review"
              placeholder="Share your experience, what went well, what could be improved..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmitReview}
            disabled={isSubmitting || !skillRating || !communicationRating}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 