import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LearningRequest {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
    isVerified: boolean;
  };
  skill: string;
  level: string;
  description: string;
  country: string;
  urgency: "urgent" | "soon" | "flexible";
  postedAt: Date;
  responses: number;
}

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LearningRequest | null;
  onResponseSubmitted?: () => void;
}

export const ResponseModal = ({ isOpen, onClose, request, onResponseSubmitted }: ResponseModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id || !request) {
      toast.error("You must be logged in to respond to requests");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Submit response to database once learning_responses table is available
      console.log('Submitting response:', {
        learning_request_id: request.id,
        responder_id: user.id,
        message: message.trim()
      });

      // For now, just show success message
      toast.success("✅ Response submitted successfully!");
      
      // Reset form
      setMessage('');
      onClose();
      
      // Callback to refresh data
      if (onResponseSubmitted) {
        onResponseSubmitted();
      }
      
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!request) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "soon":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "flexible":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Respond to Learning Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={request.user.avatar} />
                <AvatarFallback>
                  {request.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{request.user.name}</h3>
                  {request.user.isVerified && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Verified
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                    <span className="text-sm">{request.user.rating}</span>
                  </div>
                </div>
                
                <h4 className="font-medium text-lg mb-2">
                  Looking to learn: <span className="text-primary">{request.skill}</span>
                </h4>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {request.postedAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {request.country}
                  </div>
                  <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </Badge>
                </div>
                
                <Badge variant="outline" className="text-xs mb-2">
                  Current level: {request.level}
                </Badge>
                
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>
            </div>
          </div>

          {/* Response Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="response-message" className="text-base font-medium">
                Your Response Message
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Introduce yourself, explain your experience with {request.skill}, and how you can help.
              </p>
              <Textarea
                id="response-message"
                placeholder={`Hi! I'm experienced with ${request.skill} and would love to help you learn. I can...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {message.length}/1000 characters
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-900 mb-2">💡 Tips for a great response:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mention your experience level with the skill</li>
                <li>• Explain your teaching approach and style</li>
                <li>• Suggest a starting point or first session</li>
                <li>• Be friendly and encouraging</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Send Response"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 