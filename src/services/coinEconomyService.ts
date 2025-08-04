import { 
import { logger } from '@/utils/logger';
  CoinTransaction, 
  CoinTransactionType, 
  DailyStreak, 
  ReferralTracker, 
  WeeklyMission, 
  UserMissionProgress,
  AdWatchingSession,
  ProfileCompletionTracker,
  MentorMilestone
} from '@/types/coin-economy';

interface CoinEarningRules {
  dailyLoginBonus: {
    minCoins: number;
    maxCoins: number;
    streakMultiplier: number;
  };
  profileCompletion: number;
  exchangeCompletion: number;
  mentorBonus: number;
  referralReward: number;
  adWatching: {
    coinsPerAd: number;
    dailyLimit: number;
  };
  weeklyMission: {
    min: number;
    max: number;
  };
  mentorMilestone: number;
  monthlyStipend: {
    premium: number;
  };
}

interface CoinSpendingRules {
  extraInvite: {
    free: number;
    premium: number;
  };
  messageInvite: {
    free: number;
    premium: number;
  };
  learningRequest: {
    free: number;
    premium: number;
  };
  profileBoost: {
    free: number;
    premium: number;
  };
  pinnedReview: number;
  skillVerification: number;
  customTheme: number;
}

interface CoinPackRules {
  starter: { price: number; coins: number };
  learner: { price: number; coins: number };
  pro: { price: number; coins: number };
  mega: { price: number; coins: number };
}

class CoinEconomyService {
  private static instance: CoinEconomyService;
  
  private readonly EARNING_RULES: CoinEarningRules = {
    dailyLoginBonus: {
      minCoins: 5,
      maxCoins: 30,
      streakMultiplier: 5
    },
    profileCompletion: 50,
    exchangeCompletion: 20,
    mentorBonus: 10,
    referralReward: 100,
    adWatching: {
      coinsPerAd: 10,
      dailyLimit: 5
    },
    weeklyMission: {
      min: 50,
      max: 100
    },
    mentorMilestone: 50,
    monthlyStipend: {
      premium: 300
    }
  };

  private readonly SPENDING_RULES: CoinSpendingRules = {
    extraInvite: { free: 50, premium: 0 },
    messageInvite: { free: 30, premium: 0 },
    learningRequest: { free: 100, premium: 0 },
    profileBoost: { free: 150, premium: 100 },
    pinnedReview: 200,
    skillVerification: 500,
    customTheme: 100
  };

  private readonly COIN_PACKS: CoinPackRules = {
    starter: { price: 0.99, coins: 100 },
    learner: { price: 4.99, coins: 600 },
    pro: { price: 9.99, coins: 1400 },
    mega: { price: 19.99, coins: 3200 }
  };

  public static getInstance(): CoinEconomyService {
    if (!CoinEconomyService.instance) {
      CoinEconomyService.instance = new CoinEconomyService();
    }
    return CoinEconomyService.instance;
  }

  // ===== EARNING COINS =====

  async processDailyLoginBonus(userId: string): Promise<CoinTransaction | null> {
    const streak = await this.getDailyStreak(userId);
    const today = new Date().toDateString();
    
    if (streak.lastLoginDate === today) {
      return null; // Already claimed today
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const isConsecutive = streak.lastLoginDate === yesterday;
    const newStreakDay = isConsecutive ? streak.currentStreak + 1 : 1;
    
    // Calculate coins based on streak
    const streakBonus = Math.min(
      this.EARNING_RULES.dailyLoginBonus.minCoins + (newStreakDay - 1) * this.EARNING_RULES.dailyLoginBonus.streakMultiplier,
      this.EARNING_RULES.dailyLoginBonus.maxCoins
    );

    // Update streak
    await this.updateDailyStreak(userId, {
      currentStreak: newStreakDay,
      lastLoginDate: today,
      longestStreak: Math.max(streak.longestStreak, newStreakDay),
      totalLogins: streak.totalLogins + 1,
      streakResetCount: isConsecutive ? streak.streakResetCount : streak.streakResetCount + 1
    });

    return await this.createCoinTransaction(userId, 'daily_login_bonus', streakBonus, {
      streakDay: newStreakDay
    });
  }

  async processProfileCompletion(userId: string, completionPercentage: number): Promise<CoinTransaction | null> {
    const tracker = await this.getProfileCompletionTracker(userId);
    
    if (completionPercentage === 100 && !tracker.rewardClaimed) {
      await this.updateProfileCompletionTracker(userId, {
        completionPercentage: 100,
        rewardClaimed: true,
        lastCalculatedAt: new Date()
      });

      return await this.createCoinTransaction(userId, 'profile_completion', this.EARNING_RULES.profileCompletion);
    }

    return null;
  }

  async processExchangeCompletion(
    userId: string, 
    partnerId: string, 
    exchangeId: string, 
    isMentor: boolean
  ): Promise<CoinTransaction[]> {
    const transactions: CoinTransaction[] = [];
    
    // Base reward for both users
    const userTransaction = await this.createCoinTransaction(
      userId, 
      'exchange_completion', 
      this.EARNING_RULES.exchangeCompletion,
      { exchangeId }
    );
    transactions.push(userTransaction);

    const partnerTransaction = await this.createCoinTransaction(
      partnerId, 
      'exchange_completion', 
      this.EARNING_RULES.exchangeCompletion,
      { exchangeId }
    );
    transactions.push(partnerTransaction);

    // Mentor bonus for user if applicable
    if (isMentor) {
      const mentorTransaction = await this.createCoinTransaction(
        userId, 
        'mentor_bonus', 
        this.EARNING_RULES.mentorBonus,
        { exchangeId }
      );
      transactions.push(mentorTransaction);

      // Check mentor milestone
      const milestoneTransaction = await this.checkMentorMilestone(userId);
      if (milestoneTransaction) {
        transactions.push(milestoneTransaction);
      }
    }

    // Check for referral completion
    await this.checkReferralCompletion(userId);
    await this.checkReferralCompletion(partnerId);

    return transactions;
  }

  async processAdWatching(userId: string, userTier: 'free' | 'premium'): Promise<CoinTransaction | null> {
    if (userTier !== 'free') {
      throw new Error('Only free users can watch ads for coins');
    }

    const session = await this.getAdWatchingSession(userId);
    const today = new Date().toDateString();

    if (session.date !== today) {
      // Reset daily count for new day
      await this.updateAdWatchingSession(userId, {
        date: today,
        watchedCount: 0,
        dailyLimit: this.EARNING_RULES.adWatching.dailyLimit,
        lastWatchedAt: new Date()
      });
    }

    if (session.watchedCount >= session.dailyLimit) {
      throw new Error('Daily ad watching limit reached');
    }

    // Update watched count
    await this.updateAdWatchingSession(userId, {
      ...session,
      watchedCount: session.watchedCount + 1,
      lastWatchedAt: new Date()
    });

    return await this.createCoinTransaction(
      userId, 
      'ad_watched', 
      this.EARNING_RULES.adWatching.coinsPerAd,
      { adProvider: 'google_ads' }
    );
  }

  async processMonthlyStipend(userId: string, userTier: 'free' | 'premium'): Promise<CoinTransaction | null> {
    if (userTier !== 'premium') {
      return null;
    }

    // Check if already claimed this month
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const lastStipend = await this.getLastStipendDate(userId);
    
    if (lastStipend?.startsWith(thisMonth)) {
      return null; // Already claimed this month
    }

    await this.updateLastStipendDate(userId, new Date().toISOString());

    return await this.createCoinTransaction(
      userId, 
      'monthly_stipend', 
      this.EARNING_RULES.monthlyStipend.premium
    );
  }

  async checkMentorMilestone(userId: string): Promise<CoinTransaction | null> {
    const milestone = await this.getMentorMilestone(userId);
    const currentMilestone = Math.floor(milestone.totalMentorExchanges / 10);
    
    if (currentMilestone > milestone.lastMilestoneReached) {
      await this.updateMentorMilestone(userId, {
        lastMilestoneReached: currentMilestone,
        totalBonusEarned: milestone.totalBonusEarned + this.EARNING_RULES.mentorMilestone
      });

      return await this.createCoinTransaction(
        userId, 
        'mentor_milestone', 
        this.EARNING_RULES.mentorMilestone,
        { missionId: `mentor_milestone_${currentMilestone}` }
      );
    }

    return null;
  }

  // ===== SPENDING COINS =====

  async purchaseItem(
    userId: string, 
    itemType: keyof CoinSpendingRules, 
    userTier: 'free' | 'premium'
  ): Promise<CoinTransaction> {
    const cost = this.getItemCost(itemType, userTier);
    const currentBalance = await this.getCoinBalance(userId);

    if (currentBalance < cost) {
      throw new Error(`Insufficient coins. Required: ${cost}, Available: ${currentBalance}`);
    }

    return await this.createCoinTransaction(
      userId, 
      `${itemType}_purchase` as CoinTransactionType, 
      -cost,
      { itemId: itemType }
    );
  }

  async purchaseCoinPack(
    userId: string, 
    packType: keyof CoinPackRules, 
    paymentTransactionId: string
  ): Promise<CoinTransaction> {
    const pack = this.COIN_PACKS[packType];
    
    return await this.createCoinTransaction(
      userId, 
      'coin_pack_purchase', 
      pack.coins,
      { coinPackId: packType }
    );
  }

  // ===== UTILITY METHODS =====

  getItemCost(itemType: keyof CoinSpendingRules, userTier: 'free' | 'premium'): number {
    const rule = this.SPENDING_RULES[itemType];
    
    if (typeof rule === 'number') {
      return rule;
    }
    
    return rule[userTier];
  }

  async getCoinBalance(userId: string): Promise<number> {
    // This would query the database for the latest balance
    // For now, return from localStorage simulation
    const transactions = await this.getUserTransactions(userId);
    return transactions.reduce((balance, tx) => balance + tx.amount, 0);
  }

  async validateEconomyBalance(): Promise<boolean> {
    // Validation examples from the prompt
    const freeUserExchangeEarnings = this.EARNING_RULES.exchangeCompletion * 3; // 60 coins
    const twoInvitesCost = this.SPENDING_RULES.extraInvite.free * 2; // 100 coins
    const starterPackCoins = this.COIN_PACKS.starter.coins; // 100 coins
    
    logger.debug('Economy Validation:');
    logger.debug('3 exchanges earn: ${freeUserExchangeEarnings} coins');
    logger.debug('2 invites cost: ${twoInvitesCost} coins');
    logger.debug('$0.99 pack gives: ${starterPackCoins} coins');
    
    const profileBoostCost = this.SPENDING_RULES.profileBoost.free; // 150 coins
    const exchangesForBoost = Math.ceil(profileBoostCost / this.EARNING_RULES.exchangeCompletion); // 8 exchanges
    
    logger.debug('Profile boost costs: ${profileBoostCost} coins (~${exchangesForBoost} exchanges)');
    
    return true;
  }

  // ===== PRIVATE HELPER METHODS =====

  private async createCoinTransaction(
    userId: string, 
    type: CoinTransactionType, 
    amount: number, 
    metadata?: any
  ): Promise<CoinTransaction> {
    const currentBalance = await this.getCoinBalance(userId);
    const transaction: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      userId,
      type,
      amount,
      balanceBefore: currentBalance,
      balanceAfter: currentBalance + amount,
      timestamp: new Date(),
      metadata,
      status: 'completed'
    };

    await this.saveTransaction(transaction);
    return transaction;
  }

  // ===== DATABASE SIMULATION METHODS =====
  // In a real app, these would be actual database operations

  private async saveTransaction(transaction: CoinTransaction): Promise<void> {
    const key = `transactions_${transaction.userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(transaction);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  private async getUserTransactions(userId: string): Promise<CoinTransaction[]> {
    const key = `transactions_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  private async getDailyStreak(userId: string): Promise<DailyStreak> {
    const key = `streak_${userId}`;
    const defaultStreak: DailyStreak = {
      userId,
      currentStreak: 0,
      lastLoginDate: '',
      longestStreak: 0,
      totalLogins: 0,
      streakResetCount: 0
    };
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultStreak));
  }

  private async updateDailyStreak(userId: string, streak: Partial<DailyStreak>): Promise<void> {
    const key = `streak_${userId}`;
    const current = await this.getDailyStreak(userId);
    localStorage.setItem(key, JSON.stringify({ ...current, ...streak }));
  }

  private async getProfileCompletionTracker(userId: string): Promise<ProfileCompletionTracker> {
    const key = `profile_completion_${userId}`;
    const defaultTracker: ProfileCompletionTracker = {
      userId,
      completionPercentage: 0,
      rewardClaimed: false,
      lastCalculatedAt: new Date(),
      completedFields: []
    };
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultTracker));
  }

  private async updateProfileCompletionTracker(userId: string, tracker: Partial<ProfileCompletionTracker>): Promise<void> {
    const key = `profile_completion_${userId}`;
    const current = await this.getProfileCompletionTracker(userId);
    localStorage.setItem(key, JSON.stringify({ ...current, ...tracker }));
  }

  private async getAdWatchingSession(userId: string): Promise<AdWatchingSession> {
    const key = `ad_session_${userId}`;
    const defaultSession: AdWatchingSession = {
      userId,
      date: new Date().toDateString(),
      watchedCount: 0,
      dailyLimit: this.EARNING_RULES.adWatching.dailyLimit,
      lastWatchedAt: new Date()
    };
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultSession));
  }

  private async updateAdWatchingSession(userId: string, session: Partial<AdWatchingSession>): Promise<void> {
    const key = `ad_session_${userId}`;
    const current = await this.getAdWatchingSession(userId);
    localStorage.setItem(key, JSON.stringify({ ...current, ...session }));
  }

  private async getMentorMilestone(userId: string): Promise<MentorMilestone> {
    const key = `mentor_milestone_${userId}`;
    const defaultMilestone: MentorMilestone = {
      userId,
      totalMentorExchanges: 0,
      lastMilestoneReached: 0,
      totalBonusEarned: 0
    };
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultMilestone));
  }

  private async updateMentorMilestone(userId: string, milestone: Partial<MentorMilestone>): Promise<void> {
    const key = `mentor_milestone_${userId}`;
    const current = await this.getMentorMilestone(userId);
    localStorage.setItem(key, JSON.stringify({ ...current, ...milestone }));
  }

  private async getLastStipendDate(userId: string): Promise<string | null> {
    return localStorage.getItem(`last_stipend_${userId}`);
  }

  private async updateLastStipendDate(userId: string, date: string): Promise<void> {
    localStorage.setItem(`last_stipend_${userId}`, date);
  }

  private async checkReferralCompletion(userId: string): Promise<void> {
    // Implementation for referral reward processing
    logger.debug('Checking referral completion for user:', userId);
  }
}

export const coinEconomyService = CoinEconomyService.getInstance();