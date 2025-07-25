import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'achievement' | 'mentor' | 'special';
  earnedAt?: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  expiresAt?: Date;
}

interface GamificationState {
  appCoins: number;
  loginStreak: number;
  lastLoginDate: string | null;
  profileCompletion: number;
  badges: Badge[];
  totalExchanges: number;
  dailyAdsWatched: number;
  challenges: Challenge[];
}

interface GamificationContextType {
  state: GamificationState;
  earnCoins: (amount: number, source: string) => void;
  spendCoins: (amount: number, item: string) => boolean;
  checkDailyLogin: () => void;
  awardBadge: (badgeId: string) => void;
  updateProfileCompletion: () => void;
  watchAd: () => void;
  completeExchange: (isMentor: boolean) => void;
  purchaseCoins: (pack: string) => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
};

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'mentor',
    name: '🌟 Mentor',
    icon: '🌟',
    description: 'Willing to teach without expecting something in return',
    type: 'mentor'
  },
  {
    id: 'teacher-of-month',
    name: 'Teacher of the Month',
    icon: '🏆',
    description: 'Top-rated teacher this month',
    type: 'achievement'
  },
  {
    id: 'most-helpful',
    name: 'Most Helpful',
    icon: '🤝',
    description: 'Received highest helpfulness ratings',
    type: 'achievement'
  },
  {
    id: 'profile-complete',
    name: 'Profile Master',
    icon: '✅',
    description: 'Completed 100% of profile',
    type: 'achievement'
  },
  {
    id: 'streak-warrior',
    name: 'Streak Warrior',
    icon: '🔥',
    description: '7-day login streak achieved',
    type: 'achievement'
  }
];

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<GamificationState>({
    appCoins: 0,
    loginStreak: 0,
    lastLoginDate: null,
    profileCompletion: 0,
    badges: [],
    totalExchanges: 0,
    dailyAdsWatched: 0,
    challenges: [
      {
        id: 'weekly-exchanges',
        title: 'Weekly Exchange Challenge',
        description: 'Complete 3 exchanges this week',
        reward: 100,
        progress: 0,
        target: 3,
        isCompleted: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // Load user gamification data
  useEffect(() => {
    if (user) {
      const savedState = localStorage.getItem(`gamification_${user.id}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setState({
          ...parsed,
          badges: parsed.badges.map((b: any) => ({
            ...b,
            earnedAt: b.earnedAt ? new Date(b.earnedAt) : undefined
          }))
        });
      } else {
        // Initialize with user's current coins
        setState(prev => ({
          ...prev,
          appCoins: user.appCoins || 0
        }));
      }
    }
  }, [user]);

  // Save state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`gamification_${user.id}`, JSON.stringify(state));
      // Sync coins with user profile
      if (user.appCoins !== state.appCoins) {
        updateUser({ appCoins: state.appCoins });
      }
    }
  }, [state, user, updateUser]);

  const earnCoins = (amount: number, source: string) => {
    setState(prev => ({
      ...prev,
      appCoins: prev.appCoins + amount
    }));
    
    toast({
      title: `+${amount} coins earned!`,
      description: `From: ${source}`,
    });
  };

  const spendCoins = (amount: number, item: string): boolean => {
    if (state.appCoins >= amount) {
      setState(prev => ({
        ...prev,
        appCoins: prev.appCoins - amount
      }));
      
      toast({
        title: `${amount} coins spent`,
        description: `On: ${item}`,
      });
      return true;
    } else {
      toast({
        title: "Insufficient coins",
        description: `You need ${amount - state.appCoins} more coins.`,
        variant: "destructive"
      });
      return false;
    }
  };

  const checkDailyLogin = () => {
    const today = new Date().toDateString();
    const lastLogin = state.lastLoginDate;
    
    if (lastLogin !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const isConsecutive = lastLogin === yesterday;
      
      const newStreak = isConsecutive ? state.loginStreak + 1 : 1;
      const bonus = Math.min(5 + (newStreak - 1) * 5, 30); // 5 to 30 coins
      
      setState(prev => ({
        ...prev,
        loginStreak: newStreak,
        lastLoginDate: today
      }));
      
      earnCoins(bonus, `Day ${newStreak} login bonus`);
      
      // Award streak badge at 7 days
      if (newStreak === 7) {
        awardBadge('streak-warrior');
      }
    }
  };

  const awardBadge = (badgeId: string) => {
    const badge = DEFAULT_BADGES.find(b => b.id === badgeId);
    const alreadyHas = state.badges.some(b => b.id === badgeId);
    
    if (badge && !alreadyHas) {
      setState(prev => ({
        ...prev,
        badges: [...prev.badges, { ...badge, earnedAt: new Date() }]
      }));
      
      toast({
        title: "New Badge Earned!",
        description: `🏆 ${badge.name}: ${badge.description}`,
      });
    }
  };

  const updateProfileCompletion = () => {
    if (!user) return;
    
    let completion = 0;
    const fields = [
      user.name,
      user.email,
      user.bio,
      user.country,
      user.skillsToTeach?.length > 0,
      user.skillsToLearn?.length > 0,
      user.profilePicture && user.profilePicture !== '👤'
    ];
    
    completion = (fields.filter(Boolean).length / fields.length) * 100;
    
    setState(prev => ({
      ...prev,
      profileCompletion: completion
    }));
    
    // Award coins for 100% completion
    if (completion === 100 && state.profileCompletion < 100) {
      earnCoins(50, "Profile 100% complete");
      awardBadge('profile-complete');
    }
  };

  const watchAd = () => {
    const today = new Date().toDateString();
    const dailyLimit = user?.userType === 'free' ? 5 : 0;
    
    if (state.dailyAdsWatched < dailyLimit) {
      setState(prev => ({
        ...prev,
        dailyAdsWatched: prev.dailyAdsWatched + 1
      }));
      
      earnCoins(10, "Watching ad");
    } else {
      toast({
        title: "Daily limit reached",
        description: user?.userType === 'premium' 
          ? "Premium users don't need to watch ads!"
          : "You've reached your daily ad limit.",
        variant: "destructive"
      });
    }
  };

  const completeExchange = (isMentor: boolean) => {
    const baseReward = 20;
    const mentorBonus = isMentor ? 10 : 0;
    const totalReward = baseReward + mentorBonus;
    
    setState(prev => ({
      ...prev,
      totalExchanges: prev.totalExchanges + 1
    }));
    
    earnCoins(totalReward, `Exchange completion${isMentor ? ' (Mentor bonus)' : ''}`);
    
    // Update challenge progress
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(challenge => {
        if (challenge.id === 'weekly-exchanges' && !challenge.isCompleted) {
          const newProgress = challenge.progress + 1;
          const isCompleted = newProgress >= challenge.target;
          
          if (isCompleted) {
            earnCoins(challenge.reward, "Weekly challenge completed");
          }
          
          return {
            ...challenge,
            progress: newProgress,
            isCompleted
          };
        }
        return challenge;
      })
    }));
  };

  const purchaseCoins = (pack: string) => {
    // This will be implemented with Stripe integration
    console.log('Purchase coins pack:', pack);
    toast({
      title: "Payment Integration Required",
      description: "Stripe integration needed for coin purchases.",
    });
  };

  // Check daily login on mount
  useEffect(() => {
    if (user) {
      checkDailyLogin();
      updateProfileCompletion();
    }
  }, [user]);

  return (
    <GamificationContext.Provider value={{
      state,
      earnCoins,
      spendCoins,
      checkDailyLogin,
      awardBadge,
      updateProfileCompletion,
      watchAd,
      completeExchange,
      purchaseCoins
    }}>
      {children}
    </GamificationContext.Provider>
  );
};