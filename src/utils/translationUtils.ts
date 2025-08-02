import { SKILL_TRANSLATIONS } from '../data/skills';
import { formatDistanceToNow } from 'date-fns';

/**
 * Translates skill names to Arabic if the current language is Arabic
 * @param skillName - The English skill name
 * @param currentLanguage - The current language ('en' or 'ar')
 * @returns The translated skill name or the original if no translation exists
 */
export const translateSkill = (skillName: string, currentLanguage: string): string => {
  if (currentLanguage === 'ar') {
    return SKILL_TRANSLATIONS[skillName] || skillName;
  }
  return skillName;
};

/**
 * Translates user names to Arabic transliteration if the current language is Arabic
 * This is a simple mapping for common names. In a real application, you might want
 * a more comprehensive database of name translations.
 * @param name - The English name
 * @param currentLanguage - The current language ('en' or 'ar')
 * @returns The translated name or the original if no translation exists
 */
export const translateName = (name: string, currentLanguage: string): string => {
  if (currentLanguage !== 'ar') {
    return name;
  }

  // Simple mapping for common names - in a real app, this would be a database
  const nameTranslations: { [key: string]: string } = {
    'Ahmad': 'أحمد',
    'Ahmed': 'أحمد',
    'Mohammed': 'محمد',
    'Muhammad': 'محمد',
    'Ali': 'علي',
    'Fatima': 'فاطمة',
    'Aisha': 'عائشة',
    'Hassan': 'حسن',
    'Hussein': 'حسين',
    'Omar': 'عمر',
    'Umar': 'عمر',
    'Yusuf': 'يوسف',
    'Joseph': 'يوسف',
    'Ibrahim': 'إبراهيم',
    'Abraham': 'إبراهيم',
    'Ismail': 'إسماعيل',
    'Ismael': 'إسماعيل',
    'Yasin': 'ياسين',
    'Yaseen': 'ياسين',
    'Khalid': 'خالد',
    'Zainab': 'زينب',
    'Zaynab': 'زينب',
    'Mariam': 'مريم',
    'Maryam': 'مريم',
    'Mary': 'مريم',
    'Sarah': 'سارة',
    'Sara': 'سارة',
    'Noor': 'نور',
    'Nur': 'نور',
    'Layla': 'ليلى',
    'Leila': 'ليلى',
    'Amina': 'أمينة',
    'Ameena': 'أمينة',
    'Khadija': 'خديجة',
    'Khadijah': 'خديجة',
    'Rashid': 'راشد',
    'Rashida': 'راشدة',
    'Tariq': 'طارق',
    'Tareq': 'طارق',
    'Bilal': 'بلال',
    'Malik': 'مالك',
    'Malika': 'مالكة',
    'Nadia': 'نادية',
    'Nadya': 'نادية',
    'Samir': 'سمير',
    'Samira': 'سميرة',
    'Karim': 'كريم',
    'Kareem': 'كريم',
    'Karima': 'كريمة',
    'Kareema': 'كريمة',
    'Jamal': 'جمال',
    'Jamila': 'جميلة',
    'Jameela': 'جميلة',
    'Rami': 'رامي',
    'Rania': 'رانيا',
    'Ranya': 'رانيا',
    'Waleed': 'وليد',
    'Walid': 'وليد',
    'Yara': 'يارا',
    'Yasmin': 'ياسمين',
    'Yasmine': 'ياسمين',
    'Ziad': 'زياد',
    'Ziyad': 'زياد',
    'Dalia': 'داليا',
    'Dalya': 'داليا',
    'Eman': 'إيمان',
    'Iman': 'إيمان',
    'Fadi': 'فادي',
    'Fady': 'فادي',
    'Ghada': 'غادة',
    'Hala': 'هالة',
    'Hanan': 'حنان',
    'Jana': 'جنى',
    'Janna': 'جنى'
  };

  return nameTranslations[name] || name;
};

/**
 * Converts Arabic names to English transliteration
 * This is the reverse of translateName for when we want English transliteration
 * @param name - The name (could be in Arabic or English)
 * @param targetLanguage - The target language ('en' for English transliteration)
 * @returns The English transliteration of the name
 */
export const transliterateName = (name: string, targetLanguage: string): string => {
  if (targetLanguage !== 'en') {
    return name;
  }

  // Reverse mapping for Arabic to English transliteration
  const arabicToEnglish: { [key: string]: string } = {
    'أحمد': 'Ahmad',
    'محمد': 'Mohammed',
    'علي': 'Ali',
    'فاطمة': 'Fatima',
    'عائشة': 'Aisha',
    'حسن': 'Hassan',
    'حسين': 'Hussein',
    'عمر': 'Omar',
    'يوسف': 'Yusuf',
    'إبراهيم': 'Ibrahim',
    'إسماعيل': 'Ismail',
    'ياسين': 'Yasin',
    'خالد': 'Khalid',
    'زينب': 'Zainab',
    'مريم': 'Mariam',
    'سارة': 'Sarah',
    'نور': 'Noor',
    'ليلى': 'Layla',
    'أمينة': 'Amina',
    'خديجة': 'Khadija',
    'راشد': 'Rashid',
    'راشدة': 'Rashida',
    'طارق': 'Tariq',
    'بلال': 'Bilal',
    'مالك': 'Malik',
    'مالكة': 'Malika',
    'نادية': 'Nadia',
    'سمير': 'Samir',
    'سميرة': 'Samira',
    'كريم': 'Karim',
    'كريمة': 'Karima',
    'جمال': 'Jamal',
    'جميلة': 'Jamila',
    'رامي': 'Rami',
    'رانيا': 'Rania',
    'وليد': 'Waleed',
    'يارا': 'Yara',
    'ياسمين': 'Yasmin',
    'زياد': 'Ziad',
    'داليا': 'Dalia',
    'إيمان': 'Eman',
    'فادي': 'Fadi',
    'غادة': 'Ghada',
    'هالة': 'Hala',
    'حنان': 'Hanan',
    'جنى': 'Jana'
  };

  return arabicToEnglish[name] || name;
};

/**
 * Translates exchange descriptions to Arabic if the current language is Arabic
 * @param description - The English description
 * @param currentLanguage - The current language ('en' or 'ar')
 * @returns The translated description
 */
export const translateDescription = (description: string, currentLanguage: string): string => {
  if (currentLanguage !== 'ar') {
    return description;
  }

  // Replace common English phrases with Arabic equivalents
  const descriptionTranslations: { [key: string]: string } = {
    'You teach:': 'أنت تعلم:',
    'You learn:': 'أنت تتعلم:',
    'You are mentee': 'أنت متدرب',
    'You taught:': 'لقد علمت:',
    'You learned:': 'لقد تعلمت:'
  };

  let translatedDescription = description;
  for (const [english, arabic] of Object.entries(descriptionTranslations)) {
    translatedDescription = translatedDescription.replace(new RegExp(english, 'g'), arabic);
  }

  return translatedDescription;
};

/**
 * Translates status text to Arabic if the current language is Arabic
 * @param status - The English status text
 * @param currentLanguage - The current language ('en' or 'ar')
 * @returns The translated status text or the original if no translation exists
 */
export const translateStatus = (status: string, currentLanguage: string): string => {
  if (currentLanguage !== 'ar') {
    return status;
  }

  const statusTranslations: { [key: string]: string } = {
    'active': 'نشط',
    'completed': 'مكتمل',
    'pending': 'في الانتظار',
    'paused': 'متوقف مؤقتاً',
    'cancelled': 'ملغي',
    'declined': 'مرفوض',
    'accepted': 'مقبول'
  };

  return statusTranslations[status.toLowerCase()] || status;
};

/**
 * Translates date format to Arabic if the current language is Arabic
 * This provides a simple Arabic date format since date-fns doesn't have built-in Arabic support
 * @param date - The date to format
 * @param currentLanguage - The current language ('en' or 'ar')
 * @returns The formatted date string
 */
export const translateDate = (date: Date, currentLanguage: string): string => {
  if (currentLanguage !== 'ar') {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'الآن';
  } else if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  } else if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعة`;
  } else if (diffInDays < 7) {
    return `منذ ${diffInDays} يوم`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `منذ ${weeks} أسبوع`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `منذ ${months} شهر`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `منذ ${years} سنة`;
  }
};

// Skill category translations
export const translateSkillCategory = (category: string, currentLanguage: string): string => {
  if (currentLanguage === 'ar') {
    const categoryTranslations: { [key: string]: string } = {
      "Business & Professional": "الأعمال والمهنية",
      "Crafts & DIY": "الحرف والأعمال اليدوية",
      "Culinary Arts": "الفنون الطهي",
      "Health & Wellness": "الصحة والعافية",
      "Languages": "اللغات",
      "Life Skills": "المهارات الحياتية",
      "Music & Arts": "الموسيقى والفنون",
      "Other": "أخرى",
      "Programming & Tech": "البرمجة والتقنية",
      "Sports & Recreation": "الرياضة والترفيه",
      "Writing & Communication": "الكتابة والتواصل"
    };
    return categoryTranslations[category] || category;
  }
  return category;
};

// Skill level translations
export const translateSkillLevel = (level: string, currentLanguage: string): string => {
  if (currentLanguage === 'ar') {
    const levelTranslations: { [key: string]: string } = {
      "Beginner": "مبتدئ",
      "Intermediate": "متوسط",
      "Expert": "خبير"
    };
    return levelTranslations[level] || level;
  }
  return level;
};

// Country translations
export const translateCountry = (country: string, currentLanguage: string): string => {
  if (currentLanguage === 'ar') {
    const countryTranslations: { [key: string]: string } = {
      "United States": "الولايات المتحدة الأمريكية",
      "United Kingdom": "المملكة المتحدة",
      "Canada": "كندا",
      "Australia": "أستراليا",
      "Germany": "ألمانيا",
      "France": "فرنسا",
      "Spain": "إسبانيا",
      "Italy": "إيطاليا",
      "Japan": "اليابان",
      "South Korea": "كوريا الجنوبية",
      "India": "الهند",
      "Brazil": "البرازيل",
      "United Arab Emirates": "الإمارات العربية المتحدة",
      "Saudi Arabia": "المملكة العربية السعودية",
      "Egypt": "مصر",
      "Jordan": "الأردن",
      "Lebanon": "لبنان",
      "Kuwait": "الكويت",
      "Qatar": "قطر",
      "Bahrain": "البحرين",
      "Oman": "عمان",
      "Morocco": "المغرب",
      "Tunisia": "تونس",
      "Algeria": "الجزائر",
      "Libya": "ليبيا",
      "Iraq": "العراق",
      "Syria": "سوريا",
      "Yemen": "اليمن",
      "Palestine": "فلسطين",
      "Sudan": "السودان",
      "Iran": "إيران",
      "Turkey": "تركيا",
      "Israel": "إسرائيل",
      "Cyprus": "قبرص"
    };
    return countryTranslations[country] || country;
  }
  return country;
}; 