/**
 * @file SignUpForm.tsx
 * @description Sign up form component with multi-step registration
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Eye, EyeOff } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SkillInputComponent } from '@/components/ui/SkillInputComponent';
import { SignUpFormProps } from './AuthModalTypes';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateAge,
} from './ValidationUtils';
import { useTranslation } from 'react-i18next';

/**
 * @component SignUpForm
 * @description Handles user sign up with multi-step form validation
 *
 * @param {SignUpFormProps} props - Component props
 * @param {Function} props.onSignUp - Callback when form is submitted
 * @param {string} props.error - Error message to display
 * @param {boolean} props.isLoading - Loading state for the form
 *
 * @example
 * <SignUpForm
 *   onSignUp={handleSignUp}
 *   error="Registration failed"
 *   isLoading={false}
 * />
 */
export const SignUpForm = ({ onSignUp, error, isLoading }: SignUpFormProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: '',
    bio: '',
    gender: '',
    country: '',
    age: '',
    skillsToTeach: [],
    skillsToLearn: [],
    willingToTeachWithoutReturn: false,
    phone: '',
    profilePicture: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState({});
  const [countryOpen, setCountryOpen] = React.useState(false);

  const STEP_TITLES = [
    'Create Account',
    'Profile Info',
    'Skills You Know',
    'Mentorship',
  ];

  const GENDERS = ['Male', 'Female'];
  const AGE_RANGES = ['Under 18', '18–24', '25–34', '35–44', '45+'];
  const COUNTRIES = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Japan',
    'South Korea',
    'India',
    'Brazil',
    'United Arab Emirates',
    'Saudi Arabia',
    'Egypt',
    'Jordan',
    'Lebanon',
    'Kuwait',
    'Qatar',
    'Bahrain',
    'Oman',
    'Morocco',
    'Tunisia',
    'Algeria',
    'Libya',
    'Iraq',
    'Syria',
    'Yemen',
    'Palestine',
    'Sudan',
    'Iran',
    'Turkey',
    'Israel',
    'Cyprus',
  ];

  /**
   * @function validateCurrentStep
   * @description Validates the current step before proceeding
   */
  const validateCurrentStep = () => {
    const errors = {};

    switch (currentStep) {
      case 1: // Email & Password
        if (formData.email) {
          errors.email = validateEmail(formData.email, t);
        }
        if (formData.password) {
          errors.password = validatePassword(formData.password, t);
        }
        break;
      case 2: // Profile Info
        if (formData.name) {
          errors.name = validateRequired(formData.name, 'Name', t);
        }
        if (formData.bio) {
          errors.bio = validateRequired(formData.bio, 'Bio', t);
        }
        if (formData.gender) {
          errors.gender = validateRequired(formData.gender, 'Gender', t);
        }
        if (formData.country) {
          errors.country = validateRequired(formData.country, 'Country', t);
        }
        if (formData.age) {
          errors.age = validateAge(formData.age, t);
        }
        break;
      case 3: // Skills
        if (!formData.skillsToTeach || formData.skillsToTeach.length === 0) {
          errors.skillsToTeach = 'Please add at least one skill you can teach.';
        }
        break;
      case 4: // Mentorship
        // Optional step, no validation needed
        break;
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  /**
   * @function handleNext
   * @description Handles moving to the next step
   */
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        onSignUp(formData);
      }
    }
  };

  /**
   * @function handleBack
   * @description Handles moving to the previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * @function renderStep1
   * @description Renders the email and password step
   */
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={e => {
            setFormData(prev => ({ ...prev, email: e.target.value }));
            if (e.target.value) {
              const emailError = validateEmail(e.target.value, t);
              setValidationErrors(prev => ({ ...prev, email: emailError }));
            } else {
              setValidationErrors(prev => ({ ...prev, email: undefined }));
            }
          }}
          className={validationErrors.email ? 'border-red-500' : ''}
        />
        {validationErrors.email && (
          <p className="text-sm text-red-500">{validationErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password (min. 6 characters)"
            value={formData.password}
            onChange={e => {
              setFormData(prev => ({ ...prev, password: e.target.value }));
              if (e.target.value) {
                const passwordError = validatePassword(e.target.value, t);
                setValidationErrors(prev => ({
                  ...prev,
                  password: passwordError,
                }));
              } else {
                setValidationErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            className={validationErrors.password ? 'border-red-500' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {validationErrors.password && (
          <p className="text-sm text-red-500">{validationErrors.password}</p>
        )}
      </div>

      <Button
        onClick={handleNext}
        disabled={
          isLoading ||
          !formData.email ||
          !formData.password ||
          validationErrors.email ||
          validationErrors.password
        }
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Continue'}
      </Button>
    </div>
  );

  /**
   * @function renderStep2
   * @description Renders the profile information step
   */
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={e => {
            setFormData(prev => ({ ...prev, name: e.target.value }));
            if (e.target.value) {
              const nameError = validateRequired(e.target.value, 'Name', t);
              setValidationErrors(prev => ({ ...prev, name: nameError }));
            } else {
              setValidationErrors(prev => ({ ...prev, name: undefined }));
            }
          }}
          className={validationErrors.name ? 'border-red-500' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-red-500">{validationErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={e => {
            setFormData(prev => ({ ...prev, bio: e.target.value }));
            if (e.target.value) {
              const bioError = validateRequired(e.target.value, 'Bio', t);
              setValidationErrors(prev => ({ ...prev, bio: bioError }));
            } else {
              setValidationErrors(prev => ({ ...prev, bio: undefined }));
            }
          }}
          className={validationErrors.bio ? 'border-red-500' : ''}
        />
        {validationErrors.bio && (
          <p className="text-sm text-red-500">{validationErrors.bio}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age Range</Label>
          <Select
            value={formData.age}
            onValueChange={value => {
              setFormData(prev => ({ ...prev, age: value }));
              if (value) {
                const ageError = validateAge(value, t);
                setValidationErrors(prev => ({ ...prev, age: ageError }));
              } else {
                setValidationErrors(prev => ({ ...prev, age: undefined }));
              }
            }}
          >
            <SelectTrigger
              className={validationErrors.age ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              {AGE_RANGES.map(age => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.age && (
            <p className="text-sm text-red-500">{validationErrors.age}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={value => {
              setFormData(prev => ({ ...prev, gender: value }));
              if (value) {
                const genderError = validateRequired(value, 'Gender', t);
                setValidationErrors(prev => ({ ...prev, gender: genderError }));
              } else {
                setValidationErrors(prev => ({ ...prev, gender: undefined }));
              }
            }}
          >
            <SelectTrigger
              className={validationErrors.gender ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map(gender => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.gender && (
            <p className="text-sm text-red-500">{validationErrors.gender}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start ${validationErrors.country ? 'border-red-500' : ''}`}
            >
              {formData.country || 'Select country'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map(country => (
                    <CommandItem
                      key={country}
                      onSelect={() => {
                        setFormData(prev => ({ ...prev, country }));
                        const countryError = validateRequired(
                          country,
                          'Country',
                          t
                        );
                        setValidationErrors(prev => ({
                          ...prev,
                          country: countryError,
                        }));
                        setCountryOpen(false);
                      }}
                    >
                      {country}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {validationErrors.country && (
          <p className="text-sm text-red-500">{validationErrors.country}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating account...' : 'Continue'}
        </Button>
      </div>
    </div>
  );

  /**
   * @function renderStep3
   * @description Renders the skills setup step
   */
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Skills You Can Teach</Label>
        <p className="text-sm text-muted-foreground">
          Add the skills you're willing to teach to others
        </p>
        {validationErrors.skillsToTeach && (
          <p className="text-sm text-red-500">
            {validationErrors.skillsToTeach}
          </p>
        )}
        <SkillInputComponent
          skills={formData.skillsToTeach}
          onSkillsChange={skills =>
            setFormData(prev => ({ ...prev, skillsToTeach: skills }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Skills You Want to Learn</Label>
        <p className="text-sm text-muted-foreground">
          Add skills you'd like to learn from others
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill to learn..."
            value={formData.skillsToLearn.join(', ')}
            onChange={e => {
              const skills = e.target.value
                .split(',')
                .map(s => s.trim())
                .filter(s => s);
              setFormData(prev => ({ ...prev, skillsToLearn: skills }));
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating account...' : 'Continue'}
        </Button>
      </div>
    </div>
  );

  /**
   * @function renderStep4
   * @description Renders the mentorship settings step
   */
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Mentorship Preferences</Label>
        <p className="text-sm text-muted-foreground">
          Configure your mentorship preferences
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="willingToTeachWithoutReturn"
          checked={formData.willingToTeachWithoutReturn}
          onCheckedChange={checked =>
            setFormData(prev => ({
              ...prev,
              willingToTeachWithoutReturn: checked,
            }))
          }
        />
        <Label htmlFor="willingToTeachWithoutReturn">
          I'm willing to teach without expecting anything in return
        </Label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {currentStep > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span>Step {currentStep} of 4</span>
            <span className="text-muted-foreground">
              {STEP_TITLES[currentStep - 1]}
            </span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {/* Step content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </div>
  );
};
