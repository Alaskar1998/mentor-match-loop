// Future Phase: Enhanced Communication Types
export interface EnhancedMessage {
  id: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'video_call' | 'attachment' | 'system';
  content: string;
  
  // Voice Message Extensions
  voiceData?: {
    audioUrl: string;
    duration: number;
    waveform?: number[];
    transcription?: string;
  };
  
  // Video Call Extensions
  callData?: {
    callId: string;
    duration: number;
    participants: string[];
    recordingUrl?: string;
    callType: 'audio' | 'video';
    status: 'initiated' | 'ongoing' | 'ended' | 'missed';
  };
  
  // Attachment Extensions
  attachmentData?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
  };
  
  // Message status and metadata
  status: 'sending' | 'sent' | 'delivered' | 'read';
  editedAt?: Date;
  replyTo?: string;
}

// Future Phase: Advanced Mentor Tier System
export interface MentorTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  requirements: {
    minExchanges: number;
    minRating: number;
    minMentorshipSessions: number;
    specialCriteria?: string[];
  };
  benefits: {
    badgeDesign: string;
    priorityMatching: boolean;
    exclusiveEvents: boolean;
    enhancedProfile: boolean;
    customization: string[];
  };
}

export const MENTOR_TIERS: MentorTier[] = [
  {
    id: 'basic_mentor',
    name: '🌟 Mentor',
    icon: '🌟',
    color: '#fbbf24',
    requirements: {
      minExchanges: 0,
      minRating: 0,
      minMentorshipSessions: 0
    },
    benefits: {
      badgeDesign: 'basic',
      priorityMatching: false,
      exclusiveEvents: false,
      enhancedProfile: false,
      customization: []
    }
  },
  {
    id: 'silver_mentor',
    name: '🥈 Silver Mentor',
    icon: '🥈',
    color: '#c0c0c0',
    requirements: {
      minExchanges: 10,
      minRating: 4.5,
      minMentorshipSessions: 5
    },
    benefits: {
      badgeDesign: 'silver',
      priorityMatching: true,
      exclusiveEvents: false,
      enhancedProfile: true,
      customization: ['border_color', 'background_pattern']
    }
  },
  {
    id: 'gold_mentor',
    name: '🏅 Gold Mentor',
    icon: '🏅',
    color: '#ffd700',
    requirements: {
      minExchanges: 50,
      minRating: 4.8,
      minMentorshipSessions: 25,
      specialCriteria: ['verified_skills', 'community_recognition']
    },
    benefits: {
      badgeDesign: 'gold',
      priorityMatching: true,
      exclusiveEvents: true,
      enhancedProfile: true,
      customization: ['full_theme', 'animated_badge', 'custom_colors']
    }
  },
  {
    id: 'platinum_mentor',
    name: '🏆 Platinum Mentor',
    icon: '🏆',
    color: '#e5e4e2',
    requirements: {
      minExchanges: 100,
      minRating: 4.9,
      minMentorshipSessions: 50,
      specialCriteria: ['expert_verification', 'teaching_certification', 'community_leadership']
    },
    benefits: {
      badgeDesign: 'platinum',
      priorityMatching: true,
      exclusiveEvents: true,
      enhancedProfile: true,
      customization: ['full_suite', 'video_intro', 'premium_effects']
    }
  }
];

// Future Phase: Events & Workshops System
export interface Workshop {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    profilePicture: string;
    mentorTier: string;
  };
  schedule: {
    startTime: Date;
    endTime: Date;
    timeZone: string;
    recurringPattern?: 'weekly' | 'monthly' | 'none';
  };
  access: {
    tierRequired: 'free' | 'premium' | 'gold_mentor' | 'platinum_mentor';
    maxParticipants: number;
    currentParticipants: number;
    waitingList: number;
  };
  content: {
    skillCategory: string;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    prerequisites: string[];
    materials: string[];
    recordingAvailable: boolean;
  };
  pricing: {
    type: 'free' | 'premium_included' | 'coin_cost' | 'paid';
    cost: number;
    currency: 'USD' | 'coins';
  };
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  tags: string[];
}

// Future Phase: Communication Provider Interface
export interface CommunicationProvider {
  // Voice Messages
  recordVoiceMessage(): Promise<Blob>;
  playVoiceMessage(audioUrl: string): Promise<void>;
  transcribeVoice(audioBlob: Blob): Promise<string>;
  
  // Video/Audio Calls
  initiateCall(participantIds: string[], type: 'audio' | 'video'): Promise<string>;
  joinCall(callId: string): Promise<void>;
  endCall(callId: string): Promise<void>;
  
  // File Attachments
  uploadAttachment(file: File): Promise<{ url: string; thumbnailUrl?: string }>;
  downloadAttachment(url: string): Promise<Blob>;
  
  // Real-time Features
  sendTypingIndicator(chatId: string): void;
  markMessageAsRead(messageId: string): Promise<void>;
}

// Future Phase: User Extensions
export interface UserExtensions {
  // Advanced Mentor Data
  mentorTier?: string;
  mentorSince?: Date;
  specializations?: string[];
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    dateEarned: Date;
    verificationUrl?: string;
  }>;
  
  // Communication Preferences
  communicationSettings?: {
    voiceMessagesEnabled: boolean;
    videoCallsEnabled: boolean;
    availableHours: Array<{
      day: string;
      startTime: string;
      endTime: string;
      timeZone: string;
    }>;
    preferredCallType: 'audio' | 'video' | 'either';
  };
  
  // Workshop & Events
  workshopHistory?: string[];
  upcomingWorkshops?: string[];
  instructorProfile?: {
    isInstructor: boolean;
    bio: string;
    teachingStyle: string;
    approvedTopics: string[];
  };
}

// Future Phase: Analytics & Insights
export interface AdvancedAnalytics {
  // User Engagement
  communicationMetrics: {
    voiceMessagesSent: number;
    videoCallsInitiated: number;
    averageResponseTime: number;
    preferredCommunicationMethod: string;
  };
  
  // Learning Outcomes
  learningProgress: {
    skillsImproved: string[];
    completionRates: Record<string, number>;
    feedbackScores: Record<string, number>;
  };
  
  // Community Impact
  mentorshipImpact: {
    studentsHelped: number;
    knowledgeShared: string[];
    communityContributions: number;
  };
}