import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Lock, Crown, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import { logger } from '@/utils/logger';

interface InvitationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  userType: 'mentor' | 'learner';
  remainingInvites?: number;
  isPremium?: boolean;
  skillsToTeach?: Array<{name: string; level: string; description: string; category?: string}>;
  onInviteSent?: () => void; // Callback to refresh invites after sending
}

export const InvitationFlow = ({ 
  isOpen, 
  onClose, 
  recipientId,
  recipientName, 
  userType,
  remainingInvites = 3,
  isPremium = false,
  skillsToTeach = [],
  onInviteSent
}: InvitationFlowProps) => {
  const [message, setMessage] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const sendInvitation = async () => {
    if (!user || !selectedSkill) return;
    
    // Message is now optional for all users (including premium)
    // Premium users can still send personalized messages if they want to
    
    // console.log('🚀 Starting invitation send process...', {
    //   sender: user.id,
    //   recipient: recipientId,
    //   skill: selectedSkill,
    //   message: message.trim()
    // });
    
    setIsLoading(true);
    try {
      logger.debug('💾 Inserting invitation into database...');
      const { error } = await supabase
        .from('invitations')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          skill: selectedSkill,
          message: message.trim() || 'No message provided',
          status: 'pending'
        });
      if (error) {
        logger.error('❌ Failed to insert invitation:', error);
        toast.error("Failed to send invitation");
        logger.error('Invitation error:', error);
        return;
      }
      
      logger.debug('✅ Invitation inserted successfully');
      
      logger.debug('👤 Fetching sender profile...');
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      const senderName = senderProfile?.display_name || user.email || 'Someone';
      
      logger.debug('📧 Sender profile fetched:', { senderName });
      
      try {
        // console.log('🔍 Creating notification with data:', {
        //   userId: recipientId,
        //   senderId: user.id,
        //   senderName: senderName,
        //   skill: selectedSkill
        // });
        
        await notificationService.createNotification({
          userId: recipientId,
          title: 'New Invitation Received',
          message: `${senderName} wants to learn ${selectedSkill} from you`,
          isRead: false,
          type: 'invitation_received',
          actionUrl: '/my-exchanges?tab=request',
          metadata: { 
            senderId: user.id, 
            senderName: senderName,
            skill: selectedSkill
          }
        });
        logger.debug('✅ Notification created successfully for recipient:', recipientId);
      } catch (notificationError) {
        logger.error('❌ Failed to create notification:', notificationError);
        logger.error('❌ Notification error details:', JSON.stringify(notificationError, null, 2));
        // Don't fail the invitation if notification fails
      }
      
             logger.debug('🎉 Invitation process completed successfully');
       toast.success('Invitation sent successfully!');
       setMessage("");
       setSelectedSkill("");
       onClose();
       onInviteSent?.(); // Call the callback after successful invitation
    } catch (error) {
      logger.error('❌ Overall invitation error:', error);
      logger.error('❌ Overall error details:', JSON.stringify(error, null, 2));
      toast.error("Failed to send invitation");
      logger.error('Invitation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = () => {
    if (!selectedSkill) {
      toast.error("Please select a skill");
      return;
    }
    sendInvitation();
  };

  const handleUpgradeToPremium = () => {
    navigate('/pricing');
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
                 <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Send className="w-5 h-5" />
             Send Invitation to {recipientName}
           </DialogTitle>
           <DialogDescription>
             Connect with {recipientName} to start your skill exchange journey.
           </DialogDescription>
         </DialogHeader>
          <div className="space-y-6">
            {/* Skill Selection */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Select a skill to learn</label>
              <select
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
              >
                <option value="">-- Select a skill --</option>
                {skillsToTeach.map((skill, index) => (
                  <option key={index} value={typeof skill === 'string' ? skill : skill.name}>
                    {typeof skill === 'string' ? skill : skill.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground mt-1">Select the skill you’d like to learn from this user.</div>
            </div>
            {/* Message Compose */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Your message to {recipientName} (optional)</label>
                {!isPremium && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Premium Only
                  </Badge>
                )}
              </div>
              {isPremium ? (
                <Textarea
                  placeholder="Hi! I'd love to learn from you. Let's exchange skills! (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              ) : (
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Premium Feature</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Send personalized messages with your invitations to increase your chances of getting accepted.
                    </p>
                    <Button 
                      onClick={handleUpgradeToPremium}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSendInvite} 
                disabled={!selectedSkill || isLoading}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
                         </div>
           </div>
       </DialogContent>
     </Dialog>
   );
};