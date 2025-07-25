import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Skills() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newSkillToTeach, setNewSkillToTeach] = useState({ name: '', level: '', description: '' });
  const [newSkillToLearn, setNewSkillToLearn] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkillToTeach = async () => {
    if (newSkillToTeach.name && newSkillToTeach.level && user) {
      setLoading(true);
      try {
        // Get current skills
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
        const newSkill = {
          name: newSkillToTeach.name,
          level: newSkillToTeach.level,
          description: newSkillToTeach.description
        };

        // Add new skill to the array
        const updatedSkills = [...currentSkills, newSkill];

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
          setNewSkillToTeach({ name: '', level: '', description: '' });
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

  const addSkillToLearn = async () => {
    if (newSkillToLearn && user) {
      setLoading(true);
      try {
        // Get current skills
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('skills_to_learn')
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

        const currentSkills = Array.isArray(profile?.skills_to_learn) ? profile.skills_to_learn : [];
        const updatedSkills = [...currentSkills, newSkillToLearn];

        const { error } = await supabase
          .from('profiles')
          .update({ skills_to_learn: updatedSkills })
          .eq('id', user.id);

        if (error) {
          console.error('Error adding skill:', error);
          toast({
            title: "Error",
            description: "Failed to add skill to learn",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Skill to learn added successfully!"
          });
          setNewSkillToLearn('');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Skills to Teach */}
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
                <Button variant="ghost" size="sm">
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
                value={newSkillToTeach.name}
                onChange={(e) => setNewSkillToTeach({...newSkillToTeach, name: e.target.value})}
              />
              <Select 
                value={newSkillToTeach.level} 
                onValueChange={(value) => setNewSkillToTeach({...newSkillToTeach, level: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addSkillToTeach} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newSkillToTeach.description}
              onChange={(e) => setNewSkillToTeach({...newSkillToTeach, description: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills to Learn */}
      <Card>
        <CardHeader>
          <CardTitle>Skills I Want to Learn</CardTitle>
          <p className="text-muted-foreground">Skills you're interested in learning from others</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current skills */}
          <div className="flex flex-wrap gap-2">
            {user?.skillsToLearn?.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="secondary">{skill}</Badge>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )) || <p className="text-muted-foreground">No skills to learn added yet.</p>}
          </div>

          {/* Add new skill */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-medium">Add New Skill</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Skill you want to learn"
                value={newSkillToLearn}
                onChange={(e) => setNewSkillToLearn(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addSkillToLearn} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}