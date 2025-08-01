import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchResults } from "@/components/search/SearchResults";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { FilterButton } from "@/components/search/FilterButton";
import { SearchHeader } from "@/components/search/SearchHeader";
import { AdBanner } from "@/components/ads/AdBanner";
import { supabase } from "@/integrations/supabase/client";
import { useMonetization } from "@/hooks/useMonetization";
import { useAuth } from "@/hooks/useAuth";
import { searchService, SearchResponse } from "@/services/searchService";
import { SearchSuggestionCard, NoResultsMessage } from "@/components/search/SearchSuggestion";
import { isSearchDisabled } from "@/utils/userValidation";
import { useOptimizedSearch } from "@/hooks/useOptimizedSearch";
import { useTranslation } from "react-i18next";

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
  const { user } = useAuth();
  const { t } = useTranslation();

  const searchQuery = searchParams.get("q") || "";

  // Initialize optimized search hook
  const {
    results: searchResults,
    searchResponse,
    isLoading: isSearchLoading,
    setUsers: setSearchUsers,
    updateSearchTerm,
    clearCache
  } = useOptimizedSearch({
    debounceMs: 300,
    cacheResults: true,
    maxCacheSize: 50
  });

  // Handle search suggestions
  const handleSuggestionClick = (suggestedTerm: string) => {
    const newUrl = `/search?q=${encodeURIComponent(suggestedTerm)}`;
    window.history.pushState({}, '', newUrl);
    window.location.reload(); // Simple way to trigger search with new term
  };

  // Use centralized validation
  const searchDisabled = isSearchDisabled(user?.name);

  // Fetch real user data from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch profiles from Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            display_name,
            avatar_url,
            bio,
            country,
            gender,
            skills_to_teach,
            willing_to_teach_without_return
          `)
          .not('id', 'is', null);

        if (error) {
          console.error('Error fetching profiles:', error);
          setUsers([]);
          return;
        }

        // Transform Supabase data to UserProfile format and filter out current user
        const transformedUsers: UserProfile[] = profiles
          ?.filter(profile => profile.id !== user?.id) // Filter out current user's profile
          .map(profile => ({
            id: profile.id,
            name: profile.display_name || t('actions.anonymousUser'),
            profilePicture: profile.avatar_url && profile.avatar_url.startsWith('http') ? profile.avatar_url : '👤',
            isMentor: profile.willing_to_teach_without_return || false, // Use this as mentor indicator
            rating: 4.5, // Default rating since it's not in the schema
            successfulExchanges: 0, // Default since it's not in the schema
            skillLevel: 'Intermediate' as const, // Default since it's not in the schema
            bio: profile.bio || '',
            skills: Array.isArray(profile.skills_to_teach) 
              ? profile.skills_to_teach.map((skill: any) => {
                  // Handle different skill formats
                  if (typeof skill === 'string') return skill;
                  if (skill && typeof skill === 'object') {
                    return skill.name || skill.skill || skill.title || JSON.stringify(skill);
                  }
                  return String(skill);
                })
              : [],
            country: profile.country || t('actions.unknown'),
            gender: (profile.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
            willingToTeachWithoutReturn: profile.willing_to_teach_without_return || false
          })) || [];

        console.log('Loaded users with skills and avatars:', transformedUsers.map(user => ({
          name: user.name,
          skills: user.skills,
          bio: user.bio,
          avatar: user.profilePicture
        })));
        
        setUsers(transformedUsers);
        setSearchUsers(transformedUsers); // Update optimized search hook
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setSearchUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update search term when URL changes
  useEffect(() => {
    updateSearchTerm(searchQuery);
  }, [searchQuery, updateSearchTerm]);

  // Apply filters to search results
  useEffect(() => {
    let filtered = searchQuery ? searchResults : users;

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
  }, [searchResults, users, searchQuery, filters, canUseFeature]);

  // Clear search cache when filters change (to ensure fresh results)
  useEffect(() => {
    if (searchQuery) {
      clearCache();
    }
  }, [filters, clearCache]);

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader searchQuery={searchQuery} disabled={searchDisabled} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Check if search is disabled */}
        {searchDisabled ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold mb-2">Search Disabled</h2>
              <p className="text-muted-foreground mb-4">
                Search functionality is not available for your account type.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact support if you believe this is an error.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Search Suggestion */}
            {searchResponse?.suggestion && (
              <div className="mb-6">
                <SearchSuggestionCard
                  suggestion={searchResponse.suggestion}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            )}

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
              {loading || isSearchLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <SearchResults 
                  users={filteredUsers} 
                  searchQuery={searchQuery} 
                  isPremium={isPremium}
                  searchResponse={searchResponse}
                  onSuggestionClick={handleSuggestionClick}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Filter Sidebar - Rendered outside main content flow */}
      {!searchDisabled && (
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          isPremium={isPremium}
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;