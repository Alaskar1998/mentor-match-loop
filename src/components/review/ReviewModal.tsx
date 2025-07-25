import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Exchange {
  id: string;
  status: 'pending' | 'active' | 'completed';
  initiatorSkill: string;
  recipientSkill?: string;
  isMentorship: boolean;
  initiatorAgreed: boolean;
  recipientAgreed: boolean;
  initiatorFinished: boolean;
  recipientFinished: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchange: Exchange | null;
  otherUser: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  onReviewSubmitted: () => void;
}

export const ReviewModal = ({
  isOpen,
  onClose,
  exchange,
  otherUser,
  onReviewSubmitted
}: ReviewModalProps) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [skillRating, setSkillRating] = useState(0);
  const [personalRating, setPersonalRating] = useState(0);
  const [textReview, setTextReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!exchange || !user) return null;

  const handleSubmitReview = async () => {
    if (skillRating === 0 || personalRating === 0) {
      toast({
        title: "Missing ratings",
        description: "Please provide both skill and communication ratings.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to submit review
      console.log('Submitting review:', {
        exchangeId: exchange.id,
        reviewedUserId: otherUser.id,
        skillRating,
        personalRating,
        textReview,
        reviewerUserId: user.id
      });

      // Update current user's successful exchanges count
      updateUser({
        successfulExchanges: (user as any).successfulExchanges ? (user as any).successfulExchanges + 1 : 1
      });

      // Show success message
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. This helps improve our community.",
      });

      // Reset form
      setSkillRating(0);
      setPersonalRating(0);
      setTextReview('');
      
      onReviewSubmitted();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = (skillRating + personalRating) / 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Leave a Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User info */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherUser.profilePicture} />
              <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{otherUser.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Exchange:</span>
                <Badge variant="secondary" className="text-xs">
                  {exchange.initiatorSkill}
                </Badge>
                {!exchange.isMentorship && exchange.recipientSkill && (
                  <>
                    <span>↔</span>
                    <Badge variant="secondary" className="text-xs">
                      {exchange.recipientSkill}
                    </Badge>
                  </>
                )}
                {exchange.isMentorship && (
                  <Badge variant="outline" className="text-xs">
                    Mentorship
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Skill Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Was this person helpful?
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={skillRating}
                  onRatingChange={setSkillRating}
                  size="md"
                />
                {skillRating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {skillRating}/5
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Did they communicate well?
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={personalRating}
                  onRatingChange={setPersonalRating}
                  size="md"
                />
                {personalRating > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {personalRating}/5
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overall Preview */}
          {skillRating > 0 && personalRating > 0 && (
            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Rating:</span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={Math.round(averageRating)}
                    onRatingChange={() => {}}
                    size="sm"
                    readonly
                  />
                  <span className="font-medium">
                    {averageRating.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Optional Text Review */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Additional feedback (optional)
            </label>
            <Textarea
              value={textReview}
              onChange={(e) => setTextReview(e.target.value)}
              placeholder="Share your experience working with this person..."
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {textReview.length}/500 characters
            </div>
          </div>

          {/* Impact note */}
          <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Your review helps build {otherUser.name}"s reputation and contributes to our community leaderboards.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Skip Review
          </Button>
          <Button
            onClick={handleSubmitReview}
            className="flex-1"
            disabled={skillRating === 0 || personalRating === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          Reviews are visible to other users and help maintain quality in our community.
        </p>
      </DialogContent>
    </Dialog>
  );
};