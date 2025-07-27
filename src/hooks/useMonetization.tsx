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
  
  // Temporarily make all features free for testing
  const userTier = 'premium'; // Force premium for all users
  
  // All features available for free
  const features: PremiumFeatures = {
    unlimitedInvites: true,
    worldwideSearch: true,
    mapSearch: true,
    fullFilters: true,
    noAds: true,
    earlyEventAccess: true,
    freeRequestPosts: 10, // Give more free posts
    monthlyCoinStipend: 100, // Give some coins
    discountedCoinCosts: true
  };

  // No limitations for now
  const limitations: TierLimitations = {
    maxInvitesPerMonth: Infinity,
    searchScope: 'worldwide',
    mapSearchEnabled: true,
    mentorFilterEnabled: true,
    adsVisible: false,
    requestPostsPerMonth: 10
  };

  const canUseFeature = (feature: string): boolean => {
    // All features are available for free now
    return true;
  };

  const getRemainingInvites = (): number => {
    if (features.unlimitedInvites) return Infinity;
    return Math.max(0, limitations.maxInvitesPerMonth - (user?.remainingInvites || 0));
  };

  const getRemainingRequestPosts = (): number => {
    // All users get free request posts now
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