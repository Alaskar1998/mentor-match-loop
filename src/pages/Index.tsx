import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LatestExchangesSection } from "@/components/LatestExchangesSection";
import { TopContributorsSection } from "@/components/TopContributorsSection";
import { JoinCommunitySection } from "@/components/JoinCommunitySection";
import { FAQSection } from "@/components/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen">
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
