// Dummy learning requests for testing
// This can be used to populate the database with test data

export interface DummyLearningRequest {
  skill: string;
  level: string;
  description: string;
  country: string;
  urgency: "urgent" | "soon" | "flexible";
  user_name: string;
  user_avatar: string;
  responses_count: number;
}

export const dummyLearningRequests: DummyLearningRequest[] = [
  {
    skill: "React Development",
    level: "Beginner",
    description: "I'm completely new to React and want to learn how to build modern web applications. Looking for someone patient who can explain concepts clearly and help me with hands-on projects.",
    country: "United States",
    urgency: "soon",
    user_name: "Alex Johnson",
    user_avatar: "👨‍💻",
    responses_count: 3
  },
  {
    skill: "Spanish Language",
    level: "Intermediate",
    description: "I can hold basic conversations but want to improve my fluency and learn more advanced grammar. Prefer conversational practice with some grammar explanations.",
    country: "Canada",
    urgency: "flexible",
    user_name: "Maria Garcia",
    user_avatar: "👩‍🏫",
    responses_count: 1
  },
  {
    skill: "Guitar",
    level: "Beginner",
    description: "Just bought my first guitar and need help with basic chords and strumming patterns. Looking for someone who can teach me popular songs and music theory basics.",
    country: "United Kingdom",
    urgency: "urgent",
    user_name: "Tom Wilson",
    user_avatar: "🎸",
    responses_count: 5
  },
  {
    skill: "Photography",
    level: "Intermediate",
    description: "I understand the basics but want to improve my composition skills and learn advanced techniques like long exposure and portrait photography.",
    country: "Australia",
    urgency: "soon",
    user_name: "Sarah Chen",
    user_avatar: "📸",
    responses_count: 2
  },
  {
    skill: "Cooking - Italian Cuisine",
    level: "Beginner",
    description: "Love Italian food and want to learn how to make authentic pasta dishes, sauces, and desserts. Need help with basic techniques and recipe modifications.",
    country: "Italy",
    urgency: "flexible",
    user_name: "Marco Rossi",
    user_avatar: "👨‍🍳",
    responses_count: 4
  },
  {
    skill: "Python Programming",
    level: "Intermediate",
    description: "I know Python basics but want to learn web development with Django or Flask. Also interested in data analysis and machine learning applications.",
    country: "Germany",
    urgency: "soon",
    user_name: "Anna Mueller",
    user_avatar: "🐍",
    responses_count: 0
  },
  {
    skill: "Yoga",
    level: "Beginner",
    description: "Complete beginner looking to learn yoga for stress relief and flexibility. Prefer gentle, beginner-friendly sessions with proper form guidance.",
    country: "India",
    urgency: "flexible",
    user_name: "Priya Patel",
    user_avatar: "🧘‍♀️",
    responses_count: 3
  },
  {
    skill: "Digital Art",
    level: "Intermediate",
    description: "I can draw traditionally but want to learn digital art using Procreate or Photoshop. Need help with digital techniques, layers, and creating professional artwork.",
    country: "Japan",
    urgency: "soon",
    user_name: "Yuki Tanaka",
    user_avatar: "🎨",
    responses_count: 1
  }
];

// Helper function to create a learning request object for database insertion
export const createLearningRequestData = (
  userId: string, 
  request: DummyLearningRequest
) => ({
  user_id: userId,
  skill: request.skill,
  level: request.level,
  description: request.description,
  country: request.country,
  urgency: request.urgency,
  responses_count: request.responses_count
});

// Helper function to populate database with dummy requests (for testing)
export const populateDummyRequests = async (userId: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const requestsData = dummyLearningRequests.map(request => 
      createLearningRequestData(userId, request)
    );
    
    const { data, error } = await supabase
      .from('learning_requests')
      .insert(requestsData)
      .select();
    
    if (error) {
      console.error('Error populating dummy requests:', error);
      return false;
    }
    
    console.log('Successfully populated dummy requests:', data);
    return true;
  } catch (error) {
    console.error('Error populating dummy requests:', error);
    return false;
  }
}; 