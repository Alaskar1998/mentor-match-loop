import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Save, X, Upload, Plus, Trash2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: "", description: "" });
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    country: user?.country || '',
    age: (user as any)?.age || '',
    gender: (user as any)?.gender || '',
    phone: (user as any)?.phone || '',
    profilePicture: user?.profilePicture || '',
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    
    try {
      const fileName = `${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

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
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addSkillToTeach = async () => {
    if (newSkill.name && newSkill.level && user) {
      setLoading(true);
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
          description: newSkill.description
        };

        const updatedSkills = [...currentSkills, newSkillObj];

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
        } else {
          toast({
            title: "Success",
            description: "Skill added successfully!"
          });
          setNewSkill({ name: '', level: '', description: '' });
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const removeSkillToTeach = async (index: number) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('skills_to_teach')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current skills:', fetchError);
        return;
      }

      const currentSkills = Array.isArray(profile?.skills_to_teach) ? profile.skills_to_teach : [];
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
      } else {
        toast({
          title: "Success",
          description: "Skill removed successfully!"
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.name,
          bio: formData.bio,
          country: formData.country,
          age: parseInt(formData.age) || null,
          gender: formData.gender,
          phone: formData.phone,
          avatar_url: formData.profilePicture,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant={isEditing ? "ghost" : "outline"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
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
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="mt-1 w-full justify-between"
                    >
                      {formData.country || "Select your country..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={formData.gender || "Select gender"} />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map(gender => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Bio</h3>
                <p className="text-muted-foreground">{user?.bio || 'No bio added yet.'}</p>
              </div>
              <div>
                <h3 className="font-medium">Country</h3>
                <p className="text-muted-foreground">{user?.country || 'No country specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Age</h3>
                  <p className="text-muted-foreground">{(user as any)?.age || 'No age specified'}</p>
                </div>
                <div>
                  <h3 className="font-medium">Gender</h3>
                  <p className="text-muted-foreground">{(user as any)?.gender || 'No gender specified'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-muted-foreground">{(user as any)?.phone || 'No phone number'}</p>
              </div>
              <div>
                <h3 className="font-medium">Account Type</h3>
                <Badge variant="secondary">{user?.userType}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
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
                  <p className="text-sm text-muted-foreground">Level: {skill.level}</p>
                  {skill.description && (
                    <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeSkillToTeach(index)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )) || <p className="text-muted-foreground">No skills to teach added yet.</p>}
          </div>

          {/* Add new skill */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-medium">Add New Skill</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
              />
              <Select 
                value={newSkill.level} 
                onValueChange={(value) => setNewSkill({...newSkill, level: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addSkillToTeach} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newSkill.description}
              onChange={(e) => setNewSkill({...newSkill, description: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}