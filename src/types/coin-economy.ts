// Coin Economy Types and Enums
export type CoinTransactionType = 
  | 'daily_login_bonus'
  | 'profile_completion'
  | 'exchange_completion'
  | 'mentor_bonus'
  | 'referral_reward'
  | 'ad_watched'
  | 'weekly_mission'
  | 'mentor_milestone'
  | 'monthly_stipend'
  | 'extra_invite_purchase'
  | 'message_invite_purchase'
  | 'learning_request_purchase'
  | 'profile_boost_purchase'
  | 'pinned_review_purchase'
  | 'skill_verification_purchase'
  | 'custom_theme_purchase'
  | 'coin_pack_purchase';

export interface CoinTransaction {
  id: string;
  userId: string;
  type: CoinTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
  metadata?: {
    streakDay?: number;
    exchangeId?: string;
    referralUserId?: string;
    adProvider?: string;
    missionId?: string;
    itemId?: string;
    coinPackId?: string;
  };
  status: 'pending' | 'completed' | 'failed';
}

export interface DailyStreak {
  userId: string;
  currentStreak: number;
  lastLoginDate: string;
  longestStreak: number;
  totalLogins: number;
  streakResetCount: number;
}

export interface ReferralTracker {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserEmail: string;
  status: 'pending' | 'first_exchange_completed' | 'rewarded';
  createdAt: Date;
  firstExchangeCompletedAt?: Date;
  rewardedAt?: Date;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  type: 'exchanges_count' | 'mentorship_sessions' | 'profile_views' | 'reviews_given';
  target: number;
  reward: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface UserMissionProgress {
  userId: string;
  missionId: string;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
  completedAt?: Date;
}

export interface AdWatchingSession {
  userId: string;
  date: string; // YYYY-MM-DD format
  watchedCount: number;
  dailyLimit: number;
  lastWatchedAt: Date;
}

export interface ProfileCompletionTracker {
  userId: string;
  completionPercentage: number;
  rewardClaimed: boolean;
  lastCalculatedAt: Date;
  completedFields: string[];
}

export interface MentorMilestone {
  userId: string;
  totalMentorExchanges: number;
  lastMilestoneReached: number; // Every 10 exchanges
  totalBonusEarned: number;
}