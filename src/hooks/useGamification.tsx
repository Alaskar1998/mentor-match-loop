import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { coinEconomyService } from "@/services/coinEconomyService";
import { CoinTransaction } from "@/types/coin-economy";

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
  checkDailyLogin: () => Promise<void>;
  awardBadge: (badgeId: string) => void;
  updateProfileCompletion: () => Promise<void>;
  watchAd: () => Promise<void>;
  completeExchange: (isMentor: boolean, exchangeId?: string, partnerId?: string) => Promise<void>;
  purchaseCoins: (pack: string) => void;
  purchaseItem: (itemType: string) => Promise<boolean>;
  getTransactionHistory: () => Promise<CoinTransaction[]>;
  refreshBalance: () => Promise<void>;
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

  const checkDailyLogin = async () => {
    if (!user) return;
    
    try {
      const transaction = await coinEconomyService.processDailyLoginBonus(user.id);
      if (transaction) {
        setState(prev => ({
          ...prev,
          appCoins: transaction.balanceAfter,
          loginStreak: transaction.metadata?.streakDay || prev.loginStreak + 1,
          lastLoginDate: new Date().toDateString()
        }));
        
        toast({
          title: `+${transaction.amount} coins earned!`,
          description: `Day ${transaction.metadata?.streakDay} login bonus`,
        });

        // Award streak badge at 7 days
        if (transaction.metadata?.streakDay === 7) {
          awardBadge('streak-warrior');
        }
      }
    } catch (error) {
      console.error('Daily login bonus error:', error);
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

  const updateProfileCompletion = async () => {
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
    
    try {
      const transaction = await coinEconomyService.processProfileCompletion(user.id, completion);
      if (transaction) {
        setState(prev => ({
          ...prev,
          appCoins: transaction.balanceAfter
        }));
        
        toast({
          title: `+${transaction.amount} coins earned!`,
          description: "Profile 100% complete!",
        });
        
        awardBadge('profile-complete');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
    }
  };

  const watchAd = async () => {
    if (!user) return;
    
    try {
      const transaction = await coinEconomyService.processAdWatching(user.id, user.userType);
      if (transaction) {
        setState(prev => ({
          ...prev,
          appCoins: transaction.balanceAfter,
          dailyAdsWatched: prev.dailyAdsWatched + 1
        }));
        
        toast({
          title: `+${transaction.amount} coins earned!`,
          description: "Thanks for watching the ad!",
        });
      }
    } catch (error) {
      toast({
        title: "Ad watching failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  };

  const completeExchange = async (isMentor: boolean, exchangeId: string = '', partnerId: string = '') => {
    if (!user) return;
    
    try {
      const transactions = await coinEconomyService.processExchangeCompletion(
        user.id, 
        partnerId || 'partner-mock', 
        exchangeId || `exchange-${Date.now()}`, 
        isMentor
      );
      
      const userTransactions = transactions.filter(tx => tx.userId === user.id);
      const totalEarned = userTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      if (userTransactions.length > 0) {
        setState(prev => ({
          ...prev,
          appCoins: userTransactions[userTransactions.length - 1].balanceAfter,
          totalExchanges: prev.totalExchanges + 1
        }));
        
        const bonusText = isMentor ? ' (including mentor bonus)' : '';
        toast({
          title: `+${totalEarned} coins earned!`,
          description: `Exchange completed${bonusText}`,
        });
      }
      
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
    } catch (error) {
      console.error('Exchange completion error:', error);
    }
  };

  const purchaseItem = async (itemType: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const transaction = await coinEconomyService.purchaseItem(
        user.id, 
        itemType as any, 
        user.userType
      );
      
      setState(prev => ({
        ...prev,
        appCoins: transaction.balanceAfter
      }));
      
      toast({
        title: "Purchase successful!",
        description: `${itemType.replace('_', ' ')} purchased`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      return false;
    }
  };

  const getTransactionHistory = async (): Promise<CoinTransaction[]> => {
    if (!user) return [];
    // This would fetch from the coin economy service
    return [];
  };

  const refreshBalance = async () => {
    if (!user) return;
    
    try {
      const balance = await coinEconomyService.getCoinBalance(user.id);
      setState(prev => ({
        ...prev,
        appCoins: balance
      }));
    } catch (error) {
      console.error('Balance refresh error:', error);
    }
  };

  const purchaseCoins = (pack: string) => {
    // This will be implemented with Stripe integration
    console.log('Purchase coins pack:', pack);
    toast({
      title: "Payment Integration Required",
      description: "Stripe integration needed for coin purchases.",
    });
  };

  // Check daily login on mount and monthly stipend
  useEffect(() => {
    if (user) {
      checkDailyLogin();
      updateProfileCompletion();
      
      // Check monthly stipend for premium users
      if (user.userType === 'premium') {
        coinEconomyService.processMonthlyStipend(user.id, user.userType)
          .then(transaction => {
            if (transaction) {
              setState(prev => ({
                ...prev,
                appCoins: transaction.balanceAfter
              }));
              
              toast({
                title: `+${transaction.amount} coins!`,
                description: "Monthly premium stipend received",
              });
            }
          })
          .catch(console.error);
      }
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
      purchaseCoins,
      purchaseItem,
      getTransactionHistory,
      refreshBalance
    }}>
      {children}
    </GamificationContext.Provider>
  );
};