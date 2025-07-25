import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LatestExchangesSection } from "@/components/LatestExchangesSection";
import { TopContributorsSection } from "@/components/TopContributorsSection";
import { JoinCommunitySection } from "@/components/JoinCommunitySection";
import { FAQSection } from "@/components/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-xl">SkillExchange</div>
            <div className="flex items-center gap-4">
              <Link to="/requests-feed">
                <Button variant="ghost">Browse Requests</Button>
              </Link>
              <Link to="/create-request">
                <Button variant="outline">Create Request</Button>
              </Link>
              <Button>Sign In</Button>
            </div>
          </div>
        </div>
      </nav>

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
