/**
 * @file SkillsSetupForm.tsx
 * @description Skills setup form component for user registration
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { SkillInputComponent } from '@/components/ui/SkillInputComponent';
import { Skill } from '@/data/skills';
import { SkillsSetupFormProps } from './AuthModalTypes';
import { validateSkillsToTeach } from './ValidationUtils';
import { useTranslation } from 'react-i18next';

export const SkillsSetupForm = ({
  formData,
  validationErrors,
  isLoading,
  onFormDataChange,
  onValidationErrorsChange,
  onBack,
  onContinue,
  onSocialAuth,
}: SkillsSetupFormProps) => {
  const { t } = useTranslation();

  const removeSkillToTeach = (index: number) => {
    const updatedSkills =
      formData.skillsToTeach?.filter((_, i) => i !== index) || [];
    const updatedFormData = { ...formData, skillsToTeach: updatedSkills };
    onFormDataChange(updatedFormData);

    // Validate after removal
    const error = validateSkillsToTeach(updatedSkills, t);
    onValidationErrorsChange({ ...validationErrors, skillsToTeach: error });
  };

  const handleAddSkill = (skill: Skill) => {
    const updatedSkills = [...(formData.skillsToTeach || []), skill];
    const updatedFormData = { ...formData, skillsToTeach: updatedSkills };
    onFormDataChange(updatedFormData);

    // Validate after addition
    const error = validateSkillsToTeach(updatedSkills, t);
    onValidationErrorsChange({ ...validationErrors, skillsToTeach: error });
  };

  const isFormValid = () => {
    return (
      formData.skillsToTeach &&
      formData.skillsToTeach.length > 0 &&
      !validationErrors.skillsToTeach
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Skills You Can Teach</Label>
        <div className="space-y-2">
          {formData.skillsToTeach?.map((skill, index) => (
            <Card key={index}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {skill.level} • {skill.description}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkillToTeach(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {validationErrors.skillsToTeach && (
          <p className="text-sm text-red-500">
            {validationErrors.skillsToTeach}
          </p>
        )}
        <SkillInputComponent
          onAddSkill={handleAddSkill}
          title="Add Skill to Teach"
          compact={true}
          skipDatabase={true}
        />
      </div>

      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={isLoading || !isFormValid()}
          className="flex-1"
        >
          {isLoading ? 'Creating account...' : 'Continue'}
        </Button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            OR CONTINUE WITH
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
