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
}

interface MonetizationContextType {
  userTier: 'free' | 'premium';
  features: PremiumFeatures;
  limitations: TierLimitations;
  canUseFeature: (feature: string) => boolean;
  getRemainingInvites: () => number;
  getRemainingRequestPosts: () => number;
  getCoinPrice: (item: string, basePrice: number) => number;
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
  
  const userTier = user?.userType || 'free';
  
  // Premium features configuration
  const features: PremiumFeatures = {
    unlimitedInvites: userTier === 'premium',
    worldwideSearch: userTier === 'premium',
    mapSearch: userTier === 'premium',
    fullFilters: userTier === 'premium',
    noAds: userTier === 'premium',
    earlyEventAccess: userTier === 'premium',
    freeRequestPosts: userTier === 'premium' ? 3 : 0,
    monthlyCoinStipend: userTier === 'premium' ? 0 : 0, // Removed coin stipend
    discountedCoinCosts: userTier === 'premium'
  };

  // Free tier limitations
  const limitations: TierLimitations = {
    maxInvitesPerMonth: userTier === 'free' ? 3 : Infinity,
    searchScope: userTier === 'free' ? 'country' : 'worldwide',
    mapSearchEnabled: userTier === 'premium',
    mentorFilterEnabled: userTier === 'premium',
    adsVisible: userTier === 'free',
    requestPostsPerMonth: userTier === 'free' ? 0 : 3
  };

  const canUseFeature = (feature: string): boolean => {
    switch (feature) {
      case 'unlimited_invites':
        return features.unlimitedInvites;
      case 'worldwide_search':
        return features.worldwideSearch;
      case 'map_search':
        return features.mapSearch;
      case 'full_filters':
        return features.fullFilters;
      case 'country_filter':
        return userTier === 'premium';
      case 'mentor_filter':
        return limitations.mentorFilterEnabled;
      case 'no_ads':
        return features.noAds;
      case 'early_events':
        return features.earlyEventAccess;
      case 'free_request_posts':
        return features.freeRequestPosts > 0;
      default:
        return false;
    }
  };

  const getRemainingInvites = (): number => {
    if (features.unlimitedInvites) return Infinity;
    return Math.max(0, limitations.maxInvitesPerMonth - (user?.remainingInvites || 0));
  };

  const getRemainingRequestPosts = (): number => {
    if (userTier === 'free') return 0;
    // In real app, this would track monthly usage
    return features.freeRequestPosts;
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
      getCoinPrice
    }}>
      {children}
    </MonetizationContext.Provider>
  );
};