import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Skill {
  name: string;
  level: string;
  description: string;
}

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: (data: { recipientSkill?: string; isMentorship: boolean }) => void;
  initiatorName: string;
  recipientName: string;
  initiatorSkill: string;
  recipientSkills: Skill[];
}

export const ExchangeModal = ({
  isOpen,
  onClose,
  onAgree,
  initiatorName,
  recipientName,
  initiatorSkill,
  recipientSkills
}: ExchangeModalProps) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [isMentorship, setIsMentorship] = useState(false);

  const handleAgree = () => {
    onAgree({
      recipientSkill: selectedSkill,
      isMentorship
    });
    
    // Reset form
    setSelectedSkill('');
    setIsMentorship(false);
  };

  const canProceed = isMentorship || selectedSkill;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            What skills are you exchanging?
          </DialogTitle>
          <DialogDescription className="text-center">
            Select the skills you'll be teaching and learning in this exchange.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Initiator's skill (pre-populated) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {initiatorName} will teach:
            </label>
            <div className="p-3 bg-muted rounded-lg">
              <Badge variant="secondary" className="text-sm">
                {initiatorSkill}
              </Badge>
            </div>
          </div>

          {/* Recipient's skill selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {recipientName} will teach:
            </label>
            
            {/* Skill selection dropdown */}
            <Select 
              value={selectedSkill} 
              onValueChange={setSelectedSkill}
              disabled={isMentorship}
            >
              <SelectTrigger className={isMentorship ? 'opacity-50' : ''}>
                <SelectValue placeholder="Select a skill to teach" />
              </SelectTrigger>
              <SelectContent>
                {recipientSkills.map((skill) => (
                  <SelectItem key={skill.name} value={skill.name}>
                    <div className="flex items-center gap-2">
                      <span>{skill.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {skill.level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mentorship option */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="mentorship"
                checked={isMentorship}
                onCheckedChange={(checked) => {
                  setIsMentorship(checked as boolean);
                  if (checked) {
                    setSelectedSkill('');
                  }
                }}
              />
              <label
                htmlFor="mentorship"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nothing — this is a mentorship session.
              </label>
            </div>

            {isMentorship && (
              <p className="text-sm text-muted-foreground italic">
                {recipientName} is offering to teach without expecting a skill in return.
              </p>
            )}
          </div>

          {/* Selected skill preview */}
          {selectedSkill && !isMentorship && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Selected skill:</p>
              <Badge variant="secondary">
                {selectedSkill}
              </Badge>
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
          <Button
            onClick={handleAgree}
            disabled={!canProceed}
            className="flex-1"
          >
            Agree & Start Exchange
          </Button>
        </div>

        {/* Agreement notice */}
        <p className="text-xs text-muted-foreground text-center">
          Both users must agree to these terms before the exchange officially starts.
        </p>
      </DialogContent>
    </Dialog>
  );
};