/**
 * @file MentorshipPreferencesForm.tsx
 * @description Mentorship preferences form component for user registration
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MentorshipPreferencesFormProps } from './AuthModalTypes';

export const MentorshipPreferencesForm = ({
  formData,
  isLoading,
  onFormDataChange,
  onBack,
  onContinue,
  onSocialAuth,
}: MentorshipPreferencesFormProps) => {
  const handleWillingToTeachChange = (checked: boolean) => {
    onFormDataChange({
      ...formData,
      willingToTeachWithoutReturn: checked,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Mentorship Preferences</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="willingToTeachWithoutReturn"
            checked={formData.willingToTeachWithoutReturn || false}
            onCheckedChange={handleWillingToTeachChange}
          />
          <Label htmlFor="willingToTeachWithoutReturn">
            I'm willing to teach without expecting anything in return
          </Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onContinue} disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => onSocialAuth('google')}
          disabled={isLoading}
        >
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => onSocialAuth('facebook')}
          disabled={isLoading}
        >
          Facebook
        </Button>
        <Button
          variant="outline"
          onClick={() => onSocialAuth('apple')}
          disabled={isLoading}
        >
          Apple
        </Button>
      </div>
    </div>
  );
};
