import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, X } from 'lucide-react';

interface InvitationResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  senderName: string;
  senderProfilePicture?: string;
  skill: string;
  message: string;
}

export const InvitationResponseModal = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  senderName,
  senderProfilePicture,
  skill,
  message
}: InvitationResponseModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Learning Invitation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sender info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={senderProfilePicture} />
              <AvatarFallback>{senderName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{senderName}</h3>
              <p className="text-sm text-muted-foreground">
                wants to learn from you
              </p>
            </div>
          </div>

          {/* Skill they want to learn */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Skill requested:</label>
            <div className="p-3 bg-muted rounded-lg">
              <Badge variant="secondary" className="text-sm">
                {skill}
              </Badge>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{message}</p>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 If you accept, a chat will open where you can coordinate your learning session.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1 gap-2"
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Accept & Chat
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          You can always block users if they become inappropriate or spammy.
        </p>
      </DialogContent>
    </Dialog>
  );
};