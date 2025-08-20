import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
import { logger } from '@/utils/logger';

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
  const { userTier, canUseFeature, getMaxSearchResults } = useMonetization();
  const isPremium = userTier === 'premium';
  
  const [showAd, setShowAd] = useState(true);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Debug logging
  // console.log('🔍 Monetization Debug:', {
  //   userTier,
  //   isPremium,
  //   user: user?.id,
  //   userTypeFromUser: user?.userType,
  //   maxSearchResults: getMaxSearchResults()
  // });

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
    cacheResults: false, // Temporarily disable cache to fix the issue
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

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Fetch real user data from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        logger.debug('🔍 DEBUG: Starting to fetch users from Supabase...');
        
        // Fetch profiles from Supabase with reviews and exchanges data
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
          logger.error('Error fetching profiles:', error);
          setUsers([]);
          return;
        }

            // console.log('🔍 DEBUG: Raw profiles from Supabase:', profiles?.length || 0);
            // console.log('🔍 DEBUG: Sample profiles:', profiles?.slice(0, 3).map(p => ({
            //   id: p.id,
            //   name: p.display_name,
            //   skills_to_teach: p.skills_to_teach
            // })));

        // Transform Supabase data to UserProfile format and filter out current user
        const transformedUsers: UserProfile[] = await Promise.all(
          profiles
            ?.filter(profile => profile.id !== user?.id) // Filter out current user's profile
            .map(async (profile) => {
              // Fetch reviews for this user
              const { data: reviewsData } = await supabase
                .from('reviews')
                .select('skill_rating')
                .eq('reviewed_user_id', profile.id);

              // Fetch completed exchanges for this user
              const { data: exchangesData } = await supabase
                .from('chats')
                .select('id')
                .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
                .eq('exchange_state', 'completed');

              // Calculate average rating
              const averageRating = reviewsData && reviewsData.length > 0 
                ? reviewsData.reduce((sum, r) => sum + r.skill_rating, 0) / reviewsData.length 
                : 0;

              // Count completed exchanges
              const successfulExchanges = exchangesData?.length || 0;

              // Debug skill transformation
              const originalSkills = profile.skills_to_teach;
              const transformedSkills = Array.isArray(profile.skills_to_teach) 
                ? profile.skills_to_teach.map((skill: any) => {
                    // Handle different skill formats - SAME LOGIC AS POPULAR SKILLS
                    if (typeof skill === 'string') {
                      return skill;
                    } else if (skill && typeof skill === 'object' && skill.name) {
                      return skill.name;
                    } else if (skill && typeof skill === 'object' && skill.skill) {
                      return skill.skill;
                    }
                    return null;
                  }).filter(Boolean) // Remove any null/undefined values
                : [];
              
              // console.log(`🔍 DEBUG: User ${profile.display_name} - Original skills:`, originalSkills, 'Transformed skills:', transformedSkills);

              return {
                id: profile.id,
                name: profile.display_name || t('actions.anonymousUser'),
                profilePicture: profile.avatar_url && profile.avatar_url.startsWith('http') ? profile.avatar_url : '👤',
                isMentor: profile.willing_to_teach_without_return || false, // Use this as mentor indicator
                rating: averageRating || 0, // Use actual average rating
                successfulExchanges: successfulExchanges, // Use actual exchange count
                skillLevel: 'Intermediate' as const, // Default since it's not in the schema
                bio: profile.bio || '',
                skills: transformedSkills,
                country: profile.country || t('actions.unknown'),
                gender: (profile.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
                willingToTeachWithoutReturn: profile.willing_to_teach_without_return || false
              };
            }) || []
        );

        logger.debug('🔍 DEBUG: Transformed users:', transformedUsers.length);
        logger.debug('🔍 DEBUG: Sample users with skills:');
        transformedUsers.slice(0, 5).forEach(user => {
          logger.debug(`  - ${user.name}: [${user.skills.join(', ')}]`);
        });
        

        
        logger.debug('🔍 DEBUG: Setting users in SearchResults:', transformedUsers.length);
        setUsers(transformedUsers);
        setSearchUsers(transformedUsers); // Update optimized search hook
        
        // Force search service initialization with the new users
        if (searchQuery && transformedUsers.length > 0) {
          logger.debug('🔍 DEBUG: Forcing search service initialization with', transformedUsers.length, 'users');
          // The search will be triggered by the useEffect that watches searchQuery
        }
      } catch (error) {
        logger.error('Error fetching users:', error);
        setUsers([]);
        setSearchUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.id, t]);

  // Update search term when URL changes
  useEffect(() => {
    // console.log('🔍 DEBUG: Search query changed to:', searchQuery);
    // console.log('🔍 DEBUG: updateSearchTerm function:', typeof updateSearchTerm);
    // console.log('🔍 DEBUG: clearCache function:', typeof clearCache);
    updateSearchTerm(searchQuery);
    // Clear cache when search query changes to ensure fresh results
    clearCache();
  }, [searchQuery, updateSearchTerm, clearCache]);

  // Ensure search service is initialized when users are loaded
  useEffect(() => {
    if (users.length > 0 && searchQuery) {
      logger.debug('🔍 DEBUG: Users loaded, re-triggering search for:', searchQuery);
      // Force a fresh search with the loaded users
      updateSearchTerm(searchQuery);
    }
  }, [users.length, searchQuery, updateSearchTerm]);

  // Apply filters to search results and limit for free users
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

    // Limit results for free users to ensure consistent 3 users
    const maxResults = getMaxSearchResults();
    if (!isPremium && filtered.length > maxResults) {
      // For free users, always show the same 3 users based on a consistent sorting
      // This ensures they see the same results even after refresh
      const sortedUsers = [...filtered].sort((a, b) => {
        // Sort by rating first, then by name for consistency
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return a.name.localeCompare(b.name);
      });
      filtered = sortedUsers.slice(0, maxResults);
    }

    setFilteredUsers(filtered);
  }, [searchResults, users, searchQuery, filters, canUseFeature, isPremium, getMaxSearchResults]);

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
              <h2 className="text-2xl font-bold mb-2">{t('actions.searchDisabledTitle')}</h2>
              <p className="text-muted-foreground mb-4">
                Search functionality is not available for your account type.
              </p>
              <p className="text-sm text-muted-foreground">
                {t('actions.contactSupportIfError')}
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
                  onUpgrade={handleUpgrade}
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
                  // Allow free users to open the filter sidebar to see what's available
                />
                <span className="text-sm text-muted-foreground">
                  {filteredUsers.length} results found
                  {!isPremium && filteredUsers.length >= 3 && (
                    <span className="ml-2 text-xs text-orange-600">
                      (Upgrade to see all {searchQuery ? searchResults.length : users.length} results)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1">
              {loading || isSearchLoading ? (
                <div className="text-center py-8">{t('actions.loading')}</div>
              ) : (
                <SearchResults 
                  users={filteredUsers} 
                  searchQuery={searchQuery} 
                  isPremium={isPremium}
                  searchResponse={searchResponse}
                  onSuggestionClick={handleSuggestionClick}
                  totalResults={searchQuery ? searchResults.length : users.length}
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