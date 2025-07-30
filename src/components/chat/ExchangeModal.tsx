import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, BookOpen, Handshake, CheckCircle, Clock, ArrowRight, Sparkles, AlertTriangle, RefreshCw, RotateCcw, XCircle, Circle, CheckCircle2 } from "lucide-react";

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

export const ExchangeModal = React.memo(({
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
  
  // Error recovery state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showErrorRecovery, setShowErrorRecovery] = useState(false);

  // Reset form when modal opens, but preserve user's current selection
  useEffect(() => {
    if (isOpen) {
      // Only reset if user hasn't made a selection yet or if contract data is available
      const hasUserSelected = contractData?.currentUserSkill || contractData?.currentUserIsMentorship;
      
      if (!hasUserSelected) {
        // User hasn't made a selection yet, keep current form state or reset to empty
        if (!selectedSkill && !isMentorship) {
          setSelectedSkill('');
          setIsMentorship(false);
        }
        // If user has already started selecting, don't reset their progress
      } else {
        // User has already made a selection, update form to match contract data
        setSelectedSkill(contractData?.currentUserSkill || '');
        setIsMentorship(contractData?.currentUserIsMentorship || false);
      }
      
      // Clear any previous errors when modal opens
      setError(null);
      setRetryCount(0);
      setShowErrorRecovery(false);
    }
  }, [isOpen, contractData?.currentUserSkill, contractData?.currentUserIsMentorship]);

  // Memoize modal content to prevent unnecessary recalculations
  const modalContent = useMemo(() => {
    // Determine if user has already made their selection
    const hasUserSelected = contractData?.currentUserSkill || contractData?.currentUserIsMentorship;
    const hasOtherUserSelected = contractData?.otherUserSkill || contractData?.otherUserIsMentorship;
    const bothSelected = hasUserSelected && hasOtherUserSelected;
    const userAgreed = contractData?.currentUserAgreed;
    const otherAgreed = contractData?.otherUserAgreed;

    // Check for error states first
    if (error) {
      return {
        title: "Something went wrong",
        description: "We encountered an issue with your exchange. You can retry or restart the process.",
        buttonText: "Retry",
        showForm: false,
        showSummary: false,
        canEdit: false,
        isError: true
      };
    }

    // Simplified state logic
    if (exchangeState === 'active_exchange') {
      return {
        title: "Exchange in Progress",
        description: "This exchange is already active and running.",
        buttonText: "Close",
        showForm: false,
        showSummary: false,
        canEdit: false
      };
    }

    if (bothSelected && !userAgreed) {
      return {
        title: "Step 3: Review Exchange Agreement",
        description: "Both skills have been selected. Review the agreement and confirm to start.",
        buttonText: "Agree & Start Exchange",
        showForm: false,
        showSummary: true,
        canEdit: false
      };
    }

    if (bothSelected && userAgreed && !otherAgreed) {
      return {
        title: "Step 4: Waiting for Partner",
        description: `You've agreed to the exchange. Waiting for ${otherUserName} to confirm.`,
        buttonText: "Close",
        showForm: false,
        showSummary: true,
        canEdit: false
      };
    }

    if (bothSelected && userAgreed && otherAgreed) {
      return {
        title: "Exchange Ready to Start",
        description: "Both parties have agreed. The exchange will begin shortly.",
        buttonText: "Close",
        showForm: false,
        showSummary: true,
        canEdit: false
      };
    }

    if (hasUserSelected && !hasOtherUserSelected) {
      return {
        title: "Step 2: Waiting for Partner",
        description: `You've selected your skill. ${otherUserName} is now choosing theirs.`,
        buttonText: "Update My Selection",
        showForm: true,
        showSummary: true,
        canEdit: true
      };
    }

    if (!hasUserSelected && hasOtherUserSelected) {
      return {
        title: "Step 1: Complete Your Exchange",
        description: `${otherUserName} has selected their skill. Now choose yours to complete the setup.`,
        buttonText: "Select My Skill",
        showForm: true,
        showSummary: true,
        canEdit: true
      };
    }

    // Default: Starting fresh
    return {
      title: "Step 1: Start Your Exchange",
      description: `Choose what you'll teach ${otherUserName} in this skill exchange.`,
      buttonText: "Select My Skill",
      showForm: true,
      showSummary: false,
      canEdit: true
    };
  }, [error, exchangeState, contractData, otherUserName]);

  // Safety check for modalContent
  if (!modalContent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Loading...</h2>
              <p className="text-muted-foreground">Please wait while we load the exchange details.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Determine if user can proceed with their selection
  const isButtonDisabled = () => {
    if (modalContent.buttonText === "Close") return false;
    if (modalContent.buttonText === "Confirm & Start Exchange") return false;
    if (modalContent.buttonText === "Retry") return false;
    if (modalContent.buttonText === "Update My Selection") return false; // Allow updates
    
    // For skill selection, require either skill or mentorship
    return !isMentorship && !selectedSkill;
  };

  // Error recovery functions
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setShowErrorRecovery(false);
    
    try {
      setIsLoading(true);
      
      // Retry the last action with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Re-attempt the action that failed
      if (modalContent.buttonText === "Confirm & Start Exchange") {
        await onFinalAgree();
      } else {
        await handleAgree();
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setError("Retry failed. Please try again or restart the process.");
      setShowErrorRecovery(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete the contract and reset chat state
      await supabase
        .from('exchange_contracts')
        .delete()
        .eq('chat_id', chatId);
      
      await supabase
        .from('chats')
        .update({ exchange_state: 'pending_start' })
        .eq('id', chatId);
      
      // Close modal and let parent component refresh
      onClose();
      toast.success("Exchange restarted successfully");
    } catch (err) {
      console.error('Restart failed:', err);
      setError("Failed to restart. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  // Main agreement handler
  const handleAgree = async () => {
    console.log('🎯 ExchangeModal handleAgree called with:', { selectedSkill, isMentorship });
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If we're in contract_proposed state and user hasn't agreed yet, use onFinalAgree
      if (exchangeState === 'contract_proposed' && !contractData?.currentUserAgreed) {
        console.log('🎯 Calling onFinalAgree for contract agreement');
        await onFinalAgree();
        return;
      }
      
      // Otherwise, handle skill selection
      if (!isMentorship && !selectedSkill) {
        toast.error("Please select a skill or choose mentorship session");
        return;
      }

      console.log('🎯 Calling onAgree with data:', { userSkill: selectedSkill, isMentorship });
      await onAgree({
        userSkill: selectedSkill,
        isMentorship
      });
      
      console.log('🎯 onAgree called, about to close modal');
    } catch (err) {
      console.error('Agreement error:', err);
      setError("Failed to save your selection. Please try again.");
      setShowErrorRecovery(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress tracking functions - 4-Step Mini Agreement System
  const getProgressSteps = () => {
    const hasUserSelected = contractData?.currentUserSkill || contractData?.currentUserIsMentorship;
    const hasOtherUserSelected = contractData?.otherUserSkill || contractData?.otherUserIsMentorship;
    const bothSelected = hasUserSelected && hasOtherUserSelected;
    const userAgreed = contractData?.currentUserAgreed;
    const otherAgreed = contractData?.otherUserAgreed;

    const steps = [
      {
        id: 'step1',
        title: 'User A Chooses',
        description: 'User A selects what they\'ll teach',
        status: 'pending' as const,
        icon: Users
      },
      {
        id: 'step2',
        title: 'User B Chooses',
        description: 'User B selects what they\'ll teach',
        status: 'pending' as const,
        icon: Users
      },
      {
        id: 'step3',
        title: 'Shared Summary',
        description: 'Both see the agreement summary',
        status: 'pending' as const,
        icon: Handshake
      },
      {
        id: 'step4',
        title: 'Agree & Start',
        description: 'Both confirm to start exchange',
        status: 'pending' as const,
        icon: CheckCircle
      }
    ];

    // Update step statuses based on current state
    if (hasUserSelected) {
      steps[0].status = 'completed';
      steps[1].status = 'current';
    }

    if (hasOtherUserSelected) {
      steps[1].status = 'completed';
      steps[2].status = 'current';
    }

    if (bothSelected) {
      steps[2].status = 'completed';
      steps[3].status = 'current';
    }

    if (userAgreed && otherAgreed) {
      steps[3].status = 'completed';
    }

    return steps;
  };

  const getProgressPercentage = () => {
    const steps = getProgressSteps();
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const getCurrentStepDescription = () => {
    const hasUserSelected = contractData?.currentUserSkill || contractData?.currentUserIsMentorship;
    const hasOtherUserSelected = contractData?.otherUserSkill || contractData?.otherUserIsMentorship;
    const bothSelected = hasUserSelected && hasOtherUserSelected;
    const userAgreed = contractData?.currentUserAgreed;
    const otherAgreed = contractData?.otherUserAgreed;

    // Step 1: User A chooses what they'll teach
    if (!hasUserSelected && !hasOtherUserSelected) {
      return {
        title: "Step 1: Choose what you'll teach",
        description: "Select the skill you want to teach in this exchange",
        icon: Users
      };
    }

    // Step 2: User B chooses what they'll teach
    if (hasUserSelected && !hasOtherUserSelected) {
      return {
        title: `Step 2: Waiting for ${otherUserName} to choose`,
        description: `You've selected your skill. ${otherUserName} is now choosing theirs.`,
        icon: Users
      };
    }

    // Step 3: Both see shared summary
    if (bothSelected && !userAgreed) {
      return {
        title: "Step 3: Review the exchange agreement",
        description: "Both skills selected. Review the summary before confirming.",
        icon: Handshake
      };
    }

    // Step 4: Both agree and start
    if (bothSelected && userAgreed && !otherAgreed) {
      return {
        title: `Step 4: Waiting for ${otherUserName} to agree`,
        description: `You've agreed to the exchange. ${otherUserName} needs to confirm.`,
        icon: CheckCircle
      };
    }

    if (bothSelected && userAgreed && otherAgreed) {
      return {
        title: "Exchange ready to start!",
        description: "Both parties have agreed. The exchange can begin!",
        icon: CheckCircle
      };
    }

    return {
      title: "Step 1: Choose what you'll teach",
      description: "Select the skill you want to teach in this exchange",
      icon: Users
    };
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage < 33) return 'bg-blue-500';
    if (percentage < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  try {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {modalContent.title}
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                {modalContent.description}
              </DialogDescription>
            </DialogHeader>

            {/* Error Recovery */}
            {error && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-destructive mb-2">Something went wrong</h3>
                      <p className="text-sm text-muted-foreground mb-3">{error}</p>
                      <div className="flex gap-2">
                        <Button onClick={handleRetry} size="sm" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                        <Button onClick={handleRestart} size="sm" variant="destructive">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restart
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Indicators */}
            {!error && (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-between">
                  {getProgressSteps().map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'current' ? 'bg-blue-500 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      {index < getProgressSteps().length - 1 && (
                        <div className={`w-12 h-0.5 mx-2 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Current Step Description */}
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getCurrentStepDescription().icon;
                        return <IconComponent className="w-4 h-4" />;
                      })()}
                      <span className="text-sm font-medium">{getCurrentStepDescription().title}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Form */}
            {!error && modalContent.showForm && (
              <div className="space-y-4">
                {/* Skill Selection */}
                <div className="space-y-2">
                  <Label htmlFor="skill-select">What will you teach?</Label>
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a skill to teach" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserSkills.map((skill) => (
                        <SelectItem key={skill.name} value={skill.name}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mentorship Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Mentorship Session</Label>
                    <p className="text-xs text-muted-foreground">
                      Offer guidance and coaching instead of a specific skill
                    </p>
                  </div>
                  <Switch
                    checked={isMentorship}
                    onCheckedChange={setIsMentorship}
                  />
                </div>

                {/* Selected Skill Preview */}
                {(selectedSkill || isMentorship) && (
                  <Card className="bg-accent/10 border-accent/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">
                          You'll teach: {isMentorship ? 'Mentorship Session' : selectedSkill}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Contract Summary */}
            {!error && modalContent.showSummary && contractData && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-center">Exchange Contract</h3>
                  
                  <div className="space-y-3">
                    {/* Current User */}
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">You</span>
                        </div>
                        <span className="text-sm">will teach</span>
                      </div>
                      {contractData?.currentUserSkill ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {contractData?.currentUserIsMentorship ? 'Mentorship Session' : contractData?.currentUserSkill}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting...
                        </Badge>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{otherUserName}</span>
                        </div>
                        <span className="text-sm">will teach</span>
                      </div>
                      {contractData?.otherUserSkill ? (
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          {contractData?.otherUserIsMentorship ? 'Mentorship Session' : contractData?.otherUserSkill}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting...
                        </Badge>
                      )}
                    </div>
                  </div>

                  {contractData?.otherUserSkill && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-accent/10 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2 text-success mb-2">
                        <Handshake className="w-4 h-4" />
                        <span className="text-sm font-medium">Step 3: Exchange Agreement Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-background/50 p-2 rounded">
                          <div className="font-medium text-primary">You will teach:</div>
                          <div className="text-muted-foreground">
                            {contractData?.currentUserIsMentorship ? 'Mentorship Session' : contractData?.currentUserSkill}
                          </div>
                        </div>
                        <div className="bg-background/50 p-2 rounded">
                          <div className="font-medium text-primary">{otherUserName} will teach:</div>
                          <div className="text-muted-foreground">
                            {contractData?.otherUserIsMentorship ? 'Mentorship Session' : contractData?.otherUserSkill}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Review the agreement above and click "Agree & Start Exchange" to confirm.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {!error && (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    try {
                      if (modalContent.buttonText === "Agree & Start Exchange") {
                        onFinalAgree();
                      } else {
                        handleAgree();
                      }
                    } catch (error) {
                      console.error('Button click error:', error);
                      setError("An error occurred. Please try again.");
                    }
                  }}
                  disabled={isButtonDisabled() || isLoading}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {modalContent.buttonText === "Agree & Start Exchange" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {modalContent.buttonText}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isLoading}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Notices */}
            {!error && (
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Once both users agree, the exchange will be active for 30 minutes. 
                    You can communicate via chat during this time.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Circle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    You can cancel this exchange at any time before both users agree.
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  } catch (error) {
    console.error('Error rendering ExchangeModal:', error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">There was an error loading the exchange modal.</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
});