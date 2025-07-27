import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Edit, Save, X, Plus, Upload, Search, 
  Trophy, Users, Clock, Star, MessageSquare, Mail, Phone, MapPin, Calendar, Trash2
} from "lucide-react";
import { 
  SKILL_CATEGORIES, 
  SKILL_LEVELS, 
  findCategoryForSkill, 
  getCategoryEmoji,
  type Skill 
} from "@/data/skills";

// Constants for form fields
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "South Korea", "India", "Brazil",
  "United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Lebanon",
  "Kuwait", "Qatar", "Bahrain", "Oman", "Morocco", "Tunisia", "Algeria",
  "Libya", "Iraq", "Syria", "Yemen", "Palestine", "Sudan", "Iran",
  "Turkey", "Israel", "Cyprus"
];

const GENDERS = ["Male", "Female"];

// Mock data for completed exchanges and reviews - replace with real data
const mockCompletedExchanges = [
  {
    id: '1',
    otherUser: { name: 'Sarah Johnson', avatar: null },
    skill: 'JavaScript',
    date: '2024-01-15',
    rating: 5,
    type: 'exchange'
  },
  {
    id: '2',
    otherUser: { name: 'Mike Chen', avatar: null },
    skill: 'Python',
    date: '2024-01-10',
    rating: 4,
    type: 'mentorship'
  },
  {
    id: '3',
    otherUser: { name: 'Emma Davis', avatar: null },
    skill: 'Spanish',
    date: '2024-01-05',
    rating: 5,
    type: 'exchange'
  }
];

const mockReceivedReviews = [
  {
    id: '1',
    reviewer: { name: 'Sarah Johnson', avatar: null },
    rating: 5,
    comment: 'Excellent teacher! Very patient and knowledgeable about JavaScript.',
    date: '2024-01-15',
    skill: 'JavaScript'
  },
  {
    id: '2',
    reviewer: { name: 'Mike Chen', avatar: null },
    rating: 4,
    comment: 'Great mentorship session. Helped me understand Python concepts clearly.',
    date: '2024-01-10',
    skill: 'Python'
  },
  {
    id: '3',
    reviewer: { name: 'Emma Davis', avatar: null },
    rating: 5,
    comment: 'Amazing Spanish conversation practice. Very helpful and encouraging!',
    date: '2024-01-05',
    skill: 'Spanish'
  }
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState({ category: '', name: '', level: '', description: '' });
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [customSkillMode, setCustomSkillMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    country: user?.country || '',
    age: (user as any)?.age?.toString() || '',
    gender: (user as any)?.gender || '',
    phone: (user as any)?.phone || '',
    profilePicture: user?.profilePicture || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        country: user.country || '',
        age: (user as any)?.age?.toString() || '',
        gender: (user as any)?.gender || '',
        phone: (user as any)?.phone || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    
    try {
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      
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
        // Update local user state
        updateUser({
          name: formData.name,
          bio: formData.bio,
          country: formData.country,
          age: parseInt(formData.age) || undefined,
          gender: formData.gender,
          phone: formData.phone,
          profilePicture: formData.profilePicture,
        });
        
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

  const getAverageRating = () => {
    if (mockReceivedReviews.length === 0) return 0;
    const total = mockReceivedReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / mockReceivedReviews.length) * 10) / 10; // Round to 1 decimal place
  };

  // Function to find category for a given skill name
  const findCategoryForSkill = (skillName: string): string => {
    const normalizedSkillName = skillName.toLowerCase().trim();
    for (const category of SKILL_CATEGORIES) {
      const foundSkill = category.skills.find(skill => 
        skill.toLowerCase() === normalizedSkillName
      );
      if (foundSkill) {
        return category.category;
      }
    }
    return '';
  };

  // Function to handle custom skill input
  const handleCustomSkillInput = (skillName: string) => {
    // If a category is already selected, keep that category for the custom skill
    // This ensures custom skills stay within the user's chosen category
    const category = newSkill.category || findCategoryForSkill(skillName) || 'Other';
    
    setNewSkill({ 
      ...newSkill, 
      name: skillName,
      category: category
    });
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
        } else {
          // Update local user state to reflect the new skill
          updateUser({
            skillsToTeach: updatedSkills
          });
          
          toast({
            title: "Success",
            description: "Skill added successfully!"
          });
          setNewSkill({ category: '', name: '', level: '', description: '' });
          setCustomSkillMode(false);
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
      const updatedSkills = currentSkills.filter((_, i) => i !== index) as Array<{name: string; level: string; description: string; category?: string}>;

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
        // Update local user state to reflect the removed skill
        updateUser({
          skillsToTeach: updatedSkills
        });
        
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and view your activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {formData.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{formData.name || 'No name set'}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {mockReceivedReviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(getAverageRating())
                                ? 'text-yellow-500 fill-current'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getAverageRating()}/5 ({mockReceivedReviews.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Fields */}
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
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell others about yourself..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      >
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
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <Button onClick={handleSave} disabled={loading} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Bio</h3>
                    <p className="text-muted-foreground">{formData.bio || 'No bio added yet.'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Country</h3>
                    <p className="text-muted-foreground">{formData.country || 'No country specified'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Age</h3>
                      <p className="text-muted-foreground">{formData.age || 'No age specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Gender</h3>
                      <p className="text-muted-foreground">{formData.gender || 'No gender specified'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">{formData.phone || 'No phone number'}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Category Dropdown */}
                  <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryOpen}
                        className="w-full justify-between"
                      >
                        {newSkill.category ? newSkill.category : "Select category"}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          {SKILL_CATEGORIES.map(cat => (
                            <CommandItem
                              key={cat.category}
                              value={cat.category}
                              onSelect={() => {
                                // If user already has a skill selected, check if it belongs to the new category
                                if (newSkill.name) {
                                  const skillExistsInCategory = cat.skills.some(skill => 
                                    skill.toLowerCase() === newSkill.name.toLowerCase()
                                  );
                                  if (!skillExistsInCategory) {
                                    // Clear the skill if it doesn't belong to the new category
                                    setNewSkill({ ...newSkill, category: cat.category, name: '' });
                                  } else {
                                    // Keep the skill if it belongs to the new category
                                    setNewSkill({ ...newSkill, category: cat.category });
                                  }
                                } else {
                                  setNewSkill({ ...newSkill, category: cat.category, name: '' });
                                }
                                setCategoryOpen(false);
                                setCustomSkillMode(false);
                              }}
                            >
                              {cat.category}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Skill Selection - Dropdown or Text Input */}
                  {!customSkillMode ? (
                    <Popover open={skillOpen} onOpenChange={setSkillOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={skillOpen}
                          className="w-full justify-between"
                        >
                          {newSkill.name ? newSkill.name : "Select skill"}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0">
                        <Command>
                          <CommandInput placeholder="Search skill..." />
                          <CommandList>
                            {newSkill.category ? (
                              // Show skills from selected category
                              (SKILL_CATEGORIES.find(cat => cat.category === newSkill.category)?.skills || []).map(skill => (
                                <CommandItem
                                  key={skill}
                                  value={skill}
                                  onSelect={() => {
                                    setNewSkill({ ...newSkill, name: skill });
                                    setSkillOpen(false);
                                  }}
                                >
                                  {skill}
                                </CommandItem>
                              ))
                            ) : (
                              // Show all skills from all categories
                              SKILL_CATEGORIES.flatMap(cat => 
                                cat.skills.map(skill => (
                                  <CommandItem
                                    key={`${cat.category}-${skill}`}
                                    value={skill}
                                    onSelect={() => {
                                      setNewSkill({ 
                                        ...newSkill, 
                                        name: skill,
                                        category: cat.category 
                                      });
                                      setSkillOpen(false);
                                    }}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{skill}</span>
                                      <Badge variant="secondary" className="text-xs ml-2">
                                        {cat.category}
                                      </Badge>
                                    </div>
                                  </CommandItem>
                                ))
                              )
                            )}
                            <CommandItem
                              value="custom"
                              onSelect={() => {
                                setCustomSkillMode(true);
                                setSkillOpen(false);
                              }}
                            >
                              + Type custom skill name
                            </CommandItem>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type skill name..."
                        value={newSkill.name}
                        onChange={(e) => handleCustomSkillInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCustomSkillMode(false);
                          setNewSkill({ ...newSkill, name: '' });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Level Dropdown */}
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
                  <Button 
                    onClick={addSkillToTeach} 
                    disabled={loading || !newSkill.name || !newSkill.level}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? 'Adding...' : 'Add'}
                  </Button>
                </div>
                <Input
                  placeholder="✨ Write a short summary of your experience with this skill (e.g., years of practice, projects, achievements)"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats and Activity */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed Exchanges</span>
                <span className="font-semibold">{mockCompletedExchanges.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Rating</span>
                <span className="font-semibold">{getAverageRating()}/5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skills Teaching</span>
                <span className="font-semibold">{user?.skillsToTeach?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Latest Completed Exchanges */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Exchanges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCompletedExchanges.map((exchange) => (
                  <div key={exchange.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={exchange.otherUser.avatar} />
                      <AvatarFallback className="text-xs">
                        {exchange.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{exchange.otherUser.name}</p>
                      <p className="text-xs text-muted-foreground">{exchange.skill}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < exchange.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockReceivedReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={review.reviewer.avatar} />
                        <AvatarFallback className="text-xs">
                          {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{review.reviewer.name}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">{review.skill}</Badge>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 