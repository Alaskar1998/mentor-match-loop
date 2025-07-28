import { supabase } from '@/integrations/supabase/client';
import { type Skill } from '@/data/skills';

export interface SkillValidationResult {
  isValid: boolean;
  normalizedName?: string;
  category?: string;
  error?: string;
}

export interface SkillDatabaseRecord {
  id: number;
  name: string;
  category: string;
  emoji?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Skill Service - Handles all skill-related operations
 * 
 * This service ensures:
 * - All skills are properly categorized
 * - No duplicates exist (case-insensitive)
 * - Skills are normalized (proper casing, no extra spaces)
 * - Database consistency
 */
class SkillService {
  /**
   * Validate and normalize a skill name
   */
  async validateSkill(skillName: string): Promise<SkillValidationResult> {
    if (!skillName || skillName.trim() === '') {
      return {
        isValid: false,
        error: 'Skill name cannot be empty'
      };
    }

    const normalizedName = this.normalizeSkillName(skillName);
    
    try {
      // Check if skill exists in database
      const { data, error } = await (supabase as any)
        .from('skills')
        .select('name, category')
        .ilike('name', normalizedName)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error validating skill:', error);
        return {
          isValid: false,
          error: 'Database error occurred'
        };
      }

      if (data) {
        // Skill exists, return normalized version
        return {
          isValid: true,
          normalizedName: data.name,
          category: data.category
        };
      }

      // Skill doesn't exist, but we can create it
      return {
        isValid: true,
        normalizedName: normalizedName,
        category: 'Other' // Default category for new skills
      };
    } catch (error) {
      console.error('Error validating skill:', error);
      return {
        isValid: false,
        error: 'Validation failed'
      };
    }
  }

  /**
   * Get or create a skill in the database
   */
  async getOrCreateSkill(skillName: string, category: string = 'Other'): Promise<string> {
    const normalizedName = this.normalizeSkillName(skillName);
    
    try {
      // First, try to find existing skill
      const { data: existingSkill, error: findError } = await (supabase as any)
        .from('skills')
        .select('name')
        .ilike('name', normalizedName)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding skill:', findError);
        throw new Error('Database error occurred');
      }

      if (existingSkill) {
        // Return existing skill name (preserves original casing)
        return existingSkill.name;
      }

      // Create new skill
      const { data: newSkill, error: createError } = await (supabase as any)
        .from('skills')
        .insert({
          name: normalizedName,
          category: category,
          is_active: true
        })
        .select('name')
        .single();

      if (createError) {
        console.error('Error creating skill:', createError);
        throw new Error('Failed to create skill');
      }

      return newSkill.name;
    } catch (error) {
      console.error('Error in getOrCreateSkill:', error);
      throw error;
    }
  }

  /**
   * Get all skills from database
   */
  async getAllSkills(): Promise<SkillDatabaseRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching skills:', error);
        throw new Error('Failed to fetch skills');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSkills:', error);
      throw error;
    }
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(category: string): Promise<SkillDatabaseRecord[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('skills')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching skills by category:', error);
        throw new Error('Failed to fetch skills by category');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSkillsByCategory:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('skills')
        .select('category')
        .eq('is_active', true)
        .order('category');

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }

      // Get unique categories
      const categories = [...new Set(data?.map(skill => skill.category) || [])];
      return categories.sort();
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Normalize a skill name (remove extra spaces, proper casing)
   */
  private normalizeSkillName(skillName: string): string {
    return skillName
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Validate a complete skill object
   */
  async validateSkillObject(skill: Partial<Skill>): Promise<SkillValidationResult> {
    if (!skill.name || skill.name.trim() === '') {
      return {
        isValid: false,
        error: 'Skill name is required'
      };
    }

    if (!skill.level || !['Beginner', 'Intermediate', 'Expert'].includes(skill.level)) {
      return {
        isValid: false,
        error: 'Valid skill level is required (Beginner, Intermediate, or Expert)'
      };
    }

    // Validate the skill name
    const nameValidation = await this.validateSkill(skill.name);
    if (!nameValidation.isValid) {
      return nameValidation;
    }

    return {
      isValid: true,
      normalizedName: nameValidation.normalizedName,
      category: skill.category || nameValidation.category
    };
  }
}

export const skillService = new SkillService(); 