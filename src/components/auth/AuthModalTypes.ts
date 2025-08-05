/**
 * @file AuthModalTypes.ts
 * @description Type definitions for authentication modal components
 */

import { Skill } from '@/data/skills';

/**
 * @interface SignupData
 * @description Data structure for user signup
 */
export interface SignupData {
  email: string;
  password: string;
  name: string;
  bio: string;
  gender: string;
  country: string;
  age: string;
  skillsToTeach: Skill[];
  skillsToLearn: string[];
  willingToTeachWithoutReturn: boolean;
  phone?: string;
  profilePicture?: string;
}

/**
 * @interface AuthModalProps
 * @description Props for the main AuthModal component
 */
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthComplete: (userData?: any) => void;
  defaultMode?: 'signup' | 'signin';
}

/**
 * @interface SignInFormProps
 * @description Props for the SignInForm component
 */
export interface SignInFormProps {
  onSignIn: (data: { email: string; password: string }) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

/**
 * @interface SignUpFormProps
 * @description Props for the SignUpForm component
 */
export interface SignUpFormProps {
  onSignUp: (data: SignupData) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

/**
 * @interface ProfileSetupFormProps
 * @description Props for the ProfileSetupForm component
 */
export interface ProfileSetupFormProps {
  formData: Partial<SignupData>;
  validationErrors: Record<string, string | undefined>;
  isLoading: boolean;
  onFormDataChange: (data: Partial<SignupData>) => void;
  onValidationErrorsChange: (
    errors: Record<string, string | undefined>
  ) => void;
  onBack: () => void;
  onContinue: () => void;
  onSocialAuth: (provider: 'google' | 'facebook' | 'apple') => void;
}

/**
 * @interface SkillsSetupFormProps
 * @description Props for the SkillsSetupForm component
 */
export interface SkillsSetupFormProps {
  formData: Partial<SignupData>;
  validationErrors: Record<string, string | undefined>;
  isLoading: boolean;
  onFormDataChange: (data: Partial<SignupData>) => void;
  onValidationErrorsChange: (
    errors: Record<string, string | undefined>
  ) => void;
  onBack: () => void;
  onContinue: () => void;
  onSocialAuth: (provider: 'google' | 'facebook' | 'apple') => void;
}

/**
 * @interface MentorshipPreferencesFormProps
 * @description Props for the MentorshipPreferencesForm component
 */
export interface MentorshipPreferencesFormProps {
  formData: Partial<SignupData>;
  isLoading: boolean;
  onFormDataChange: (data: Partial<SignupData>) => void;
  onBack: () => void;
  onContinue: () => void;
  onSocialAuth: (provider: 'google' | 'facebook' | 'apple') => void;
}

/**
 * @interface SocialAuthButtonsProps
 * @description Props for the SocialAuthButtons component
 */
export interface SocialAuthButtonsProps {
  onGoogleAuth: () => Promise<void>;
  onFacebookAuth: () => Promise<void>;
  onAppleAuth: () => Promise<void>;
  isLoading?: boolean;
}
