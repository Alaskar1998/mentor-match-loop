import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Send, Lock, Crown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface InvitationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  userType: "free" | "premium";
  remainingInvites?: number;
  appCoins?: number;
}

export const InvitationFlow = ({ 
  isOpen, 
  onClose, 
  recipientId,
  recipientName, 
  userType,
  remainingInvites = 3,
  appCoins = 50
}: InvitationFlowProps) => {
  const [message, setMessage] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const sendInvitation = async () => {
    if (!user || !message.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          skill: 'General', // You could make this dynamic based on the context
          message: message.trim(),
          status: 'pending'
        });

      if (error) {
        toast.error("Failed to send invitation");
        console.error('Invitation error:', error);
        return;
      }

      toast.success(`Invitation sent to ${recipientName}!`);
      onClose();
      setMessage("");
      setShowPayment(false);
      
      // Optionally navigate to invites page
      setTimeout(() => {
        navigate('/dashboard/invites');
      }, 1000);
    } catch (error) {
      toast.error("Failed to send invitation");
      console.error('Invitation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    sendInvitation();
  };

  const handlePayment = () => {
    // TODO: Implement actual coin payment logic here
    toast.error("Payment system not implemented yet. Please upgrade to Premium.");
  };

  const handleUpgradeToPremium = () => {
    navigate('/pricing');
    onClose();
  };

  const messageCost = 5; // App coins
  const inviteCost = 10; // App coins per extra invite

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Invitation to {recipientName}
          </DialogTitle>
        </DialogHeader>

        {!showPayment ? (
          <div className="space-y-6">
            {/* User Status */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {userType === "premium" ? (
                      <>
                        <Crown className="w-4 h-4 text-accent" />
                        <Badge variant="default" className="bg-accent">Premium</Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline">Free User</Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    {appCoins} coins
                  </div>
                </div>

                {userType === "free" && (
                  <div className="mt-3 text-sm">
                    <div className="flex justify-between">
                      <span>Invites remaining this month:</span>
                      <span className="font-medium">{remainingInvites}/3</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Compose */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Your message to {recipientName}</label>
              <Textarea
                placeholder="Hi! I'd love to learn from you. Let's exchange skills!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Cost Information for Free Users */}
            {userType === "free" && (
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-accent mb-2">Message Cost</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Send message:</span>
                          <span className="font-medium">{messageCost} coins</span>
                        </div>
                        {remainingInvites <= 0 && (
                          <div className="flex justify-between">
                            <span>Extra invite:</span>
                            <span className="font-medium">{inviteCost} coins</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total cost:</span>
                          <span>{messageCost + (remainingInvites <= 0 ? inviteCost : 0)} coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Benefits */}
            {userType === "free" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <Crown className="w-8 h-8 text-primary mx-auto" />
                    <div>
                      <h4 className="font-semibold text-primary">Upgrade to Premium</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Unlimited invites & messages, priority support, and more!
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleUpgradeToPremium}
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvite} 
                disabled={!message.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        ) : (
          /* Payment Confirmation */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Coins className="w-12 h-12 text-accent mx-auto" />
              <h3 className="text-lg font-semibold">Confirm Payment</h3>
              <p className="text-muted-foreground">
                You're about to use {messageCost + (remainingInvites <= 0 ? inviteCost : 0)} App Coins
              </p>
            </div>

            <Card className="border-0 bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Send message to {recipientName}</span>
                  <span>{messageCost} coins</span>
                </div>
                {remainingInvites <= 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Extra invite (no invites left)</span>
                    <span>{inviteCost} coins</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{messageCost + (remainingInvites <= 0 ? inviteCost : 0)} coins</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Remaining balance</span>
                  <span>{appCoins - (messageCost + (remainingInvites <= 0 ? inviteCost : 0))} coins</span>
                </div>
              </CardContent>
            </Card>

            {appCoins < (messageCost + (remainingInvites <= 0 ? inviteCost : 0)) && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-destructive font-medium">
                    Insufficient coins! You need {(messageCost + (remainingInvites <= 0 ? inviteCost : 0)) - appCoins} more coins.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Buy More Coins
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPayment(false)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={appCoins < (messageCost + (remainingInvites <= 0 ? inviteCost : 0))}
                className="flex-1"
              >
                Confirm & Send
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};