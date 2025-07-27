import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchResults } from "@/components/search/SearchResults";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { FilterButton } from "@/components/search/FilterButton";
import { SearchHeader } from "@/components/search/SearchHeader";
import { AdBanner } from "@/components/ads/AdBanner";
import { DummyAdCard } from "@/components/ads/DummyAdCard";
import { dummyProfiles, getRandomAds } from "@/data/dummyData";
import { supabase } from "@/integrations/supabase/client";
import { useMonetization } from "@/hooks/useMonetization";

export interface UserProfile {
  id: string;
  name: string;
  profilePicture: string;
  isMentor: boolean;
  rating: number;
  successfulExchanges: number;
  skillLevel: "Beginner" | "Intermediate" | "Expert";
  bio: string;
  skills: string[];
  country: string;
  gender: "Male" | "Female";
  willingToTeachWithoutReturn: boolean;
}

export interface SearchFilters {
  country: string;
  skillLevel: string;
  rating: string;
  gender: string[];
  mentorOnly: boolean;
}

// Mock data for demonstration
const mockUsers: UserProfile[] = [
  {
    id: "1",
    name: "Sarah Chen",
    profilePicture: "👩‍🎨",
    isMentor: true,
    rating: 4.9,
    successfulExchanges: 127,
    skillLevel: "Expert",
    bio: "UI/UX Designer with 8 years of experience. Love teaching design principles and Figma workflows.",
    skills: ["UI/UX Design", "Figma", "Illustration", "Prototyping"],
    country: "Singapore",
    gender: "Female",
    willingToTeachWithoutReturn: true
  },
  {
    id: "2",
    name: "Marcus Johnson",
    profilePicture: "👨‍💻",
    isMentor: true,
    rating: 5.0,
    successfulExchanges: 203,
    skillLevel: "Expert",
    bio: "Full-stack developer passionate about React and Node.js. Teaching coding since 2019.",
    skills: ["React", "Node.js", "Python", "TypeScript"],
    country: "United States",
    gender: "Male",
    willingToTeachWithoutReturn: true
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    profilePicture: "👩‍🍳",
    isMentor: true,
    rating: 4.8,
    successfulExchanges: 89,
    skillLevel: "Intermediate",
    bio: "Professional chef specializing in plant-based cuisine. Love sharing healthy cooking techniques!",
    skills: ["Vegan Cooking", "Baking", "Meal Prep", "Nutrition"],
    country: "Spain",
    gender: "Female",
    willingToTeachWithoutReturn: true
  },
  {
    id: "4",
    name: "David Kim",
    profilePicture: "🎸",
    isMentor: false,
    rating: 4.6,
    successfulExchanges: 45,
    skillLevel: "Intermediate",
    bio: "Guitar enthusiast and music teacher. Also learning piano and would love to exchange knowledge!",
    skills: ["Guitar", "Music Theory", "Songwriting"],
    country: "South Korea",
    gender: "Male",
    willingToTeachWithoutReturn: false
  },
  {
    id: "5",
    name: "Amanda Silva",
    profilePicture: "📷",
    isMentor: true,
    rating: 4.7,
    successfulExchanges: 112,
    skillLevel: "Expert",
    bio: "Professional photographer and Adobe expert. Teaching photo editing and camera techniques.",
    skills: ["Photography", "Lightroom", "Photoshop", "Portrait Photography"],
    country: "Brazil",
    gender: "Female",
    willingToTeachWithoutReturn: true
  },
  {
    id: "6",
    name: "Alex Thompson",
    profilePicture: "🏃‍♂️",
    isMentor: false,
    rating: 4.3,
    successfulExchanges: 28,
    skillLevel: "Beginner",
    bio: "Fitness enthusiast learning about nutrition and workout planning. Happy to teach basic running techniques!",
    skills: ["Running", "Basic Fitness", "Motivation"],
    country: "Canada",
    gender: "Male",
    willingToTeachWithoutReturn: false
  }
];

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    country: "",
    skillLevel: "",
    rating: "",
    gender: [],
    mentorOnly: false
  });
  const { userTier, canUseFeature } = useMonetization();
  const isPremium = userTier === 'premium';
  const [showAd, setShowAd] = useState(true);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const searchQuery = searchParams.get("q") || "";

  // Use dummy profiles for testing
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Convert dummy profiles to UserProfile format
      const transformedUsers: UserProfile[] = dummyProfiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        profilePicture: profile.profilePicture,
        isMentor: profile.isMentor,
        rating: profile.rating,
        successfulExchanges: profile.successfulExchanges,
        skillLevel: profile.skillLevel,
        bio: profile.bio,
        skills: profile.skills,
        country: profile.country,
        gender: profile.gender,
        willingToTeachWithoutReturn: profile.willingToTeachWithoutReturn
      }));

      setUsers(transformedUsers);
      setLoading(false);
    }, 1000); // 1 second loading delay for realistic feel

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter users based on search query and filters
    let filtered = users;

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.skills.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters - Country filter only for premium users
    if (filters.country && canUseFeature('country_filter')) {
      filtered = filtered.filter(user => user.country === filters.country);
    }

    if (filters.skillLevel) {
      filtered = filtered.filter(user => user.skillLevel === filters.skillLevel);
    }

    if (filters.rating) {
      const ratingThreshold = parseFloat(filters.rating);
      filtered = filtered.filter(user => user.rating >= ratingThreshold);
    }

    if (filters.gender.length > 0) {
      filtered = filtered.filter(user => filters.gender.includes(user.gender));
    }

    // Apply mentor filter only for premium users
    if (filters.mentorOnly && canUseFeature('mentor_filter')) {
      filtered = filtered.filter(user => user.willingToTeachWithoutReturn);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filters, users]);

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader searchQuery={searchQuery} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Ad Banner for Free Users */}
        {!isPremium && showAd && (
          <div className="mb-6">
            <AdBanner 
              onClose={() => setShowAd(false)}
              onUpgrade={() => {
                // TODO: Open premium upgrade modal
                console.log('Open premium upgrade');
              }}
            />
          </div>
        )}

        {/* Dummy Ad for Testing */}
        <div className="mb-6">
          <DummyAdCard 
            ad={getRandomAds(1)[0]} 
            className="mx-auto max-w-lg"
          />
        </div>
        
        {/* Filter Button and Sidebar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <FilterButton
              onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              isOpen={isFilterSidebarOpen}
              activeFiltersCount={
                (filters.country ? 1 : 0) +
                (filters.skillLevel ? 1 : 0) +
                (filters.rating ? 1 : 0) +
                filters.gender.length +
                (filters.mentorOnly ? 1 : 0)
              }
            />
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length} results found
            </span>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <SearchResults 
              users={filteredUsers} 
              searchQuery={searchQuery} 
              isPremium={isPremium}
            />
          )}
        </div>
      </div>

      {/* Filter Sidebar - Rendered outside main content flow */}
      <FilterSidebar
        filters={filters}
        onFiltersChange={setFilters}
        isPremium={isPremium}
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
      />
    </div>
  );
};

export default SearchResultsPage;