import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Save, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    country: user?.country || '',
    age: (user as any)?.age || '',
    gender: (user as any)?.gender || '',
    phone: (user as any)?.phone || '',
  });

  const handleSave = () => {
    // Here you would update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
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
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <Input
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
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
          <CardTitle>Skills to Teach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user?.skillsToTeach?.map((skill, index) => (
              <Badge key={index} variant="outline">
                {skill.name} - {skill.level}
              </Badge>
            )) || <p className="text-muted-foreground">No skills to teach added yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}