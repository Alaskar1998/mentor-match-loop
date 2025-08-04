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

export interface DatabaseSkill {
  name: string;
  count: number;
  category?: string;
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
        logger.error('Error validating skill:', error);
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
      logger.error('Error validating skill:', error);
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
        logger.error('Error finding skill:', findError);
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
        logger.error('Error creating skill:', createError);
        throw new Error('Failed to create skill');
      }

      return newSkill.name;
    } catch (error) {
      logger.error('Error in getOrCreateSkill:', error);
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
        logger.error('Error fetching skills:', error);
        throw new Error('Failed to fetch skills');
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getAllSkills:', error);
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
        logger.error('Error fetching skills by category:', error);
        throw new Error('Failed to fetch skills by category');
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getSkillsByCategory:', error);
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
        logger.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }

      // Get unique categories
      const categories = [...new Set(data?.map(skill => skill.category) || [])];
      return categories.sort();
    } catch (error) {
      logger.error('Error in getCategories:', error);
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

export const getPopularSkillsFromDatabase = async (limit: number = 20): Promise<DatabaseSkill[]> => {
  try {
    logger.debug('Fetching popular skills from database...');
    
    // Query to get skills that actually exist in user profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('skills_to_teach')
      .not('skills_to_teach', 'is', null)
      .neq('skills_to_teach', '[]');

    if (error) {
      logger.error('Error fetching skills from database:', error);
      return getDefaultPopularSkills(limit);
    }

    logger.debug('Raw profiles data:', data);
    logger.debug('Number of profiles with skills:', data?.length || 0);

    // Count occurrences of each skill
    const skillCounts: { [key: string]: number } = {};
    
    data?.forEach(profile => {
      logger.debug('Profile skills_to_teach:', profile.skills_to_teach);
      
      if (profile.skills_to_teach) {
        // Handle jsonb format - could be array of strings or array of objects
        let skills: string[] = [];
        
        if (Array.isArray(profile.skills_to_teach)) {
          // If it's an array, extract skill names
          skills = profile.skills_to_teach.map((skill: any) => {
            if (typeof skill === 'string') {
              return skill;
            } else if (skill && typeof skill === 'object' && skill.name) {
              return skill.name;
            } else if (skill && typeof skill === 'object' && skill.skill) {
              return skill.skill;
            }
            return null;
          }).filter(Boolean);
        }
        
        // Count each skill
        skills.forEach((skillName: string) => {
          if (skillName && typeof skillName === 'string') {
            const normalizedSkillName = skillName.trim();
            if (normalizedSkillName) {
              skillCounts[normalizedSkillName] = (skillCounts[normalizedSkillName] || 0) + 1;
            }
          }
        });
      }
    });

    logger.debug('Skill counts:', skillCounts);

    // Convert to array and sort by count (most popular first)
    const popularSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    logger.debug('Popular skills found:', popularSkills);

    // If no skills found in database, return empty array (no mock data)
    if (popularSkills.length === 0) {
      logger.debug('No skills found in database, returning empty array');
      return [];
    }

    // Add category information for each skill
    const skillsWithCategory = popularSkills.map(skill => ({
      ...skill,
      category: findCategoryForSkill(skill.name)
    }));

    logger.debug('Final skills with categories:', skillsWithCategory);
    return skillsWithCategory;
  } catch (error) {
    logger.error('Error in getPopularSkillsFromDatabase:', error);
    return []; // Return empty array instead of mock data
  }
};

// Mock data function removed - only real database data is used

// Helper function to find category for a skill (import from skills.ts)
import { logger } from '@/utils/logger';
const findCategoryForSkill = (skillName: string): string => {
  const normalizedSkillName = skillName.toLowerCase().trim();
  
  const SKILL_CATEGORIES = [
    {
      category: "Business & Professional",
      skills: [
        "Marketing", "Public Speaking", "Entrepreneurship", "Finance", "Accounting", 
        "Project Management", "Sales", "Negotiation", "Leadership", "Business Strategy",
        "Digital Marketing", "SEO", "Content Marketing", "Social Media Marketing",
        "Financial Planning", "Investment", "Stock Trading", "Real Estate", "Consulting",
        "Human Resources", "Operations Management", "Supply Chain Management"
      ]
    },
    {
      category: "Crafts & DIY",
      skills: [
        "Knitting", "Sewing", "Woodworking", "Pottery", "Origami", "Jewelry Making", 
        "Scrapbooking", "Candle Making", "Soap Making", "Gardening", "Beekeeping",
        "Carpentry", "Metalworking", "Leather Crafting", "Glass Blowing", "Weaving",
        "Embroidery", "Cross-stitch", "Quilting", "Macrame", "Paper Crafting"
      ]
    },
    {
      category: "Culinary Arts",
      skills: [
        "Baking", "Cooking", "Nutrition", "Vegan Cooking", "Grilling", "Pastry", 
        "Meal Prep", "Food Photography", "Wine Tasting", "Bartending", "Coffee Making",
        "Sushi Making", "Bread Making", "Cake Decorating", "Chocolate Making",
        "Fermentation", "Canning", "Food Safety", "Menu Planning", "Catering"
      ]
    },
    {
      category: "Health & Wellness",
      skills: [
        "Yoga", "Fitness", "Swimming", "Meditation", "Pilates", "Running", "Cycling", 
        "Personal Training", "Nutrition", "Weight Training", "Cardio", "Stretching",
        "Mindfulness", "Stress Management", "Mental Health", "First Aid", "CPR",
        "Physical Therapy", "Massage Therapy", "Acupuncture", "Herbal Medicine"
      ]
    },
    {
      category: "Languages",
      skills: [
        "English", "Spanish", "French", "German", "Mandarin", "Arabic", "Russian", 
        "Japanese", "Korean", "Italian", "Portuguese", "Hindi", "Turkish", "Dutch", 
        "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian",
        "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino"
      ]
    },
    {
      category: "Life Skills",
      skills: [
        "Time Management", "Productivity", "Mindfulness", "Parenting", "Self Defense", 
        "Financial Planning", "Budgeting", "Tax Preparation", "Home Maintenance",
        "Car Maintenance", "Cooking Basics", "Cleaning", "Organization", "Planning",
        "Communication", "Conflict Resolution", "Networking", "Public Speaking",
        "Writing", "Reading", "Critical Thinking", "Problem Solving"
      ]
    },
    {
      category: "Music & Arts",
      skills: [
        "Guitar", "Piano", "Singing", "Drums", "Violin", "Bass", "Saxophone", 
        "Trumpet", "Flute", "Clarinet", "Cello", "Ukulele", "Harmonica", "DJing", 
        "Music Production", "Composition", "Music Theory", "Drawing", "Painting", 
        "Graphic Design", "Photography", "Illustration", "Animation", "3D Modeling", 
        "Digital Art", "Sculpture", "Fashion Design", "Interior Design"
      ]
    },
    {
      category: "Programming & Tech",
      skills: [
        "Python", "JavaScript", "Java", "C++", "C#", "TypeScript", "Go", "Rust", 
        "PHP", "Ruby", "Swift", "Kotlin", "SQL", "HTML", "CSS", "React", "Vue.js", 
        "Angular", "Node.js", "Django", "Flask", "Spring", "Laravel", "Express.js",
        "Web Development", "Mobile Development", "DevOps", "Machine Learning", 
        "Artificial Intelligence", "Data Science", "Cloud Computing", "Cybersecurity",
        "Blockchain", "UI/UX Design", "Game Development", "IoT", "AR/VR"
      ]
    },
    {
      category: "Science & Education",
      skills: [
        "Mathematics", "Physics", "Chemistry", "Biology", "Statistics", "Data Analysis",
        "Robotics", "Astronomy", "Geology", "Psychology", "Sociology", "History",
        "Geography", "Economics", "Philosophy", "Literature", "Linguistics",
        "Computer Science", "Engineering", "Architecture", "Medicine", "Nursing"
      ]
    },
    {
      category: "Sports & Recreation",
      skills: [
        "Soccer", "Basketball", "Tennis", "Martial Arts", "Golf", "Baseball", 
        "Table Tennis", "Volleyball", "Chess", "Swimming", "Rock Climbing", "Hiking",
        "Skiing", "Snowboarding", "Surfing", "Skateboarding", "Dancing", "Gymnastics",
        "Boxing", "Wrestling", "Archery", "Fishing", "Hunting", "Camping"
      ]
    },
    {
      category: "Travel & Culture",
      skills: [
        "Travel Planning", "Cultural Awareness", "History", "Geography", "World Cuisine",
        "Photography", "Videography", "Language Learning", "Cultural Exchange",
        "Tourism", "Hospitality", "Event Planning", "International Relations",
        "Cultural Studies", "Anthropology", "Archaeology", "Museum Studies"
      ]
    },
    {
      category: "Writing & Communication",
      skills: [
        "Creative Writing", "Copywriting", "Blogging", "Editing", "Storytelling", 
        "Resume Writing", "Speech Writing", "Technical Writing", "Journalism",
        "Content Creation", "Social Media", "Email Writing", "Grant Writing",
        "Translation", "Interpretation", "Public Relations", "Advertising"
      ]
    }
  ];

  for (const category of SKILL_CATEGORIES) {
    const foundSkill = category.skills.find(skill => 
      skill.toLowerCase() === normalizedSkillName
    );
    if (foundSkill) {
      return category.category;
    }
  }
  return 'Other';
};

// Helper function to get emoji for category
export const getCategoryEmoji = (category: string): string => {
  const categoryEmojis: { [key: string]: string } = {
    "Business & Professional": "💼",
    "Crafts & DIY": "🛠️",
    "Culinary Arts": "🍳",
    "Health & Wellness": "🧘",
    "Languages": "🗣️",
    "Life Skills": "🎯",
    "Music & Arts": "🎵",
    "Programming & Tech": "💻",
    "Science & Education": "🔬",
    "Sports & Recreation": "⚽",
    "Travel & Culture": "✈️",
    "Writing & Communication": "✍️",
    "Other": "📝"
  };
  
  return categoryEmojis[category] || "📝";
}; 