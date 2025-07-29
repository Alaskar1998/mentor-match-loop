import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: (data: { userSkill: string; isMentorship: boolean }) => void;
  onFinalAgree: () => void;
  chatId: string;
  otherUserName: string;
  currentUserSkills: Array<{name: string; level: string; description: string; category?: string}>;
  exchangeState: string;
  contractData?: {
    currentUserSkill?: string;
    otherUserSkill?: string;
    currentUserIsMentorship?: boolean;
    otherUserIsMentorship?: boolean;
    currentUserAgreed?: boolean;
    otherUserAgreed?: boolean;
  };
}

export const ExchangeModal = ({
  isOpen,
  onClose,
  onAgree,
  onFinalAgree,
  chatId,
  otherUserName,
  currentUserSkills,
  exchangeState,
  contractData
}: ExchangeModalProps) => {
  const { user } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [isMentorship, setIsMentorship] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSkill(contractData?.currentUserSkill || '');
      setIsMentorship(contractData?.currentUserIsMentorship || false);
    }
  }, [isOpen, contractData]);

  const handleAgree = () => {
    console.log('🎯 ExchangeModal handleAgree called with:', { selectedSkill, isMentorship });
    
    // If we're in contract_proposed state and user hasn't agreed yet, use onFinalAgree
    if (exchangeState === 'contract_proposed' && !contractData?.currentUserAgreed) {
      console.log('🎯 Calling onFinalAgree for contract agreement');
      onFinalAgree();
      return;
    }
    
    // Otherwise, handle skill selection
    if (!isMentorship && !selectedSkill) {
      toast.error("Please select a skill or choose mentorship session");
      return;
    }

    console.log('🎯 Calling onAgree with data:', { userSkill: selectedSkill, isMentorship });
    onAgree({
      userSkill: selectedSkill,
      isMentorship
    });
    
    console.log('🎯 onAgree called, about to close modal');
  };

  const canProceed = isMentorship || selectedSkill;

  // Get modal content based on exchange state
  const getModalContent = () => {
    switch (exchangeState) {
      case 'pending_start':
        return {
          title: "Start Your Skill Exchange",
          description: `Choose what you'll teach ${otherUserName} in this exchange.`,
          buttonText: "Start Exchange"
        };
      case 'draft_contract':
        if (contractData?.currentUserSkill || contractData?.currentUserIsMentorship) {
          return {
            title: "Waiting for Response",
            description: `You've selected your skill. Waiting for ${otherUserName} to choose theirs.`,
            buttonText: "Update My Selection"
          };
        } else {
          return {
            title: "Complete the Exchange Setup",
            description: `${otherUserName} wants to start an exchange. See what they'll teach and choose your skill.`,
            buttonText: "Start Exchange"
          };
        }
      case 'contract_proposed':
        return {
          title: "Review Exchange Agreement",
          description: "Both skills have been selected. Review and confirm to start the exchange.",
          buttonText: contractData?.currentUserAgreed ? "Already Agreed" : "Agree to Start Exchange"
        };
      default:
        return {
          title: "Exchange in Progress",
          description: "This exchange is already active.",
          buttonText: "Close"
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {modalContent.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>

        {/* Show contract summary if in later stages */}
        {(exchangeState === 'draft_contract' || exchangeState === 'contract_proposed') && contractData && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Exchange Summary:</h4>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">You will teach:</span>
                <Badge variant={contractData.currentUserIsMentorship ? "outline" : "secondary"}>
                  {contractData.currentUserIsMentorship ? "Mentorship Session" : contractData.currentUserSkill || "Not selected"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{otherUserName} will teach:</span>
                <Badge variant={contractData.otherUserIsMentorship ? "outline" : "secondary"}>
                  {contractData.otherUserIsMentorship ? "Mentorship Session" : contractData.otherUserSkill || "Not selected yet"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skill selection (only show if user can still select) */}
        {(exchangeState === 'pending_start' || 
          (exchangeState === 'draft_contract' && (!contractData?.currentUserSkill && !contractData?.currentUserIsMentorship))) && (
          <div className="space-y-4">
            {/* Mentorship toggle */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Switch
                id="mentorship"
                checked={isMentorship}
                onCheckedChange={setIsMentorship}
              />
              <Label htmlFor="mentorship" className="text-sm">
                Nothing — this is a mentorship session
              </Label>
            </div>

            {/* Skill selection */}
            {!isMentorship && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">What skill will you teach?</Label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill you'll teach..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUserSkills.map((skill, index) => (
                      <SelectItem key={index} value={skill.name}>
                        {skill.name} ({skill.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected skill preview */}
            {selectedSkill && !isMentorship && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">You will teach:</p>
                <Badge variant="secondary">
                  {selectedSkill}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {exchangeState === 'active_exchange' ? 'Close' : 'Cancel'}
          </Button>
          
          {exchangeState !== 'active_exchange' && (
            <Button
              onClick={handleAgree}
              disabled={
                (exchangeState === 'contract_proposed' && contractData?.currentUserAgreed) ||
                (exchangeState !== 'contract_proposed' && !canProceed)
              }
              className="flex-1"
            >
              {modalContent.buttonText}
            </Button>
          )}
        </div>

        {/* Agreement notice */}
        {exchangeState !== 'active_exchange' && (
          <p className="text-xs text-muted-foreground text-center">
            Both users must agree to these terms before the exchange officially starts.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};