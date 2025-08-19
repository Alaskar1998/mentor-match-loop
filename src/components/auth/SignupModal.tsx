import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Mail, Phone, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SkillInputComponent } from "@/components/ui/SkillInputComponent";
import { type Skill } from "@/data/skills";
import { useTranslation } from "react-i18next";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupComplete: (userData: SignupData) => void;
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
const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"];

export const SignupModal = ({ isOpen, onClose, onSignupComplete }: SignupModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupData>>({
    skillsToTeach: [],
    skillsToLearn: [],
    willingToTeachWithoutReturn: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [newSkill, setNewSkill] = useState({ name: "", level: "", description: "", category: "" });
  const [newLearnSkill, setNewLearnSkill] = useState("");
  
  const { signup, signInWithGoogle, signInWithFacebook, signInWithApple } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      const result = await signup(formData as SignupData);
      setIsLoading(false);
      
      if (result.error) {
        toast({
          title: t('actions.signupFailed'),
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: t('actions.accountCreated'),
          description: t('actions.checkEmailVerify'),
        });
        onSignupComplete(formData as SignupData);
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
    
    if (result.error) {
      toast({
        title: t('actions.authenticationFailed'),
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    
    try {
      // Create a unique filename
      const fileName = `${Date.now()}-${file.name}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        setFormData(prev => ({ ...prev, profilePicture: data.publicUrl }));
        toast({
          title: "Avatar uploaded",
          description: "Your profile picture has been uploaded successfully.",
        });
      }
    } catch (error) {
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
        skillsToTeach: [...(prev.skillsToTeach || []), newSkill]
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">{t('actions.joinLearningCommunity')}</h3>
              <p className="text-muted-foreground">{t('actions.createAccountDescription')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">{t('actions.emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('actions.enterEmail')}
                  value={formData.email || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">{t('actions.createPassword')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('actions.createPassword')}
                  value={formData.password || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">{t('actions.orContinueWith')}</p>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleSocialAuth('google')}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialAuth('facebook')}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSocialAuth('apple')}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
                    <path fill="currentColor" d="M15.53 3.83c.893-1.09 1.491-2.58 1.326-4.08-1.281.039-2.831.857-3.75 1.935-.831.948-1.56 2.4-1.365 3.847 1.443.104 2.913-.728 3.789-1.702z"/>
                  </svg>
                  Apple
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">{t('actions.tellUsAboutYourself')}</h3>
              <p className="text-muted-foreground">{t('actions.helpOthersKnowYou')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('actions.fullName')}</Label>
                <Input
                  id="name"
                  placeholder={t('actions.enterFullName')}
                  value={formData.name || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="photo">{t('actions.profilePhoto')}</Label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {formData.profilePicture ? (
                      <img 
                        src={formData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? t('actions.uploading') : t('actions.uploadPhoto')}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">{t('actions.bio')}</Label>
                <Textarea
                  id="bio"
                  placeholder={t('actions.tellUsAboutYou')}
                  value={formData.bio || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">{t('actions.gender')}</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('actions.selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map(gender => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="age">{t('actions.age')}</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder={t('actions.age')}
                    value={formData.age || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">{t('actions.country')}</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="mt-1 w-full justify-between"
                    >
                      {formData.country || t('actions.selectCountry')}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder={t('actions.searchCountries')} />
                      <CommandList>
                        <CommandEmpty>{t('actions.noCountryFound')}</CommandEmpty>
                        <CommandGroup>
                          {COUNTRIES.map((country) => (
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
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">{t('actions.skillsYouCanTeach')}</h3>
              <p className="text-muted-foreground">{t('actions.shareKnowledge')}</p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <SkillInputComponent
                  onAddSkill={handleAddSkill}
                  title={t('actions.addSkillToTeach')}
                  compact={true}
                />
              </CardContent>
            </Card>

            {formData.skillsToTeach && formData.skillsToTeach.length > 0 &&
              <div className="space-y-3">
                <h4 className="font-medium">{t('actions.yourSkills')}</h4>
                {formData.skillsToTeach.map((skill, index) => (
                  <Card key={index}>
                    <CardContent className="p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="outline">{skill.level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkillToTeach(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} disabled={isLoading} className="flex-1">
                {isLoading ? t('actions.creatingAccount') : "Continue"}
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">{t('actions.mentorshipTitle')}</h3>
              <p className="text-muted-foreground">{t('actions.shapeLearningCommunity')}</p>
            </div>

            <Card className="border-2 border-dashed border-accent/20 bg-accent/5">
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-4xl">🌟</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">{t('actions.becomeMentor')}</h4>
                  <p className="text-muted-foreground mb-4">
                    {t('actions.mentorDescription')}
                  </p>
                  
                  <div className="flex items-center justify-center gap-3">
                    <Label htmlFor="mentorship-toggle" className="text-base">
                      {t('actions.willingToTeachWithoutReturn')}
                    </Label>
                    <Checkbox
                      id="mentorship-toggle"
                      checked={formData.willingToTeachWithoutReturn || false}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, willingToTeachWithoutReturn: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border border-muted rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{t('actions.phoneVerification')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('actions.phoneVerificationDesc')}
                  </p>
                  <Input 
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {formData.willingToTeachWithoutReturn && (
              <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm text-accent font-medium">
                  {t('actions.congratulations')} {t('actions.mentorBadgeMessage')}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('actions.step')} {currentStep} {t('actions.of')} 4: {STEP_TITLES[currentStep - 1]}</span>
          </DialogTitle>
          <DialogDescription>
            {t('actions.completeProfileSetup')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            className="min-w-[100px]"
          >
            {currentStep === 4 ? t('actions.complete') : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};