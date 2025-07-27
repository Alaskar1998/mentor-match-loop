/**
 * CENTRALIZED SKILLS DATA
 * 
 * This is the SINGLE SOURCE OF TRUTH for all skills and categories across the entire website.
 * 
 * IMPORTANT: All components must import skills from this file only.
 * Do not create duplicate skill lists in other files.
 * 
 * To add new skills or categories:
 * 1. Add them to this file
 * 2. All components will automatically get the updates
 * 3. No other files need to be modified
 */

export interface SkillCategory {
  category: string;
  skills: string[];
  emoji?: string;
  description?: string;
}

export interface Skill {
  name: string;
  level: string;
  description: string;
  category?: string;
}

// Master skills and categories data
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Programming & Tech",
    skills: [
      "Python", "JavaScript", "Java", "C++", "C#", "TypeScript", "Go", "Rust", 
      "PHP", "Ruby", "Swift", "Kotlin", "SQL", "HTML", "CSS", "React", "Vue.js", 
      "Angular", "Node.js", "Django", "Flask", "Spring", "Laravel", "Express.js",
      "Web Development", "Mobile Development", "DevOps", "Machine Learning", 
      "Artificial Intelligence", "Data Science", "Cloud Computing", "Cybersecurity",
      "Blockchain", "UI/UX Design", "Game Development", "IoT", "AR/VR"
    ],
    emoji: "💻",
    description: "Programming languages, frameworks, and technology skills"
  },
  {
    category: "Languages",
    skills: [
      "English", "Spanish", "French", "German", "Mandarin", "Arabic", "Russian", 
      "Japanese", "Korean", "Italian", "Portuguese", "Hindi", "Turkish", "Dutch", 
      "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian",
      "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino"
    ],
    emoji: "🗣️",
    description: "Spoken and written languages"
  },
  {
    category: "Music & Arts",
    skills: [
      "Guitar", "Piano", "Singing", "Drums", "Violin", "Bass", "Saxophone", 
      "Trumpet", "Flute", "Clarinet", "Cello", "Ukulele", "Harmonica", "DJing", 
      "Music Production", "Composition", "Music Theory", "Drawing", "Painting", 
      "Graphic Design", "Photography", "Illustration", "Animation", "3D Modeling", 
      "Digital Art", "Sculpture", "Fashion Design", "Interior Design"
    ],
    emoji: "🎵",
    description: "Musical instruments, performance, and visual arts"
  },
  {
    category: "Business & Professional",
    skills: [
      "Marketing", "Public Speaking", "Entrepreneurship", "Finance", "Accounting", 
      "Project Management", "Sales", "Negotiation", "Leadership", "Business Strategy",
      "Digital Marketing", "SEO", "Content Marketing", "Social Media Marketing",
      "Financial Planning", "Investment", "Stock Trading", "Real Estate", "Consulting",
      "Human Resources", "Operations Management", "Supply Chain Management"
    ],
    emoji: "💼",
    description: "Business, management, and professional development skills"
  },
  {
    category: "Health & Wellness",
    skills: [
      "Yoga", "Fitness", "Swimming", "Meditation", "Pilates", "Running", "Cycling", 
      "Personal Training", "Nutrition", "Weight Training", "Cardio", "Stretching",
      "Mindfulness", "Stress Management", "Mental Health", "First Aid", "CPR",
      "Physical Therapy", "Massage Therapy", "Acupuncture", "Herbal Medicine"
    ],
    emoji: "🧘",
    description: "Physical fitness, mental health, and wellness practices"
  },
  {
    category: "Culinary Arts",
    skills: [
      "Baking", "Cooking", "Nutrition", "Vegan Cooking", "Grilling", "Pastry", 
      "Meal Prep", "Food Photography", "Wine Tasting", "Bartending", "Coffee Making",
      "Sushi Making", "Bread Making", "Cake Decorating", "Chocolate Making",
      "Fermentation", "Canning", "Food Safety", "Menu Planning", "Catering"
    ],
    emoji: "🍳",
    description: "Cooking, baking, and food preparation skills"
  },
  {
    category: "Science & Education",
    skills: [
      "Mathematics", "Physics", "Chemistry", "Biology", "Statistics", "Data Analysis",
      "Robotics", "Astronomy", "Geology", "Psychology", "Sociology", "History",
      "Geography", "Economics", "Philosophy", "Literature", "Linguistics",
      "Computer Science", "Engineering", "Architecture", "Medicine", "Nursing"
    ],
    emoji: "🔬",
    description: "Academic subjects and scientific disciplines"
  },
  {
    category: "Crafts & DIY",
    skills: [
      "Knitting", "Sewing", "Woodworking", "Pottery", "Origami", "Jewelry Making", 
      "Scrapbooking", "Candle Making", "Soap Making", "Gardening", "Beekeeping",
      "Carpentry", "Metalworking", "Leather Crafting", "Glass Blowing", "Weaving",
      "Embroidery", "Cross-stitch", "Quilting", "Macrame", "Paper Crafting"
    ],
    emoji: "🛠️",
    description: "Handcrafts, DIY projects, and creative hobbies"
  },
  {
    category: "Sports & Recreation",
    skills: [
      "Soccer", "Basketball", "Tennis", "Martial Arts", "Golf", "Baseball", 
      "Table Tennis", "Volleyball", "Chess", "Swimming", "Rock Climbing", "Hiking",
      "Skiing", "Snowboarding", "Surfing", "Skateboarding", "Dancing", "Gymnastics",
      "Boxing", "Wrestling", "Archery", "Fishing", "Hunting", "Camping"
    ],
    emoji: "⚽",
    description: "Sports, outdoor activities, and recreational pursuits"
  },
  {
    category: "Life Skills",
    skills: [
      "Time Management", "Productivity", "Mindfulness", "Parenting", "Self Defense", 
      "Financial Planning", "Budgeting", "Tax Preparation", "Home Maintenance",
      "Car Maintenance", "Cooking Basics", "Cleaning", "Organization", "Planning",
      "Communication", "Conflict Resolution", "Networking", "Public Speaking",
      "Writing", "Reading", "Critical Thinking", "Problem Solving"
    ],
    emoji: "🎯",
    description: "Essential life skills and personal development"
  },
  {
    category: "Writing & Communication",
    skills: [
      "Creative Writing", "Copywriting", "Blogging", "Editing", "Storytelling", 
      "Resume Writing", "Speech Writing", "Technical Writing", "Journalism",
      "Content Creation", "Social Media", "Email Writing", "Grant Writing",
      "Translation", "Interpretation", "Public Relations", "Advertising"
    ],
    emoji: "✍️",
    description: "Writing, communication, and content creation"
  },
  {
    category: "Travel & Culture",
    skills: [
      "Travel Planning", "Cultural Awareness", "History", "Geography", "World Cuisine",
      "Photography", "Videography", "Language Learning", "Cultural Exchange",
      "Tourism", "Hospitality", "Event Planning", "International Relations",
      "Cultural Studies", "Anthropology", "Archaeology", "Museum Studies"
    ],
    emoji: "✈️",
    description: "Travel, cultural understanding, and global perspectives"
  },
  {
    category: "Other",
    skills: [],
    emoji: "📝",
    description: "Custom skills that don't fit other categories"
  }
];

// Helper functions for working with skills data
export const getAllSkills = (): string[] => {
  return SKILL_CATEGORIES.flatMap(category => category.skills);
};

export const getSkillsByCategory = (category: string): string[] => {
  const foundCategory = SKILL_CATEGORIES.find(cat => cat.category === category);
  return foundCategory ? foundCategory.skills : [];
};

export const findCategoryForSkill = (skillName: string): string => {
  const normalizedSkillName = skillName.toLowerCase().trim();
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

export const getCategoryEmoji = (category: string): string => {
  const foundCategory = SKILL_CATEGORIES.find(cat => cat.category === category);
  return foundCategory?.emoji || '📝';
};

export const getCategoryDescription = (category: string): string => {
  const foundCategory = SKILL_CATEGORIES.find(cat => cat.category === category);
  return foundCategory?.description || 'Custom category';
};

// Popular skills for the homepage (subset of all skills)
export const POPULAR_SKILLS = [
  { emoji: "🎸", name: "Guitar", category: "Music & Arts" },
  { emoji: "🍳", name: "Cooking", category: "Culinary Arts" },
  { emoji: "💻", name: "Programming", category: "Programming & Tech" },
  { emoji: "🎨", name: "Design", category: "Music & Arts" },
  { emoji: "📷", name: "Photography", category: "Music & Arts" },
  { emoji: "🎯", name: "Marketing", category: "Business & Professional" },
  { emoji: "🧑‍🏫", name: "Public Speaking", category: "Business & Professional" },
  { emoji: "📝", name: "Writing", category: "Writing & Communication" },
  { emoji: "🗣️", name: "Language Learning", category: "Languages" },
  { emoji: "🎹", name: "Piano", category: "Music & Arts" },
  { emoji: "🏊", name: "Swimming", category: "Health & Wellness" },
  { emoji: "🏋️", name: "Fitness", category: "Health & Wellness" },
  { emoji: "🎭", name: "Acting", category: "Music & Arts" },
  { emoji: "🎤", name: "Singing", category: "Music & Arts" },
  { emoji: "🧘", name: "Yoga", category: "Health & Wellness" },
  { emoji: "📊", name: "Data Analysis", category: "Science & Education" },
  { emoji: "🧑‍💻", name: "Web Development", category: "Programming & Tech" },
  { emoji: "📚", name: "Tutoring", category: "Science & Education" },
  { emoji: "🧑‍🍳", name: "Baking", category: "Culinary Arts" },
  { emoji: "🎮", name: "Game Development", category: "Programming & Tech" }
];

// Skill levels (consistent across all components)
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"];

// Export the main data for backward compatibility
export default SKILL_CATEGORIES; 