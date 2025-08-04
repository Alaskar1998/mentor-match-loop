import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

export interface ExchangeData {
  id: string;
  student_name: string;
  mentor_name: string;
  skill: string;
  status: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface LatestExchange {
  id: string;
  student: string;
  mentor: string;
  skill: string;
  action: string;
  rating: number;
  avatar: string;
  mentorBadge: string;
  created_at: string;
}

export const getLatestExchanges = async (limit: number = 10, isArabic: boolean = false): Promise<LatestExchange[]> => {
  try {
    logger.debug('Fetching latest exchanges...');
    
    // Use a simpler query without foreign key relationships
    const { data, error } = await supabase
      .from('exchange_contracts')
      .select(`
        id,
        chat_id,
        user1_id,
        user2_id,
        user1_skill,
        user2_skill,
        user1_agreed,
        user2_agreed,
        user1_finished,
        user2_finished,
        finished_at,
        created_at,
        updated_at
      `)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching exchanges:', error);
      return getDefaultExchanges(limit, isArabic);
    }

    logger.debug('Raw exchange data:', data);

    if (!data || data.length === 0) {
      logger.debug('No completed exchanges found, using default data');
      return getDefaultExchanges(limit, isArabic);
    }

    // Transform the data into the expected format
    const exchanges: LatestExchange[] = data.map((exchange, index) => {
      // Determine which skill was taught (usually the non-"Nothing" skill)
      const user1Skill = exchange.user1_skill;
      const user2Skill = exchange.user2_skill;
      const skill = user1Skill !== "Nothing" ? user1Skill : user2Skill;
      
      // Get category emoji for the skill
      const category = findCategoryForSkill(skill);
      const avatar = getCategoryEmoji(category);
      
      return {
        id: exchange.id,
        student: getArabicNameForLanguage(isArabic), // Use language-appropriate names
        mentor: getArabicNameForLanguage(isArabic), // Use language-appropriate names
        skill: skill,
        action: getRandomAction(),
        rating: getRandomRating(),
        avatar: avatar,
        mentorBadge: "🌟",
        created_at: exchange.finished_at || exchange.updated_at || exchange.created_at
      };
    });

    logger.debug('Transformed exchanges:', exchanges);
    return exchanges;
  } catch (error) {
    logger.error('Error in getLatestExchanges:', error);
    return getDefaultExchanges(limit, isArabic);
  }
};

export const getExchangeCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('exchange_contracts')
      .select('*', { count: 'exact', head: true })
      .not('finished_at', 'is', null);

    if (error) {
      logger.error('Error fetching exchange count:', error);
      return 3248; // Default fallback
    }

    return count || 3248;
  } catch (error) {
    logger.error('Error in getExchangeCount:', error);
    return 3248;
  }
};

// Helper function to get random Arabic names (transliterated in English)
const getRandomArabicName = (): string => {
  const arabicNames = [
    "أحمد", "علي", "محمد", "فاطمة", "عائشة", "خديجة", "عمر", "عثمان", "عبدالله", "عبدالرحمن",
    "يوسف", "إبراهيم", "إسماعيل", "حسن", "حسين", "زينب", "مريم", "نور", "سارة", "ليلى",
    "نورا", "رنا", "سلمى", "دينا", "هند", "نورين", "ريم", "سارة", "فاطمة", "عائشة",
    "عبدالعزيز", "عبدالملك", "عبدالرحيم", "عبدالغني", "عبدالوهاب", "عبدالسلام", "عبدالفتاح", "عبداللطيف"
  ];
  return arabicNames[Math.floor(Math.random() * arabicNames.length)];
};

const getRandomEnglishArabicName = (): string => {
  const englishArabicNames = [
    "Ahmed", "Ali", "Mohammed", "Fatima", "Aisha", "Khadija", "Omar", "Othman", "Abdullah", "Abdulrahman",
    "Yusuf", "Ibrahim", "Ismail", "Hassan", "Hussein", "Zainab", "Maryam", "Noor", "Sara", "Layla",
    "Nora", "Rana", "Salma", "Dina", "Hind", "Noreen", "Reem", "Sara", "Fatima", "Aisha",
    "Abdulaziz", "Abdulmalik", "Abdulrahim", "Abdulghani", "Abdulwahab", "Abdulsalam", "Abdulfattah", "Abdullatif"
  ];
  return englishArabicNames[Math.floor(Math.random() * englishArabicNames.length)];
};

// Helper function to get Arabic name based on current language
const getArabicNameForLanguage = (isArabic: boolean = false): string => {
  return isArabic ? getRandomArabicName() : getRandomEnglishArabicName();
};

// Helper function to get default exchanges when database is empty
const getDefaultExchanges = (limit: number = 10, isArabic: boolean = false): LatestExchange[] => {
  const defaultExchanges = [
    {
      id: "1",
      student: isArabic ? "أحمد" : "Ahmed",
      mentor: isArabic ? "علي" : "Ali",
      skill: "Guitar",
      action: "learned",
      rating: 5,
      avatar: "🎸",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      student: isArabic ? "فاطمة" : "Fatima",
      mentor: isArabic ? "محمد" : "Mohammed",
      skill: "Photoshop",
      action: "mastered",
      rating: 5,
      avatar: "🎨",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      student: isArabic ? "عمر" : "Omar",
      mentor: isArabic ? "عائشة" : "Aisha",
      skill: "Cooking",
      action: "learned",
      rating: 5,
      avatar: "🍳",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      student: isArabic ? "خديجة" : "Khadija",
      mentor: isArabic ? "عبدالله" : "Abdullah",
      skill: "JavaScript",
      action: "mastered",
      rating: 5,
      avatar: "💻",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "5",
      student: isArabic ? "يوسف" : "Yusuf",
      mentor: isArabic ? "عبدالرحمن" : "Abdulrahman",
      skill: "Photography",
      action: "learned",
      rating: 5,
      avatar: "📷",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "6",
      student: isArabic ? "إبراهيم" : "Ibrahim",
      mentor: isArabic ? "حسن" : "Hassan",
      skill: "Python",
      action: "mastered",
      rating: 4,
      avatar: "💻",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "7",
      student: isArabic ? "زينب" : "Zainab",
      mentor: isArabic ? "حسين" : "Hussein",
      skill: "Yoga",
      action: "learned",
      rating: 5,
      avatar: "🧘",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    },
    {
      id: "8",
      student: isArabic ? "مريم" : "Maryam",
      mentor: isArabic ? "نور" : "Noor",
      skill: "Spanish",
      action: "mastered",
      rating: 4,
      avatar: "🗣️",
      mentorBadge: "🌟",
      created_at: new Date().toISOString()
    }
  ];

  return defaultExchanges.slice(0, limit);
};

// Helper function to get random action
const getRandomAction = (): string => {
  const actions = ["learned", "mastered", "practiced", "explored"];
  return actions[Math.floor(Math.random() * actions.length)];
};

// Helper function to get random rating
const getRandomRating = (): number => {
  // 80% chance of 5 stars, 15% chance of 4 stars, 5% chance of 3 stars
  const random = Math.random();
  if (random < 0.8) return 5;
  if (random < 0.95) return 4;
  return 3;
};

// Helper function to find category for a skill
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
const getCategoryEmoji = (category: string): string => {
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