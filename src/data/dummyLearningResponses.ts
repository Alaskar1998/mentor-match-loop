// Dummy learning responses for testing
// This can be used to populate the database with test response data

export interface DummyLearningResponse {
  id: string;
  learning_request_id: string;
  responder: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    isVerified: boolean;
  };
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  skill: string; // The skill from the original learning request
}

export const dummyLearningResponses: DummyLearningResponse[] = [
  {
    id: "response-1",
    learning_request_id: "request-1",
    responder: {
      id: "user-1",
      name: "Sarah Johnson",
      avatar: "👩‍💻",
      rating: 4.8,
      isVerified: true
    },
    message: "Hi! I'm an experienced React developer with 5+ years of experience. I'd love to help you learn React! I can start with the basics and gradually move to more advanced concepts. I'm patient and good at explaining complex topics in simple terms. When would you like to start?",
    status: "pending",
    created_at: "2024-01-15T10:30:00Z",
    skill: "React Development"
  },
  {
    id: "response-2",
    learning_request_id: "request-1",
    responder: {
      id: "user-2",
      name: "Mike Chen",
      avatar: "👨‍💼",
      rating: 4.6,
      isVerified: true
    },
    message: "Hello! I'm a senior frontend developer who specializes in React and modern JavaScript. I've helped many beginners get started with React. I can provide hands-on coding sessions and real-world project examples. Let me know if you're interested!",
    status: "pending",
    created_at: "2024-01-15T14:20:00Z",
    skill: "React Development"
  },
  {
    id: "response-3",
    learning_request_id: "request-2",
    responder: {
      id: "user-3",
      name: "Maria Garcia",
      avatar: "👩‍🏫",
      rating: 4.9,
      isVerified: true
    },
    message: "¡Hola! Soy profesora de español con 8 años de experiencia. Me encantaría ayudarte a mejorar tu español. Podemos practicar conversación y también revisar gramática avanzada. ¿Te gustaría empezar con sesiones de 30 minutos?",
    status: "pending",
    created_at: "2024-01-16T09:15:00Z",
    skill: "Spanish Language"
  },
  {
    id: "response-4",
    learning_request_id: "request-3",
    responder: {
      id: "user-4",
      name: "Tom Wilson",
      avatar: "🎸",
      rating: 4.7,
      isVerified: false
    },
    message: "Hey there! I'm a guitar teacher with 10 years of experience. I can help you with basic chords, strumming patterns, and popular songs. I'm very patient with beginners and love teaching music theory in a fun way. Let's start with some easy songs!",
    status: "pending",
    created_at: "2024-01-16T16:45:00Z",
    skill: "Guitar"
  },
  {
    id: "response-5",
    learning_request_id: "request-4",
    responder: {
      id: "user-5",
      name: "Emma Davis",
      avatar: "📸",
      rating: 4.5,
      isVerified: true
    },
    message: "Hi! I'm a professional photographer who loves teaching. I can help you with composition, lighting, and advanced techniques. I have experience with both portrait and landscape photography. We can start with the basics and work our way up!",
    status: "pending",
    created_at: "2024-01-17T11:30:00Z",
    skill: "Photography"
  },
  {
    id: "response-6",
    learning_request_id: "request-5",
    responder: {
      id: "user-6",
      name: "Marco Rossi",
      avatar: "👨‍🍳",
      rating: 4.8,
      isVerified: true
    },
    message: "Ciao! Sono uno chef italiano con 15 anni di esperienza. Posso insegnarti a cucinare piatti autentici italiani. Inizieremo con le basi e poi passeremo a ricette più complesse. Ti mostrerò anche i segreti della cucina italiana!",
    status: "pending",
    created_at: "2024-01-17T13:20:00Z",
    skill: "Cooking - Italian Cuisine"
  }
];

// Helper function to create a learning response object for database insertion
export const createLearningResponseData = (
  learningRequestId: string,
  responderId: string,
  message: string
) => ({
  learning_request_id: learningRequestId,
  responder_id: responderId,
  message: message,
  status: 'pending'
});

// Helper function to populate database with dummy responses (for testing)
// Note: This will work once the learning_responses table is created in the database
export const populateDummyResponses = async (learningRequestIds: string[], responderIds: string[]) => {
  console.log('Dummy responses population - requires learning_responses table to be created first');
  console.log('Learning request IDs:', learningRequestIds);
  console.log('Responder IDs:', responderIds);
  
  // TODO: Uncomment when learning_responses table is available
  /*
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const responsesData = dummyLearningResponses.map((response, index) => ({
      learning_request_id: learningRequestIds[index % learningRequestIds.length],
      responder_id: responderIds[index % responderIds.length],
      message: response.message,
      status: 'pending'
    }));
    
    const { data, error } = await supabase
      .from('learning_responses')
      .insert(responsesData)
      .select();
    
    if (error) {
      console.error('Error populating dummy responses:', error);
      return false;
    }
    
    console.log('Successfully populated dummy responses:', data);
    return true;
  } catch (error) {
    console.error('Error populating dummy responses:', error);
    return false;
  }
  */
  
  return true; // Return true for now since we're using mock data
}; 