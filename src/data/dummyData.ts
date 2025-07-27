// Dummy data for testing layout and behavior
// This file contains placeholder content that can be easily removed later

export interface DummyAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  sponsoredBy: string;
}

export interface DummyProfile {
  id: string;
  name: string;
  profilePicture: string;
  isMentor: boolean;
  rating: number;
  successfulExchanges: number;
  skillLevel: "Beginner" | "Intermediate" | "Expert";
  bio: string;
  skills: string[];
  country: string;
  gender: "Male" | "Female";
  willingToTeachWithoutReturn: boolean;
  isPremium: boolean; // For testing premium vs free tier differences
}

// Dummy Ads - Placeholder sponsored content
export const dummyAds: DummyAd[] = [
  {
    id: "ad-1",
    title: "Learn Guitar Online",
    description: "Master guitar with our premium online course. 50% off this week!",
    imageUrl: "🎸 Ad Image Here",
    ctaText: "Get Started Now",
    sponsoredBy: "MusicMaster Pro"
  },
  {
    id: "ad-2", 
    title: "Premium Language App",
    description: "Speak fluently in 30 days with our AI-powered language learning app.",
    imageUrl: "🗣️ Ad Image Here",
    ctaText: "Download Free Trial",
    sponsoredBy: "LinguaFlow"
  },
  {
    id: "ad-3",
    title: "Cooking Masterclass",
    description: "Learn from world-class chefs. 100+ video lessons available.",
    imageUrl: "👨‍🍳 Ad Image Here", 
    ctaText: "Join Masterclass",
    sponsoredBy: "Culinary Academy"
  },
  {
    id: "ad-4",
    title: "Fitness Transformation",
    description: "Transform your body in 90 days with our proven workout system.",
    imageUrl: "💪 Ad Image Here",
    ctaText: "Start Transformation",
    sponsoredBy: "FitLife Pro"
  }
];

// Dummy User Profiles - Mix of Free and Premium users
export const dummyProfiles: DummyProfile[] = [
  // First 3 profiles (visible to free users)
  {
    id: "profile-1",
    name: "John Doe",
    profilePicture: "👨‍💻",
    isMentor: true,
    rating: 4.8,
    successfulExchanges: 15,
    skillLevel: "Expert",
    bio: "Experienced web developer with 8+ years in React, Node.js, and TypeScript. Love teaching and helping others grow their skills!",
    skills: ["React", "Node.js", "TypeScript", "JavaScript"],
    country: "United States",
    gender: "Male",
    willingToTeachWithoutReturn: true,
    isPremium: true
  },
  {
    id: "profile-2",
    name: "Jane Smith",
    profilePicture: "👩‍🎨",
    isMentor: false,
    rating: 4.5,
    successfulExchanges: 8,
    skillLevel: "Intermediate",
    bio: "Digital artist and graphic designer. Passionate about creating beautiful designs and learning new techniques.",
    skills: ["Photoshop", "Illustrator", "Digital Art", "UI/UX Design"],
    country: "Canada",
    gender: "Female",
    willingToTeachWithoutReturn: false,
    isPremium: false
  },
  {
    id: "profile-3",
    name: "Mike Johnson",
    profilePicture: "👨‍🍳",
    isMentor: true,
    rating: 4.9,
    successfulExchanges: 22,
    skillLevel: "Expert",
    bio: "Professional chef with 12 years of experience. Specialize in Italian and French cuisine. Happy to share cooking secrets!",
    skills: ["Italian Cooking", "French Cuisine", "Baking", "Food Photography"],
    country: "Italy",
    gender: "Male",
    willingToTeachWithoutReturn: true,
    isPremium: true
  },
  
  // Additional profiles (blurred for free users)
  {
    id: "profile-4",
    name: "Sarah Wilson",
    profilePicture: "👩‍🏫",
    isMentor: true,
    rating: 4.7,
    successfulExchanges: 18,
    skillLevel: "Expert",
    bio: "English teacher with 10+ years experience. Help students improve their speaking, writing, and comprehension skills.",
    skills: ["English", "Grammar", "Creative Writing", "Public Speaking"],
    country: "United Kingdom",
    gender: "Female",
    willingToTeachWithoutReturn: true,
    isPremium: true
  },
  {
    id: "profile-5",
    name: "Carlos Rodriguez",
    profilePicture: "👨‍🎵",
    isMentor: false,
    rating: 4.3,
    successfulExchanges: 6,
    skillLevel: "Intermediate",
    bio: "Guitarist and music producer. Love teaching guitar basics and music theory to beginners.",
    skills: ["Guitar", "Music Theory", "Music Production", "Songwriting"],
    country: "Spain",
    gender: "Male",
    willingToTeachWithoutReturn: false,
    isPremium: false
  },
  {
    id: "profile-6",
    name: "Emma Davis",
    profilePicture: "👩‍💼",
    isMentor: true,
    rating: 4.6,
    successfulExchanges: 12,
    skillLevel: "Expert",
    bio: "Business consultant and entrepreneur. Help startups and small businesses grow and succeed.",
    skills: ["Business Strategy", "Marketing", "Financial Planning", "Leadership"],
    country: "Australia",
    gender: "Female",
    willingToTeachWithoutReturn: true,
    isPremium: true
  },
  {
    id: "profile-7",
    name: "David Kim",
    profilePicture: "👨‍🔬",
    isMentor: false,
    rating: 4.4,
    successfulExchanges: 9,
    skillLevel: "Intermediate",
    bio: "Data scientist and machine learning enthusiast. Passionate about teaching Python and data analysis.",
    skills: ["Python", "Machine Learning", "Data Analysis", "Statistics"],
    country: "South Korea",
    gender: "Male",
    willingToTeachWithoutReturn: false,
    isPremium: false
  },
  {
    id: "profile-8",
    name: "Lisa Chen",
    profilePicture: "👩‍🎭",
    isMentor: true,
    rating: 4.8,
    successfulExchanges: 16,
    skillLevel: "Expert",
    bio: "Acting coach and theater director. Help aspiring actors develop their skills and confidence.",
    skills: ["Acting", "Voice Training", "Stage Direction", "Script Analysis"],
    country: "China",
    gender: "Female",
    willingToTeachWithoutReturn: true,
    isPremium: true
  },
  {
    id: "profile-9",
    name: "Alex Thompson",
    profilePicture: "👨‍🏃‍♂️",
    isMentor: false,
    rating: 4.2,
    successfulExchanges: 5,
    skillLevel: "Beginner",
    bio: "Fitness enthusiast learning about nutrition and workout planning. Happy to teach basic running techniques!",
    skills: ["Running", "Basic Fitness", "Motivation", "Nutrition"],
    country: "Canada",
    gender: "Male",
    willingToTeachWithoutReturn: false,
    isPremium: false
  },
  {
    id: "profile-10",
    name: "Maria Garcia",
    profilePicture: "👩‍🎨",
    isMentor: true,
    rating: 4.9,
    successfulExchanges: 20,
    skillLevel: "Expert",
    bio: "Professional painter and art instructor. Specialize in oil painting and watercolor techniques.",
    skills: ["Oil Painting", "Watercolor", "Art History", "Color Theory"],
    country: "Mexico",
    gender: "Female",
    willingToTeachWithoutReturn: true,
    isPremium: true
  }
];

// Helper function to get random ad
export const getRandomAd = (): DummyAd => {
  const randomIndex = Math.floor(Math.random() * dummyAds.length);
  return dummyAds[randomIndex];
};

// Helper function to get random ads (for multiple ad placements)
export const getRandomAds = (count: number): DummyAd[] => {
  const shuffled = [...dummyAds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to clear dummy data (for easy removal later)
export const clearDummyData = () => {
  console.log('Dummy data cleared - ready for production');
  // This function can be used to remove dummy data when going to production
}; 