import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, Sparkles, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  SKILL_CATEGORIES, 
  SKILL_LEVELS, 
  findCategoryForSkill, 
  getCategoryEmoji,
  type Skill 
} from '@/data/skills';
import { skillService } from '@/services/skillService';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { translateSkillCategory, translateSkillLevel, translateSkill } from '@/utils/translationUtils';

interface SkillInputComponentProps {
  onAddSkill: (skill: Skill) => void;
  onCancel?: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  showCategoryFirst?: boolean;
  allowCustomSkills?: boolean;
  className?: string;
  compact?: boolean; // For signup flow
  skipDatabase?: boolean; // If true, do not call skillService DB methods
}

export const SkillInputComponent: React.FC<SkillInputComponentProps> = ({
  onAddSkill,
  onCancel,
  disabled = false,
  loading = false,
  title = "Add New Skill",
  showCategoryFirst = true,
  allowCustomSkills = true,
  className = "",
  compact = false,
  skipDatabase = false
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [skill, setSkill] = useState<Partial<Skill>>({
    name: "",
    level: "",
    description: "",
    category: ""
  });
  
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [customSkillMode, setCustomSkillMode] = useState(false);
  const [validating, setValidating] = useState(false);

  // Function to handle custom skill input
  const handleCustomSkillInput = (skillName: string) => {
    // Auto-detect category based on skill name
    const category = findCategoryForSkill(skillName) || 'Other';
    
    setSkill({ 
      ...skill, 
      name: skillName,
      category: category
    });
  };

  const handleAddSkill = async () => {
    if (!skill.name || !skill.level) {
      toast({
        title: t('actions.validationError'),
        description: t('pages.profile.fillSkillNameAndLevel'),
        variant: "destructive"
      });
      return;
    }

    setValidating(true);
    try {
      // If skipDatabase, do only local validation and skip DB
      if (skipDatabase) {
        const finalCategory = skill.category || findCategoryForSkill(skill.name) || 'Other';
        const newSkill: Skill = {
          name: skill.name,
          level: skill.level,
          description: skill.description || "",
          category: finalCategory
        };
        onAddSkill(newSkill);
        setSkill({ name: "", level: "", description: "", category: "" });
        setCustomSkillMode(false);
        toast({
          title: t('actions.success'),
          description: t('pages.profile.skillAddedSuccessfully')
        });
        return;
      }
      // Auto-detect category if not set
      const finalCategory = skill.category || findCategoryForSkill(skill.name) || 'Other';
      
      // Validate the skill using the service
      const validation = await skillService.validateSkillObject({
        ...skill,
        category: finalCategory
      });
      
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.error || "Invalid skill data",
          variant: "destructive"
        });
        return;
      }

      let normalizedSkillName = skill.name;
      if (!skipDatabase) {
        // Get or create the skill in the database
        normalizedSkillName = await skillService.getOrCreateSkill(
          skill.name, 
          finalCategory
        );
      }

      const newSkill: Skill = {
        name: normalizedSkillName,
        level: skill.level,
        description: skill.description || "",
        category: finalCategory
      };
      
      onAddSkill(newSkill);
      
      // Reset form
      setSkill({ name: "", level: "", description: "", category: "" });
      setCustomSkillMode(false);
      
      toast({
        title: "Success",
        description: "Skill added successfully!"
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const isFormValid = skill.name && skill.level;

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Category Dropdown */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className="w-full justify-between h-10 text-sm"
              disabled={disabled}
            >
              {skill.category ? (
                <span className="flex items-center gap-1 min-w-0">
                  <span className="text-sm flex-shrink-0">{getCategoryEmoji(skill.category)}</span>
                                          <span className="truncate text-sm">{translateSkillCategory(skill.category, language)}</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{t('pages.profile.category')}</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
                             <CommandInput placeholder={t('pages.profile.searchCategory')} className="h-9 text-sm" />
               <CommandList>
                 <CommandEmpty>{t('pages.profile.noCategoryFound')}</CommandEmpty>
                <CommandGroup>
                  {SKILL_CATEGORIES
                    .sort((a, b) => a.category.localeCompare(b.category))
                    .map(cat => (
                    <CommandItem
                      key={cat.category}
                      value={cat.category}
                      onSelect={() => {
                        setSkill({ ...skill, category: cat.category });
                        setCategoryOpen(false);
                      }}
                      className="text-sm"
                    >
                                             <span className="flex items-center gap-2">
                         <span>{cat.emoji}</span>
                         <span>{translateSkillCategory(cat.category, language)}</span>
                       </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Skill Selection */}
        {!customSkillMode ? (
          <Popover open={skillOpen} onOpenChange={setSkillOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={skillOpen}
                className="w-full justify-between h-10 text-sm"
                disabled={disabled}
              >
                {skill.name ? (
                                           <span className="truncate text-sm">{translateSkill(skill.name, language)}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">{t('pages.profile.skill')}</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
              <Command>
                <CommandInput placeholder={t('pages.profile.searchSkill')} className="h-9 text-sm" />
                <CommandList>
                  <CommandEmpty>{t('pages.profile.noSkillFound')}</CommandEmpty>
                  <CommandGroup>
                    {skill.category ? (
                      // Show skills from selected category
                      (SKILL_CATEGORIES.find(cat => cat.category === skill.category)?.skills || [])
                        .sort((a, b) => a.localeCompare(b))
                        .map(s => (
                        <CommandItem
                          key={s}
                          value={s}
                          onSelect={() => {
                            setSkill({ ...skill, name: s });
                            setSkillOpen(false);
                          }}
                          className="text-sm"
                                                 >
                           {translateSkill(s, language)}
                         </CommandItem>
                      ))
                    ) : (
                      // Show all skills from all categories
                      SKILL_CATEGORIES.flatMap(cat => 
                        cat.skills.map(s => ({
                          skill: s,
                          category: cat.category
                        }))
                      )
                      .sort((a, b) => a.skill.localeCompare(b.skill))
                      .map(({ skill: s, category: cat }) => (
                        <CommandItem
                          key={`${cat}-${s}`}
                          value={s}
                          onSelect={() => {
                            setSkill({ 
                              ...skill, 
                              name: s,
                              category: cat 
                            });
                            setSkillOpen(false);
                          }}
                          className="text-sm"
                        >
                                                     <div className="flex items-center justify-between w-full">
                             <span>{translateSkill(s, language)}</span>
                             <Badge variant="secondary" className="text-xs ml-2">
                               {translateSkillCategory(cat, language)}
                             </Badge>
                           </div>
                        </CommandItem>
                      ))
                    )}
                    {allowCustomSkills && (
                      <CommandItem
                        value="custom"
                        onSelect={() => {
                          setCustomSkillMode(true);
                          setSkillOpen(false);
                        }}
                        className="text-sm"
                      >
                        + {t('pages.profile.typeCustomSkillName')}
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder={t('pages.profile.typeSkillName')}
              value={skill.name}
              onChange={(e) => handleCustomSkillInput(e.target.value)}
              className="flex-1 h-10 text-sm"
              disabled={disabled}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomSkillMode(false);
                setSkill({ ...skill, name: '' });
              }}
              disabled={disabled}
              className="h-10 px-3"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Level Dropdown */}
        <Select 
          value={skill.level} 
          onValueChange={(value) => setSkill({...skill, level: value})}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder={t('pages.profile.level')} />
          </SelectTrigger>
          <SelectContent>
                         {SKILL_LEVELS.map(level => (
               <SelectItem key={level} value={level} className="text-sm">{translateSkillLevel(level, language)}</SelectItem>
             ))}
          </SelectContent>
        </Select>

        {/* Add Button */}
        <Button 
          onClick={handleAddSkill} 
          disabled={disabled || loading || validating || !isFormValid}
          className="h-10 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {loading || validating ? t('actions.adding') : t('actions.add')}
        </Button>
      </div>

      {/* Experience Summary */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          {t('pages.profile.writeExperienceSummary')}
        </Label>
        <Textarea
                      placeholder={t('pages.profile.experiencePlaceholder')}
          value={skill.description}
          onChange={(e) => setSkill({...skill, description: e.target.value})}
          className="resize-none text-sm"
          rows={3}
          disabled={disabled}
        />
      </div>

      {/* Cancel Button (if provided) */}
      {onCancel && (
        <div className="flex justify-end">
                      <Button variant="outline" onClick={onCancel} disabled={disabled} className="text-xs">
              {t('actions.cancel')}
            </Button>
        </div>
      )}
    </div>
  );
}; 