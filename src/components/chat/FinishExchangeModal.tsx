import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from 'lucide-react';

interface Exchange {
  id: string;
  status: 'pending' | 'active' | 'completed';
  currentUserSkill?: string;
  otherUserSkill?: string;
  currentUserAgreed?: boolean;
  otherUserAgreed?: boolean;
  currentUserFinished?: boolean;
  otherUserFinished?: boolean;
}

interface FinishExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  exchange: Exchange | null;
  currentUserId: string;
}

export const FinishExchangeModal = ({
  isOpen,
  onClose,
  onConfirm,
  exchange,
  currentUserId
}: FinishExchangeModalProps) => {
  if (!exchange) return null;

  const currentUserFinished = exchange.currentUserFinished || false;
  const otherUserFinished = exchange.otherUserFinished || false;
  const bothFinished = currentUserFinished && otherUserFinished;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Finish Exchange
          </DialogTitle>
          <DialogDescription className="text-center">
            Mark your skill exchange as complete and provide feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Exchange summary */}
          <div className="space-y-3">
            <h3 className="font-medium">Exchange Summary:</h3>
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">You teach:</span>
                <Badge variant="secondary">
                  {exchange.currentUserSkill}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">You learn:</span>
                <Badge variant="secondary">
                  {exchange.otherUserSkill}
                </Badge>
              </div>
            </div>
          </div>

          {/* Completion status */}
          <div className="space-y-3">
            <h3 className="font-medium">Completion Status:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {currentUserFinished ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  You {currentUserFinished ? 'have' : 'have not'} marked as finished
                </span>
              </div>
              <div className="flex items-center gap-2">
                {otherUserFinished ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  Other user {otherUserFinished ? 'has' : 'has not'} marked as finished
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation message */}
          {!currentUserFinished && (
            <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                Are you sure you want to mark this exchange as finished? This action cannot be undone.
              </p>
            </div>
          )}

          {currentUserFinished && !otherUserFinished && (
            <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                You've marked the exchange as finished. Waiting for the other user to confirm.
              </p>
            </div>
          )}

          {bothFinished && (
            <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                🎉 Exchange completed! You can now leave reviews for each other.
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          {!currentUserFinished && (
            <Button
              onClick={onConfirm}
              className="flex-1"
            >
              Mark as Finished
            </Button>
          )}
          {currentUserFinished && (
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          The exchange is officially completed only when both users confirm.
        </p>
      </DialogContent>
    </Dialog>
  );
};