/**
 * CENTRALIZED SKILLS DATA
 * 
 * This is the SINGLE SOURCE OF TRUTH for all skills and categories across the entire website.
 * 
 * IMPORTANT: All components must import skills from this file only.
import { logger } from '@/utils/logger';
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

// Arabic translations for skills
export const SKILL_TRANSLATIONS: { [key: string]: string } = {
  // Business & Professional
  "Marketing": "التسويق",
  "Public Speaking": "التحدث أمام الجمهور",
  "Entrepreneurship": "ريادة الأعمال",
  "Finance": "التمويل",
  "Accounting": "المحاسبة",
  "Project Management": "إدارة المشاريع",
  "Sales": "المبيعات",
  "Negotiation": "التفاوض",
  "Leadership": "القيادة",
  "Business Strategy": "الاستراتيجية التجارية",
  "Digital Marketing": "التسويق الرقمي",
  "SEO": "تحسين محركات البحث",
  "Content Marketing": "تسويق المحتوى",
  "Social Media Marketing": "تسويق وسائل التواصل الاجتماعي",
  "Financial Planning": "التخطيط المالي",
  "Investment": "الاستثمار",
  "Stock Trading": "تداول الأسهم",
  "Real Estate": "العقارات",
  "Consulting": "الاستشارات",
  "Human Resources": "الموارد البشرية",
  "Operations Management": "إدارة العمليات",
  "Supply Chain Management": "إدارة سلسلة التوريد",

  // Crafts & DIY
  "Knitting": "الحياكة",
  "Sewing": "الخياطة",
  "Woodworking": "النجارة",
  "Pottery": "الفخار",
  "Origami": "الأوريغامي",
  "Jewelry Making": "صناعة المجوهرات",
  "Scrapbooking": "ألبوم القصاصات",
  "Candle Making": "صناعة الشموع",
  "Soap Making": "صناعة الصابون",
  "Gardening": "البستنة",
  "Beekeeping": "تربية النحل",
  "Carpentry": "النجارة",
  "Metalworking": "تشغيل المعادن",
  "Leather Crafting": "صناعة الجلود",
  "Glass Blowing": "نفخ الزجاج",
  "Weaving": "النسيج",
  "Embroidery": "التطريز",
  "Cross-stitch": "التطريز المتقاطع",
  "Quilting": "خياطة اللحف",
  "Macrame": "المكرامية",
  "Paper Crafting": "الحرف الورقية",

  // Culinary Arts
  "Baking": "الخبز",
  "Cooking": "الطبخ",
  "Nutrition": "التغذية",
  "Vegan Cooking": "الطبخ النباتي",
  "Grilling": "الشواء",
  "Pastry": "الحلويات",
  "Meal Prep": "تحضير الوجبات",
  "Food Photography": "تصوير الطعام",
  "Wine Tasting": "تذوق النبيذ",
  "Bartending": "البارتندينج",
  "Coffee Making": "صناعة القهوة",
  "Sushi Making": "صناعة السوشي",
  "Bread Making": "صناعة الخبز",
  "Cake Decorating": "تزيين الكيك",
  "Chocolate Making": "صناعة الشوكولاتة",
  "Fermentation": "التخمير",
  "Canning": "التعليب",
  "Food Safety": "سلامة الغذاء",
  "Menu Planning": "تخطيط القوائم",
  "Catering": "خدمة الطعام",

  // Health & Wellness
  "Yoga": "اليوغا",
  "Fitness": "اللياقة البدنية",
  "Swimming": "السباحة",
  "Meditation": "التأمل",
  "Pilates": "البيلاتس",
  "Running": "الجري",
  "Cycling": "ركوب الدراجات",
  "Personal Training": "التدريب الشخصي",
  "Weight Training": "تدريب الأوزان",
  "Cardio": "التمارين القلبية",
  "Stretching": "التمدد",
  "Mindfulness": "اليقظة الذهنية",
  "Stress Management": "إدارة التوتر",
  "Mental Health": "الصحة النفسية",
  "First Aid": "الإسعافات الأولية",
  "CPR": "الإنعاش القلبي الرئوي",
  "Physical Therapy": "العلاج الطبيعي",
  "Massage Therapy": "العلاج بالتدليك",
  "Acupuncture": "الوخز بالإبر",
  "Herbal Medicine": "الطب العشبي",

  // Languages
  "English": "الإنجليزية",
  "Spanish": "الإسبانية",
  "French": "الفرنسية",
  "German": "الألمانية",
  "Mandarin": "الماندرين",
  "Arabic": "العربية",
  "Russian": "الروسية",
  "Japanese": "اليابانية",
  "Korean": "الكورية",
  "Italian": "الإيطالية",
  "Portuguese": "البرتغالية",
  "Hindi": "الهندية",
  "Turkish": "التركية",
  "Dutch": "الهولندية",
  "Swedish": "السويدية",
  "Norwegian": "النرويجية",
  "Danish": "الدنماركية",
  "Finnish": "الفنلندية",
  "Polish": "البولندية",
  "Czech": "التشيكية",
  "Hungarian": "المجرية",
  "Greek": "اليونانية",
  "Hebrew": "العبرية",
  "Thai": "التايلاندية",
  "Vietnamese": "الفيتنامية",
  "Indonesian": "الإندونيسية",
  "Malay": "الملايو",
  "Filipino": "الفلبينية",

  // Life Skills
  "Time Management": "إدارة الوقت",
  "Productivity": "الإنتاجية",
  "Parenting": "الأبوة والأمومة",
  "Self Defense": "الدفاع عن النفس",
  "Budgeting": "إعداد الميزانية",
  "Tax Preparation": "إعداد الضرائب",
  "Home Maintenance": "صيانة المنزل",
  "Car Maintenance": "صيانة السيارات",
  "Cooking Basics": "أساسيات الطبخ",
  "Cleaning": "التنظيف",
  "Organization": "التنظيم",
  "Planning": "التخطيط",
  "Communication": "التواصل",
  "Conflict Resolution": "حل النزاعات",
  "Networking": "التواصل المهني",
  "Writing": "الكتابة",
  "Reading": "القراءة",
  "Critical Thinking": "التفكير النقدي",
  "Problem Solving": "حل المشكلات",

  // Music & Arts
  "Guitar": "الجيتار",
  "Piano": "البيانو",
  "Singing": "الغناء",
  "Drums": "الطبول",
  "Violin": "الكمان",
  "Bass": "الباس",
  "Saxophone": "الساكسفون",
  "Trumpet": "البوق",
  "Flute": "الناي",
  "Clarinet": "الكلارينيت",
  "Cello": "التشيلو",
  "Ukulele": "اليوكيليلي",
  "Harmonica": "الهارمونيكا",
  "DJing": "الدي جي",
  "Music Production": "إنتاج الموسيقى",
  "Composition": "التأليف الموسيقي",
  "Music Theory": "النظرية الموسيقية",
  "Drawing": "الرسم",
  "Painting": "الرسم الزيتي",
  "Graphic Design": "التصميم الجرافيكي",
  "Photography": "التصوير الفوتوغرافي",
  "Illustration": "الرسم التوضيحي",
  "Animation": "الرسوم المتحركة",
  "3D Modeling": "النمذجة ثلاثية الأبعاد",
  "Digital Art": "الفن الرقمي",
  "Sculpture": "النحت",
  "Fashion Design": "تصميم الأزياء",
  "Interior Design": "التصميم الداخلي",

  // Programming & Tech
  "Python": "بايثون",
  "JavaScript": "جافاسكريبت",
  "Java": "جافا",
  "C++": "سي بلس بلس",
  "C#": "سي شارب",
  "TypeScript": "تايب سكريبت",
  "Go": "جو",
  "Rust": "رست",
  "PHP": "بي إتش بي",
  "Ruby": "روبي",
  "Swift": "سويفت",
  "Kotlin": "كوتلين",
  "SQL": "إس كيو إل",
  "HTML": "إتش تي إم إل",
  "CSS": "سي إس إس",
  "React": "رياكت",
  "Vue.js": "فيو جي إس",
  "Angular": "أنجولار",
  "Node.js": "نود جي إس",
  "Django": "جانغو",
  "Flask": "فلاسك",
  "Spring": "سبرينج",
  "Laravel": "لارافيل",
  "Express.js": "إكسبريس جي إس",
  "Web Development": "تطوير الويب",
  "Mobile Development": "تطوير التطبيقات",
  "DevOps": "ديف أوبس",
  "Machine Learning": "التعلم الآلي",
  "Artificial Intelligence": "الذكاء الاصطناعي",
  "Data Science": "علم البيانات",
  "Cloud Computing": "الحوسبة السحابية",
  "Cybersecurity": "الأمن السيبراني",
  "Blockchain": "البلوك تشين",
  "UI/UX Design": "تصميم واجهة المستخدم",
  "Game Development": "تطوير الألعاب",
  "IoT": "إنترنت الأشياء",
  "AR/VR": "الواقع المعزز والافتراضي",

  // Science & Education
  "Mathematics": "الرياضيات",
  "Physics": "الفيزياء",
  "Chemistry": "الكيمياء",
  "Biology": "الأحياء",
  "Statistics": "الإحصاء",
  "Data Analysis": "تحليل البيانات",
  "Robotics": "الروبوتات",
  "Astronomy": "علم الفلك",
  "Geology": "الجيولوجيا",
  "Psychology": "علم النفس",
  "Sociology": "علم الاجتماع",
  "History": "التاريخ",
  "Geography": "الجغرافيا",
  "Economics": "الاقتصاد",
  "Philosophy": "الفلسفة",
  "Literature": "الأدب",
  "Linguistics": "اللسانيات",
  "Computer Science": "علوم الحاسوب",
  "Engineering": "الهندسة",
  "Architecture": "العمارة",
  "Medicine": "الطب",
  "Nursing": "التمريض",

  // Sports & Recreation
  "Soccer": "كرة القدم",
  "Basketball": "كرة السلة",
  "Tennis": "التنس",
  "Martial Arts": "الرياضات القتالية",
  "Golf": "الجولف",
  "Baseball": "البيسبول",
  "Table Tennis": "تنس الطاولة",
  "Volleyball": "الكرة الطائرة",
  "Chess": "الشطرنج",
  "Rock Climbing": "تسلق الصخور",
  "Hiking": "المشي لمسافات طويلة",
  "Skiing": "التزلج",
  "Snowboarding": "التزلج على الجليد",
  "Surfing": "ركوب الأمواج",
  "Skateboarding": "التزلج على اللوح",
  "Dancing": "الرقص",
  "Gymnastics": "الجمباز",
  "Boxing": "الملاكمة",
  "Wrestling": "المصارعة",
  "Archery": "الرماية",
  "Fishing": "الصيد",
  "Hunting": "الصيد البري",
  "Camping": "التخييم",

  // Travel & Culture
  "Travel Planning": "تخطيط السفر",
  "Cultural Awareness": "الوعي الثقافي",
  "World Cuisine": "المأكولات العالمية",
  "Videography": "التصوير السينمائي",
  "Language Learning": "تعلم اللغات",
  "Cultural Exchange": "التبادل الثقافي",
  "Tourism": "السياحة",
  "Hospitality": "الضيافة",
  "Event Planning": "تخطيط الفعاليات",
  "International Relations": "العلاقات الدولية",
  "Cultural Studies": "الدراسات الثقافية",
  "Anthropology": "علم الإنسان",
  "Archaeology": "علم الآثار",
  "Museum Studies": "دراسات المتاحف",

  // Writing & Communication
  "Creative Writing": "الكتابة الإبداعية",
  "Copywriting": "كتابة الإعلانات",
  "Blogging": "التدوين",
  "Editing": "التحرير",
  "Storytelling": "سرد القصص",
  "Resume Writing": "كتابة السيرة الذاتية",
  "Speech Writing": "كتابة الخطب",
  "Technical Writing": "الكتابة التقنية",
  "Journalism": "الصحافة",
  "Content Creation": "إنشاء المحتوى",
  "Social Media": "وسائل التواصل الاجتماعي",
  "Email Writing": "كتابة البريد الإلكتروني",
  "Grant Writing": "كتابة المنح",
  "Translation": "الترجمة",
  "Interpretation": "التفسير",
  "Public Relations": "العلاقات العامة",
  "Advertising": "الإعلان",

  // Categories
  "Business & Professional": "الأعمال والمهن",
  "Crafts & DIY": "الحرف والأعمال اليدوية",
  "Culinary Arts": "الفنون الطهي",
  "Health & Wellness": "الصحة والعافية",
  "Languages": "اللغات",
  "Life Skills": "مهارات الحياة",
  "Music & Arts": "الموسيقى والفنون",
  "Other": "أخرى",
  "Programming & Tech": "البرمجة والتكنولوجيا",
  "Science & Education": "العلوم والتعليم",
  "Sports & Recreation": "الرياضة والترفيه",
  "Travel & Culture": "السفر والثقافة",
  "Writing & Communication": "الكتابة والتواصل"
};

// Master skills and categories data
export const SKILL_CATEGORIES: SkillCategory[] = [
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
    category: "Other",
    skills: [],
    emoji: "📝",
    description: "Custom skills that don't fit other categories"
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
    ],
    emoji: "💻",
    description: "Programming languages, frameworks, and technology skills"
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
    category: "Writing & Communication",
    skills: [
      "Creative Writing", "Copywriting", "Blogging", "Editing", "Storytelling", 
      "Resume Writing", "Speech Writing", "Technical Writing", "Journalism",
      "Content Creation", "Social Media", "Email Writing", "Grant Writing",
      "Translation", "Interpretation", "Public Relations", "Advertising"
    ],
    emoji: "✍️",
    description: "Writing, communication, and content creation"
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

// Helper functions for bilingual search
export const getSkillTranslation = (skillName: string): string => {
  return SKILL_TRANSLATIONS[skillName] || skillName;
};

export const findSkillByTranslation = (arabicSkillName: string): string | null => {
  const normalizedArabicName = arabicSkillName.toLowerCase().trim();
  for (const [englishSkill, arabicTranslation] of Object.entries(SKILL_TRANSLATIONS)) {
    if (arabicTranslation.toLowerCase() === normalizedArabicName) {
      return englishSkill;
    }
  }
  return null;
};

export const searchSkillsBilingual = (query: string): string[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const results: string[] = [];
  
  // console.log('searchSkillsBilingual: Searching for query:', query, 'normalized:', normalizedQuery);
  
  // Search in English skills
  for (const skill of getAllSkills()) {
    if (skill.toLowerCase().includes(normalizedQuery)) {
      results.push(skill);
      // console.log('searchSkillsBilingual: Found English match:', skill);
    }
  }
  
  // Search in Arabic translations
  for (const [englishSkill, arabicTranslation] of Object.entries(SKILL_TRANSLATIONS)) {
    if (arabicTranslation.toLowerCase().includes(normalizedQuery)) {
      if (!results.includes(englishSkill)) {
        results.push(englishSkill);
        // console.log('searchSkillsBilingual: Found Arabic match:', arabicTranslation, '->', englishSkill);
      }
    }
  }
  
  // console.log('searchSkillsBilingual: Final results:', results);
  return results;
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