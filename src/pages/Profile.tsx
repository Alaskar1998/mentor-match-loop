import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Upload, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SkillInputComponent } from '@/components/ui/SkillInputComponent';
import { type Skill } from '@/data/skills';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Age ranges constant
const AGE_RANGES = [
  "Under 18",
  "18–24",
  "25–34",
  "35–44",
  "45+"
];

// Countries list (same as in AuthModal)
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "South Korea", "India", "Brazil",
  "United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Lebanon",
  "Kuwait", "Qatar", "Bahrain", "Oman", "Morocco", "Tunisia", "Algeria",
  "Libya", "Iraq", "Syria", "Yemen", "Palestine", "Sudan", "Iran",
  "Turkey", "Israel", "Cyprus"
];

// Remove mockCompletedExchanges and mockReceivedReviews arrays and any code that uses them.

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skillLoading, setSkillLoading] = useState(false); // Separate loading state for skills
  const [countryOpen, setCountryOpen] = useState(false);
  
  // Debounce loading state changes to prevent rapid updates
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    country: user?.country || '',
    age: (user as any)?.age_range || '',
    gender: (user as any)?.gender || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || '',
    willingToTeachWithoutReturn: (user as any)?.willingToTeachWithoutReturn || false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(loading);
    }, 100); // 100ms debounce

    return () => clearTimeout(timer);
  }, [loading]);

  // Update form data when user changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        country: user.country || '',
        age: (user as any)?.age_range || '',
        gender: (user as any)?.gender || '',
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        willingToTeachWithoutReturn: (user as any)?.willingToTeachWithoutReturn || false,
      });
      // Clear loading state when exiting edit mode
      setLoading(false);
    }
  }, [user, isEditing]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload an avatar.",
        variant: "destructive"
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      // Try different bucket names in case 'avatars' doesn't exist
      let uploadResult;
      let bucketName = 'avatars';
      
      try {
        uploadResult = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
      } catch (bucketError) {
        console.log('avatars bucket not found, trying profile-images');
        bucketName = 'profile-images';
        uploadResult = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
      }

      if (uploadResult.error) {
        console.error('Upload error details:', uploadResult.error);
        throw new Error(uploadResult.error.message || 'Upload failed');
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Update form data with new avatar URL
      setFormData(prev => ({ ...prev, profilePicture: publicUrl }));
      
      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user || !user.id) return;

    setLoading(true);
    
    // Add timeout to prevent hanging on slow systems
    const timeoutId = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Operation timeout",
        description: "The operation is taking longer than expected. Please try again.",
        variant: "destructive"
      });
    }, 10000); // 10 second timeout

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.name,
          bio: formData.bio,
          country: formData.country,
          age: null,
          age_range: formData.age,
          gender: formData.gender,
          phone: formData.phone,
          avatar_url: formData.profilePicture,
          willing_to_teach_without_return: formData.willingToTeachWithoutReturn,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      await updateUser({
        name: formData.name,
        bio: formData.bio,
        country: formData.country,
        age_range: formData.age, // Save as age_range, not age
        gender: formData.gender,
        phone: formData.phone,
        profilePicture: formData.profilePicture,
        willingToTeachWithoutReturn: formData.willingToTeachWithoutReturn,
      });

      clearTimeout(timeoutId);
      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLoading(false); // Clear any loading state
  };

  const addSkillToTeach = async (newSkill: Skill) => {
    if (!user || !user.id) return;

    setSkillLoading(true);
    
    // Add timeout to prevent hanging on slow systems
    const timeoutId = setTimeout(() => {
      setSkillLoading(false);
      toast({
        title: "Operation timeout",
        description: "The operation is taking longer than expected. Please try again.",
        variant: "destructive"
      });
    }, 10000); // 10 second timeout

    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('skills_to_teach')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current skills:', fetchError);
        toast({
          title: "Error",
          description: "Failed to fetch current skills",
          variant: "destructive"
        });
        return;
      }

      const currentSkills = Array.isArray(profile?.skills_to_teach) ? profile.skills_to_teach : [];
      const newSkillObj = {
        name: newSkill.name,
        level: newSkill.level,
        description: newSkill.description,
        category: newSkill.category || 'Other'
      };

      const updatedSkills = [...currentSkills, newSkillObj] as Array<{name: string; level: string; description: string; category?: string}>;

      const { error } = await supabase
        .from('profiles')
        .update({ skills_to_teach: updatedSkills })
        .eq('id', user.id);

      if (error) {
        console.error('Error adding skill:', error);
        toast({
          title: "Error",
          description: "Failed to add skill",
          variant: "destructive"
        });
        return;
      }

      // Update local user state to reflect the new skill
      await updateUser({
        skillsToTeach: updatedSkills
      });
      
      clearTimeout(timeoutId);
      toast({
        title: "Success",
        description: "Skill added successfully!"
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive"
      });
    } finally {
      setSkillLoading(false);
    }
  };

  const removeSkillToTeach = async (index: number) => {
    if (!user || !user.id) return;

    setSkillLoading(true);
    try {
      const currentSkills = user.skillsToTeach || [];
      const updatedSkills = currentSkills.filter((_, i) => i !== index);

      const { error } = await supabase
        .from('profiles')
        .update({ skills_to_teach: updatedSkills })
        .eq('id', user.id);

      if (error) {
        console.error('Error removing skill:', error);
        toast({
          title: "Error",
          description: "Failed to remove skill",
          variant: "destructive"
        });
        return;
      }

      await updateUser({
        skillsToTeach: updatedSkills
      });
      
      toast({
        title: "Success",
        description: "Skill removed successfully!"
      });
    } catch (error) {
      console.error('Error removing skill:', error);
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive"
      });
    } finally {
      setSkillLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile</h1>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={debouncedLoading}>
                    {debouncedLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Avatar and Basic Info */}
            <div className="space-y-6">
              {/* Avatar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={formData.profilePicture} />
                      <AvatarFallback>{formData.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                          disabled={uploadingAvatar}
                        />
                        <label htmlFor="avatar-upload">
                          <Button variant="outline" disabled={uploadingAvatar} asChild>
                            <span>
                              {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      disabled={!isEditing}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age Range</Label>
                      <Select
                        value={formData.age}
                        onValueChange={(value) => setFormData({...formData, age: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGE_RANGES.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({...formData, gender: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className="w-full justify-between mt-1"
                          disabled={!isEditing}
                        >
                          {formData.country || "Select country..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search countries..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {COUNTRIES.map((country) => (
                                <CommandItem
                                  key={country}
                                  value={country}
                                  onSelect={(currentValue) => {
                                    setFormData({...formData, country: currentValue});
                                    setCountryOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.country === country ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {country}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Mentorship Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="willingToTeachWithoutReturn"
                      checked={formData.willingToTeachWithoutReturn}
                      onCheckedChange={(checked) => setFormData({...formData, willingToTeachWithoutReturn: checked})}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="willingToTeachWithoutReturn" className="text-sm">
                      I am willing to teach without expecting a return mentorship.
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Skills */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills I Can Teach */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills I Can Teach</CardTitle>
                  <p className="text-muted-foreground">Share your expertise with others</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current skills */}
                  <div className="space-y-3">
                    {user?.skillsToTeach?.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{skill.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {skill.category || 'Other'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Level: {skill.level}</span>
                          </div>
                          {skill.description && (
                            <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeSkillToTeach(index)}
                          disabled={skillLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )) || <p className="text-muted-foreground">No skills to teach added yet.</p>}
                  </div>

                  {/* Add new skill using unified component */}
                  <SkillInputComponent
                    onAddSkill={addSkillToTeach}
                    disabled={skillLoading}
                    loading={skillLoading}
                    title="Add New Skill"
                    skipDatabase={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 