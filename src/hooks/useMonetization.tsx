import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";

interface PremiumFeatures {
  unlimitedInvites: boolean;
  worldwideSearch: boolean;
  mapSearch: boolean;
  fullFilters: boolean;
  noAds: boolean;
  earlyEventAccess: boolean;
  freeRequestPosts: number;
  monthlyCoinStipend: number;
  discountedCoinCosts: boolean;
}

interface TierLimitations {
  maxInvitesPerMonth: number;
  searchScope: 'country' | 'worldwide';
  mapSearchEnabled: boolean;
  mentorFilterEnabled: boolean;
  adsVisible: boolean;
  requestPostsPerMonth: number;
  maxSearchResults: number;
}

interface MonetizationContextType {
  userTier: 'free' | 'premium';
  features: PremiumFeatures;
  limitations: TierLimitations;
  canUseFeature: (feature: string) => boolean;
  getRemainingInvites: () => number;
  getRemainingRequestPosts: () => number;
  getCoinPrice: (item: string, basePrice: number) => number;
  getMaxSearchResults: () => number;
}

const MonetizationContext = createContext<MonetizationContextType | null>(null);

export const useMonetization = () => {
  const context = useContext(MonetizationContext);
  if (!context) {
    throw new Error("useMonetization must be used within a MonetizationProvider");
  }
  return context;
};

export const MonetizationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // Determine user tier based on user data or default to free
  const userTier = user?.userType || 'free';
  
  // Premium features
  const features: PremiumFeatures = {
    unlimitedInvites: userTier === 'premium',
    worldwideSearch: userTier === 'premium',
    mapSearch: userTier === 'premium',
    fullFilters: userTier === 'premium',
    noAds: userTier === 'premium',
    earlyEventAccess: userTier === 'premium',
    freeRequestPosts: userTier === 'premium' ? 10 : 2,
    monthlyCoinStipend: userTier === 'premium' ? 100 : 0,
    discountedCoinCosts: userTier === 'premium'
  };

  // Tier limitations
  const limitations: TierLimitations = {
    maxInvitesPerMonth: userTier === 'premium' ? Infinity : 5,
    searchScope: userTier === 'premium' ? 'worldwide' : 'country',
    mapSearchEnabled: userTier === 'premium',
    mentorFilterEnabled: userTier === 'premium',
    adsVisible: userTier === 'free',
    requestPostsPerMonth: userTier === 'premium' ? 10 : 2,
    maxSearchResults: userTier === 'premium' ? Infinity : 3
  };

  const canUseFeature = (feature: string): boolean => {
    switch (feature) {
      case 'country_filter':
      case 'mentor_filter':
      case 'full_filters':
        return userTier === 'premium';
      case 'unlimited_search':
        return userTier === 'premium';
      case 'no_ads':
        return userTier === 'premium';
      default:
        return true;
    }
  };

  const getRemainingInvites = (): number => {
    if (features.unlimitedInvites) return Infinity;
    return Math.max(0, limitations.maxInvitesPerMonth - (user?.remainingInvites || 0));
  };

  const getRemainingRequestPosts = (): number => {
    return features.freeRequestPosts;
  };

  const getMaxSearchResults = (): number => {
    return limitations.maxSearchResults;
  };

  const getCoinPrice = (item: string, basePrice: number): number => {
    if (!features.discountedCoinCosts) return basePrice;
    
    // Premium discounts on specific items
    const discounts: Record<string, number> = {
      'profile-boost': 0.67, // 100 instead of 150
      'pinned-review': 0.85, // 170 instead of 200
    };

    return Math.round(basePrice * (discounts[item] || 1));
  };

  return (
    <MonetizationContext.Provider value={{
      userTier,
      features,
      limitations,
      canUseFeature,
      getRemainingInvites,
      getRemainingRequestPosts,
      getCoinPrice,
      getMaxSearchResults
    }}>
      {children}
    </MonetizationContext.Provider>
  );
};