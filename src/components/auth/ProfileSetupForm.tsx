/**
 * @file ProfileSetupForm.tsx
 * @description Profile setup form component for user registration
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
import { Search } from 'lucide-react';
import { ProfileSetupFormProps } from './AuthModalTypes';
import { validateRequired, validateAge } from './ValidationUtils';
import { useTranslation } from 'react-i18next';

// Constants
const GENDERS = ['Male', 'Female'];
const AGE_RANGES = ['Under 18', '18–24', '25–34', '35–44', '45+'];
const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'Japan',
  'South Korea',
  'India',
  'Brazil',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Austria',
  'Belgium',
  'Ireland',
  'New Zealand',
  'Singapore',
  'Hong Kong',
  'Taiwan',
  'China',
  'Russia',
  'Turkey',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Romania',
  'Bulgaria',
  'Croatia',
  'Slovenia',
  'Slovakia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Greece',
  'Portugal',
  'Malta',
  'Cyprus',
  'Luxembourg',
  'Iceland',
  'Liechtenstein',
  'Monaco',
  'Andorra',
  'San Marino',
  'Vatican City',
  'Other',
];

export const ProfileSetupForm = ({
  formData,
  validationErrors,
  isLoading,
  onFormDataChange,
  onValidationErrorsChange,
  onBack,
  onContinue,
  onSocialAuth,
}: ProfileSetupFormProps) => {
  const { t } = useTranslation();
  const [countryOpen, setCountryOpen] = React.useState(false);

  const handleFieldChange = (
    field: keyof typeof formData,
    value: string,
    validator?: (value: string) => string | undefined
  ) => {
    onFormDataChange({ ...formData, [field]: value });

    if (validator) {
      const error = validator(value);
      onValidationErrorsChange({ ...validationErrors, [field]: error });
    }
  };

  const handleNameChange = (value: string) => {
    handleFieldChange('name', value, val =>
      val ? validateRequired(val, 'Name', t) : undefined
    );
  };

  const handleBioChange = (value: string) => {
    handleFieldChange('bio', value, val =>
      val ? validateRequired(val, 'Bio', t) : undefined
    );
  };

  const handleAgeChange = (value: string) => {
    handleFieldChange('age', value, val =>
      val ? validateAge(val, t) : undefined
    );
  };

  const handleGenderChange = (value: string) => {
    handleFieldChange('gender', value, val =>
      val ? validateRequired(val, 'Gender', t) : undefined
    );
  };

  const handleCountryChange = (country: string) => {
    handleFieldChange('country', country, val =>
      val ? validateRequired(val, 'Country', t) : undefined
    );
    setCountryOpen(false);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.bio &&
      formData.age &&
      formData.gender &&
      formData.country &&
      !validationErrors.name &&
      !validationErrors.bio &&
      !validationErrors.age &&
      !validationErrors.gender &&
      !validationErrors.country
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your full name"
          value={formData.name || ''}
          onChange={e => handleNameChange(e.target.value)}
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
          value={formData.bio || ''}
          onChange={e => handleBioChange(e.target.value)}
          className={validationErrors.bio ? 'border-red-500' : ''}
        />
        {validationErrors.bio && (
          <p className="text-sm text-red-500">{validationErrors.bio}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age Range</Label>
          <Select value={formData.age || ''} onValueChange={handleAgeChange}>
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
            value={formData.gender || ''}
            onValueChange={handleGenderChange}
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
              <Search className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map(country => (
                    <CommandItem
                      key={country}
                      onSelect={() => handleCountryChange(country)}
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

      <div className="flex gap-4">
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
