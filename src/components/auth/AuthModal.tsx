import { useState } from "react";
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
import { 
  SKILL_CATEGORIES, 
  SKILL_LEVELS, 
  findCategoryForSkill, 
  getCategoryEmoji,
  type Skill 
} from "@/data/skills";

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
  age: number;
  skillsToTeach: Skill[];
  skillsToLearn: string[];
  willingToTeachWithoutReturn: boolean;
  phone?: string;
  profilePicture?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  bio?: string;
  gender?: string;
  country?: string;
  age?: string;
}

// Validation functions
const validateEmail = (email: string): string | undefined => {
  if (!email) return "Email is required";
  if (!email.includes('@')) return "Email must contain @";
  if (!email.includes('.') || email.split('@')[1]?.split('.')[0]?.length === 0) {
    return "Please enter a valid email address";
  }
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return undefined;
};

const validateRequired = (value: string, fieldName: string): string | undefined => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return undefined;
};

const validateAge = (age: number): string | undefined => {
  if (!age || age < 13) return "Age must be at least 13";
  if (age > 120) return "Please enter a valid age";
  return undefined;
};

const STEP_TITLES = [
  "Create Account",
  "Profile Info", 
  "Skills You Know",
  "Mentorship"
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "South Korea", "India", "Brazil",
  "United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Lebanon",
  "Kuwait", "Qatar", "Bahrain", "Oman", "Morocco", "Tunisia", "Algeria",
  "Libya", "Iraq", "Syria", "Yemen", "Palestine", "Sudan", "Iran",
  "Turkey", "Israel", "Cyprus"
];

const GENDERS = ["Male", "Female"];

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
  
  const { signup, login, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const { toast } = useToast();

  // Real-time validation for sign-in
  const validateSignIn = () => {
    const errors: ValidationErrors = {};
    
    if (signinData.email) {
      errors.email = validateEmail(signinData.email);
    }
    if (signinData.password) {
      errors.password = validatePassword(signinData.password);
    }
    
    setValidationErrors(errors);
    return !errors.email && !errors.password;
  };

  // Real-time validation for sign-up
  const validateSignUp = () => {
    const errors: ValidationErrors = {};
    
    if (formData.email) {
      errors.email = validateEmail(formData.email);
    }
    if (formData.password) {
      errors.password = validatePassword(formData.password);
    }
    if (formData.name) {
      errors.name = validateRequired(formData.name, 'Name');
    }
    if (formData.bio) {
      errors.bio = validateRequired(formData.bio, 'Bio');
    }
    if (formData.gender) {
      errors.gender = validateRequired(formData.gender, 'Gender');
    }
    if (formData.country) {
      errors.country = validateRequired(formData.country, 'Country');
    }
    if (formData.age) {
      errors.age = validateAge(formData.age);
    }
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  // Check if sign-in form is valid
  const isSignInValid = () => {
    return signinData.email && signinData.password && !validationErrors.email && !validationErrors.password;
  };

  // Check if current sign-up step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: // Email & Password
        return formData.email && formData.password && !validationErrors.email && !validationErrors.password;
      case 2: // Profile Info
        return formData.name && formData.bio && formData.gender && formData.country && formData.age &&
               !validationErrors.name && !validationErrors.bio && !validationErrors.gender && 
               !validationErrors.country && !validationErrors.age;
      case 3: // Skills
        return true; // Skills are optional
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

  const handleSignUp = async () => {
    // Validate current step before proceeding
    if (!isCurrentStepValid()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final validation before submission
      if (!validateSignUp()) {
        toast({
          title: "Validation Error",
          description: "Please fix all errors before submitting.",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      const result = await signup(formData as SignupData);
      setIsLoading(false);
      
      if (result.error) {
        toast({
          title: "Signup failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        onAuthComplete();
        onClose();
      }
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
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
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
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="Enter your email"
          value={signinData.email}
          onChange={(e) => {
            setSigninData(prev => ({ ...prev, email: e.target.value }));
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
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={signinData.password}
            onChange={(e) => {
              setSigninData(prev => ({ ...prev, password: e.target.value }));
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
        onClick={handleSignIn} 
        disabled={isLoading || !isSignInValid()}
        className="w-full"
      >
        {isLoading ? "Signing in..." : "Sign In"}
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
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map(gender => (
                      <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
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
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select value={newSkill.level} onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Brief description of your experience"
                value={newSkill.description}
                onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
              />
              <Button onClick={addSkillToTeach} disabled={!newSkill.name || !newSkill.level} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
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
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => setMode(value as 'signup' | 'signin')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-4">
            {renderSignInForm()}
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            {currentStep > 1 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Step {currentStep} of 4</span>
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