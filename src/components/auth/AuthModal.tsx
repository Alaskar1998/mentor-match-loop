import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Mail, Phone, Search, User, Lock, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SkillInputComponent } from "@/components/ui/SkillInputComponent";
import { 
  SKILL_CATEGORIES, 
  SKILL_LEVELS, 
  findCategoryForSkill, 
  getCategoryEmoji,
  type Skill 
} from "@/data/skills";
// Only import Json from the correct location
import { Json } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthComplete: (userData?: any) => void;
  defaultMode?: 'signup' | 'signin';
}

interface SignupData {
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

// Add a validation error for skills
interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  bio?: string;
  gender?: string;
  country?: string;
  age?: string;
  skillsToTeach?: string;
}

// Validation functions
const validateEmail = (email: string, t: any): string | undefined => {
  if (!email) return t('actions.email') + " " + t('actions.required');
  if (!email.includes('@')) return t('actions.email') + " " + t('actions.mustContainAt');
  if (!email.includes('.') || email.split('@')[1]?.split('.')[0]?.length === 0) {
    return t('actions.pleaseEnterValidEmail');
  }
  return undefined;
};

const validatePassword = (password: string, t: any): string | undefined => {
  if (!password) return t('actions.password') + " " + t('actions.required');
  if (password.length < 6) return t('actions.passwordMustBeAtLeast6');
  return undefined;
};

const validateRequired = (value: string, fieldName: string, t: any): string | undefined => {
  if (!value || value.trim() === '') return `${fieldName} ` + t('actions.required');
  return undefined;
};

const validateAge = (age: string, t: any): string | undefined => {
  if (!age || age.trim() === '') return t('actions.ageRangeRequired');
  return undefined;
};

const STEP_TITLES = [
  "Create Account",
  "Profile Info", 
  "Skills You Know",
  "Mentorship"
];

const GENDERS = ["Male", "Female"];

const AGE_RANGES = [
  "Under 18",
  "18–24", 
  "25–34",
  "35–44",
  "45+"
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "South Korea", "India", "Brazil",
  "United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Lebanon",
  "Kuwait", "Qatar", "Bahrain", "Oman", "Morocco", "Tunisia", "Algeria",
  "Libya", "Iraq", "Syria", "Yemen", "Palestine", "Sudan", "Iran",
  "Turkey", "Israel", "Cyprus"
];

export const AuthModal = ({ isOpen, onClose, onAuthComplete, defaultMode = 'signup' }: AuthModalProps) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(defaultMode);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupData>>({
    skillsToTeach: [],
    skillsToLearn: [],
    willingToTeachWithoutReturn: false
  });
  const [signinData, setSigninData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [newSkill, setNewSkill] = useState({ name: "", level: "", description: "", category: "" });
  const [newLearnSkill, setNewLearnSkill] = useState("");
  
  const { signup, login, signInWithGoogle, signInWithFacebook, signInWithApple, updateUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Update mode when defaultMode prop changes
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        skillsToTeach: [],
        skillsToLearn: [],
        willingToTeachWithoutReturn: false
      });
      setSigninData({ email: '', password: '' });
      setValidationErrors({});
      setNewSkill({ name: "", level: "", description: "", category: "" });
      setNewLearnSkill("");
    }
  }, [isOpen]);

  // Real-time validation for sign-in
  const validateSignIn = () => {
    const errors: ValidationErrors = {};
    
    if (signinData.email) {
      errors.email = validateEmail(signinData.email, t);
    }
    if (signinData.password) {
      errors.password = validatePassword(signinData.password, t);
    }
    
    setValidationErrors(errors);
    return !errors.email && !errors.password;
  };

  // Real-time validation for sign-up
  const validateSignUp = () => {
    const errors: ValidationErrors = {};
    
    if (formData.email) {
      errors.email = validateEmail(formData.email, t);
    }
    if (formData.password) {
      errors.password = validatePassword(formData.password, t);
    }
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
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Check if sign-in form is valid
  const isSignInValid = () => {
    return signinData.email && signinData.password && !validationErrors.email && !validationErrors.password;
  };

  // Update isCurrentStepValid to require at least one skill on the skills step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: // Email & Password
        return formData.email && formData.password && !validationErrors.email && !validationErrors.password;
      case 2: // Profile Info
        return formData.name && formData.bio && formData.gender && formData.country && formData.age &&
               !validationErrors.name && !validationErrors.bio && !validationErrors.gender && 
               !validationErrors.country && !validationErrors.age;
      case 3: // Skills
        return (formData.skillsToTeach && formData.skillsToTeach.length > 0);
      case 4: // Mentorship
        return true; // Mentorship settings are optional
      default:
        return false;
    }
  };

  const handleSignIn = async () => {
    // Validate form
    if (!validateSignIn()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    if (!signinData.email || !signinData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const result = await login(signinData.email, signinData.password);
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Sign in failed",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      onAuthComplete();
      onClose();
    }
  };

  // In the signup flow, only call signup() after all steps are completed
  // Remove signup call from earlier steps (if any)

  // Add error message if user tries to continue without a skill
  const handleSignUp = async () => {
    // Validate current step before proceeding
    if (!isCurrentStepValid()) {
      if (currentStep === 3 && (!formData.skillsToTeach || formData.skillsToTeach.length === 0)) {
        setValidationErrors(prev => ({ ...prev, skillsToTeach: 'Please add at least one skill you can teach.' }));
      }
      toast({
        title: "Validation Error",
        description: "Please complete all required fields correctly.",
        variant: "destructive"
      });
      return;
    } else {
      setValidationErrors(prev => ({ ...prev, skillsToTeach: undefined }));
    }

    // If not on the last step, just go to the next step
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    console.log('Starting signup process with formData:', formData);
    
    try {
      const result = await signup(formData);
      console.log('Signup result:', result);
      
      if (result.error) {
        setIsLoading(false);
        toast({
          title: "Sign up failed",
          description: result.error,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Signup successful, proceeding to profile update...');

      // Get the current user from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No user session after signup');
        setIsLoading(false);
        toast({
          title: "Profile Update Error",
          description: "Could not get user information after signup",
          variant: "destructive"
        });
        return;
      }

      const currentUser = session.user;
      console.log('Got current user:', currentUser.id);

      // Update profile with upsert
      const normalizedSkillsToTeach: Skill[] = (formData.skillsToTeach || []).map(skill =>
        typeof skill === "string"
          ? { name: skill, level: "", description: "" }
          : skill
      );

      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: currentUser.id,
        display_name: formData.name,
        bio: formData.bio,
        country: formData.country,
        age: null,
        age_range: formData.age || '',
        gender: formData.gender,
        phone: formData.phone,
        skills_to_teach: normalizedSkillsToTeach as unknown as Json,
        skills_to_learn: (formData.skillsToLearn || []) as any[],
        willing_to_teach_without_return: formData.willingToTeachWithoutReturn || false,
        avatar_url: formData.profilePicture || '',
      }]);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast({
          title: "Profile Update Error",
          description: `Failed to update profile: ${profileError.message}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('Profile updated successfully');
      
      // Force a profile refresh to ensure auth context has latest data
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: refreshedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (refreshedProfile) {
            console.log('Refreshed profile data:', refreshedProfile);
            // Update the auth context with the new profile data
            updateUser({
              name: refreshedProfile.display_name,
              bio: refreshedProfile.bio,
              country: refreshedProfile.country,
              age_range: (refreshedProfile as any).age_range,
              gender: refreshedProfile.gender,
              phone: refreshedProfile.phone,
              profilePicture: refreshedProfile.avatar_url,
              skillsToTeach: Array.isArray(refreshedProfile.skills_to_teach) 
                ? refreshedProfile.skills_to_teach.filter(skill => typeof skill === 'object' && skill !== null && 'name' in skill && 'level' in skill && 'description' in skill).map(skill => ({
                    name: (skill as any).name || '',
                    level: (skill as any).level || '',
                    description: (skill as any).description || '',
                    category: (skill as any).category
                  }))
                : [],
              skillsToLearn: refreshedProfile.skills_to_learn || [],
              willingToTeachWithoutReturn: refreshedProfile.willing_to_teach_without_return || false,
            });
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing profile after signup:', refreshError);
        // Continue anyway - the auth state change will handle it
      }
      
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to the platform. Your profile has been set up.",
      });
      onAuthComplete();
      onClose();
      
    } catch (error) {
      console.error('Error in signup process:', error);
      setIsLoading(false);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred during signup",
        variant: "destructive"
      });
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    let result;
    
    switch (provider) {
      case 'google':
        result = await signInWithGoogle();
        break;
      case 'facebook':
        result = await signInWithFacebook();
        break;
      case 'apple':
        result = await signInWithApple();
        break;
    }
    
    setIsLoading(false);
    
    if (result?.error) {
      toast({
        title: "Authentication failed",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You've been signed in successfully.",
      });
      onAuthComplete();
      onClose();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: t('actions.uploadFailed'),
                  description: t('actions.failedToUploadAvatar'),
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSkillToTeach = () => {
    if (newSkill.name && newSkill.level) {
      setFormData(prev => ({
        ...prev,
        skillsToTeach: [...(prev.skillsToTeach || []), { ...newSkill }]
      }));
      setNewSkill({ name: "", level: "", description: "", category: "" });
    }
  };

  const removeSkillToTeach = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skillsToTeach: prev.skillsToTeach?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddSkill = (skill: Skill) => {
    setFormData(prev => ({
      ...prev,
      skillsToTeach: [...(prev.skillsToTeach || []), skill]
    }));
  };

  const addSkillToLearn = () => {
    if (newLearnSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skillsToLearn: [...(prev.skillsToLearn || []), newLearnSkill.trim()]
      }));
      setNewLearnSkill("");
    }
  };

  const removeSkillToLearn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skillsToLearn: prev.skillsToLearn?.filter((_, i) => i !== index) || []
    }));
  };

  const renderSignInForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">{t('actions.email')}</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder={t('actions.enterEmail')}
          value={signinData.email}
          onChange={(e) => {
            setSigninData(prev => ({ ...prev, email: e.target.value }));
            // Real-time validation
            if (e.target.value) {
              const emailError = validateEmail(e.target.value, t);
              setValidationErrors(prev => ({ ...prev, email: emailError }));
            } else {
              setValidationErrors(prev => ({ ...prev, email: undefined }));
            }
          }}
          className={validationErrors.email ? "border-red-500" : ""}
        />
        {validationErrors.email && (
          <p className="text-sm text-red-500">{validationErrors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signin-password">{t('actions.password')}</Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder={t('actions.enterPassword')}
            value={signinData.password}
            onChange={(e) => {
              setSigninData(prev => ({ ...prev, password: e.target.value }));
              // Real-time validation
              if (e.target.value) {
                const passwordError = validatePassword(e.target.value, t);
                setValidationErrors(prev => ({ ...prev, password: passwordError }));
              } else {
                setValidationErrors(prev => ({ ...prev, password: undefined }));
              }
            }}
            className={validationErrors.password ? "border-red-500" : ""}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {validationErrors.password && (
          <p className="text-sm text-red-500">{validationErrors.password}</p>
        )}
      </div>

      <Button 
        onClick={handleSignIn} 
        disabled={isLoading || !isSignInValid()}
        className="w-full"
      >
        {isLoading ? t('actions.signingIn') : t('actions.signIn')}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t('actions.orContinueWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button variant="outline" onClick={() => handleSocialAuth('google')} disabled={isLoading}>
          Google
        </Button>
        <Button variant="outline" onClick={() => handleSocialAuth('facebook')} disabled={isLoading}>
          Facebook
        </Button>
        <Button variant="outline" onClick={() => handleSocialAuth('apple')} disabled={isLoading}>
          Apple
        </Button>
      </div>
    </div>
  );

  const renderSignUpForm = () => {
    if (mode === 'signin') return null;
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email || ""}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  // Real-time validation
                  if (e.target.value) {
                    const emailError = validateEmail(e.target.value);
                    setValidationErrors(prev => ({ ...prev, email: emailError }));
                  } else {
                    setValidationErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                className={validationErrors.email ? "border-red-500" : ""}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password || ""}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    // Real-time validation
                    if (e.target.value) {
                      const passwordError = validatePassword(e.target.value);
                      setValidationErrors(prev => ({ ...prev, password: passwordError }));
                    } else {
                      setValidationErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={validationErrors.password ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <Button 
              onClick={handleSignUp} 
              disabled={isLoading || !isCurrentStepValid()} 
              className="w-full"
            >
              {isLoading ? "Creating account..." : "Continue"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => handleSocialAuth('google')} disabled={isLoading}>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('facebook')} disabled={isLoading}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('apple')} disabled={isLoading}>
                Apple
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name || ""}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  // Real-time validation
                  if (e.target.value) {
                    const nameError = validateRequired(e.target.value, 'Name');
                    setValidationErrors(prev => ({ ...prev, name: nameError }));
                  } else {
                    setValidationErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                className={validationErrors.name ? "border-red-500" : ""}
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
                value={formData.bio || ""}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, bio: e.target.value }));
                  // Real-time validation
                  if (e.target.value) {
                    const bioError = validateRequired(e.target.value, 'Bio');
                    setValidationErrors(prev => ({ ...prev, bio: bioError }));
                  } else {
                    setValidationErrors(prev => ({ ...prev, bio: undefined }));
                  }
                }}
                className={validationErrors.bio ? "border-red-500" : ""}
              />
              {validationErrors.bio && (
                <p className="text-sm text-red-500">{validationErrors.bio}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age Range</Label>
                <Select 
                  value={formData.age || ""} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, age: value }));
                    // Real-time validation
                    if (value) {
                      const ageError = validateAge(value);
                      setValidationErrors(prev => ({ ...prev, age: ageError }));
                    } else {
                      setValidationErrors(prev => ({ ...prev, age: undefined }));
                    }
                  }}
                >
                  <SelectTrigger className={validationErrors.age ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map(age => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
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
                  value={formData.gender || ""} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, gender: value }));
                    // Real-time validation
                    if (value) {
                      const genderError = validateRequired(value, 'Gender');
                      setValidationErrors(prev => ({ ...prev, gender: genderError }));
                    } else {
                      setValidationErrors(prev => ({ ...prev, gender: undefined }));
                    }
                  }}
                >
                  <SelectTrigger className={validationErrors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map(gender => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
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
                    className={`w-full justify-start ${validationErrors.country ? "border-red-500" : ""}`}
                  >
                    {formData.country || "Select country"}
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
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, country }));
                              // Real-time validation
                              const countryError = validateRequired(country, 'Country');
                              setValidationErrors(prev => ({ ...prev, country: countryError }));
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

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSignUp} disabled={isLoading} className="flex-1">
                {isLoading ? "Creating account..." : "Continue"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => handleSocialAuth('google')} disabled={isLoading}>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('facebook')} disabled={isLoading}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('apple')} disabled={isLoading}>
                Apple
              </Button>
            </div>
          </div>
        );

      case 3:
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
                <p className="text-sm text-red-500">{validationErrors.skillsToTeach}</p>
              )}
              <SkillInputComponent
                onAddSkill={handleAddSkill}
                title="Add Skill to Teach"
                compact={true}
                skipDatabase={true}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSignUp} disabled={isLoading} className="flex-1">
                {isLoading ? "Creating account..." : "Continue"}
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
              <Button variant="outline" onClick={() => handleSocialAuth('google')} disabled={isLoading}>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('facebook')} disabled={isLoading}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('apple')} disabled={isLoading}>
                Apple
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mentorship Preferences</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="willingToTeachWithoutReturn"
                  checked={formData.willingToTeachWithoutReturn || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, willingToTeachWithoutReturn: checked }))}
                />
                <Label htmlFor="willingToTeachWithoutReturn">
                  I'm willing to teach without expecting anything in return
                </Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSignUp} disabled={isLoading} className="flex-1">
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => handleSocialAuth('google')} disabled={isLoading}>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('facebook')} disabled={isLoading}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleSocialAuth('apple')} disabled={isLoading}>
                Apple
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'signin' ? t('actions.welcomeBack') : t('actions.joinLearningCommunity')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'signup' | 'signin')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">{t('actions.signUp')}</TabsTrigger>
            <TabsTrigger value="signin">{t('actions.signIn')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-4">
            {renderSignInForm()}
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            {currentStep > 1 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{t('actions.step')} {currentStep} {t('actions.of')} 4</span>
                  <span className="text-muted-foreground">{STEP_TITLES[currentStep - 1]}</span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {renderSignUpForm()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 