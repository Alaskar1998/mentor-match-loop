import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LatestExchangesSection } from "@/components/LatestExchangesSection";
import { TopContributorsSection } from "@/components/TopContributorsSection";
import { JoinCommunitySection } from "@/components/JoinCommunitySection";
import { FAQSection } from "@/components/FAQSection";
import { GamificationHeader } from "@/components/gamification/GamificationHeader";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Gamification Header for logged-in users */}
      {isAuthenticated && (
        <div className="container mx-auto px-4 py-4">
          <GamificationHeader />
        </div>
      )}

      <HeroSection />
      <HowItWorksSection />
      <LatestExchangesSection />
      <TopContributorsSection />
      <JoinCommunitySection />
      <FAQSection />
    </div>
  );
};

export default Index;
