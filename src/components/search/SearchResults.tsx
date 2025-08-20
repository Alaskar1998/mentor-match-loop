import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "./ProfileCard";
import { UserProfile } from "@/pages/SearchResults";
import { SearchResponse } from "@/services/searchService";
import { NoResultsMessage } from "./SearchSuggestion";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResultsProps {
  users: UserProfile[];
  searchQuery: string;
  isPremium: boolean;
  searchResponse?: SearchResponse | null;
  onSuggestionClick?: (suggestedTerm: string) => void;
  totalResults?: number;
}

export const SearchResults = React.memo(({ 
  users, 
  searchQuery, 
  isPremium, 
  searchResponse, 
  onSuggestionClick,
  totalResults = 0
}: SearchResultsProps) => {
  const navigate = useNavigate();

  // Debug logging
  // console.log('🔍 SearchResults Debug:', {
  //   isPremium,
  //   usersCount: users.length,
  //   totalResults,
  //   shouldShowUpgrade: !isPremium && totalResults > users.length
  // });

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (users.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-12 text-center">
          {searchQuery ? (
            <NoResultsMessage
              searchTerm={searchQuery}
              suggestion={searchResponse?.suggestion}
              onSuggestionClick={onSuggestionClick || (() => {})}
            />
          ) : (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No teachers found
              </h3>
              <p className="text-muted-foreground mb-6">
                No teachers match your current filters. Try adjusting your criteria.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Try using different keywords</p>
                <p>• Check your spelling</p>
                <p>• Remove some filters</p>
                <p>• Browse all available skills</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Available Teachers
          </h2>
          {searchQuery && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {searchResponse?.hasExactMatches ? 'Exact matches' : 'Partial matches'}: {searchQuery}
            </Badge>
          )}
          {searchResponse && (
            <span className="text-sm text-muted-foreground">
              {searchResponse.totalFound} results found
            </span>
          )}
        </div>
        
        {/* Sort Options - Disabled for free users */}
        <select 
          className={`px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            !isPremium ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!isPremium}
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="rating">Highest Rated</option>
          <option value="exchanges">Most Exchanges</option>
          <option value="newest">Newest Members</option>
        </select>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {users.map((user, index) => {
          // Find the corresponding search result for this user
          const searchResult = searchResponse?.results.find(result => result.user.id === user.id);
          
          return (
            <ProfileCard 
              key={user.id}
              user={user} 
              isBlurred={false}
              searchResult={searchResult}
            />
          );
        })}
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {!isPremium && totalResults > users.length && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Unlock All Results</h3>
            </div>
            <p className="text-sm text-orange-700 mb-4">
              You're seeing {users.length} of {totalResults} available teachers. 
              Upgrade to Premium to see all results and unlock advanced filtering.
            </p>
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleUpgrade}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Blurred Additional Results for Free Users */}
      {!isPremium && totalResults > users.length && (
        <div className="relative">
          <div className="blur-sm pointer-events-none">
            {/* Show 2-3 blurred placeholder cards */}
            {Array.from({ length: Math.min(3, totalResults - users.length) }).map((_, index) => (
              <Card key={`blurred-${index}`} className="mb-6 shadow-card">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-300 rounded w-20"></div>
                    <div className="h-8 bg-gray-300 rounded w-24"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Overlay with upgrade message */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center p-6">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-2">Premium Content</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to Premium to see {totalResults - users.length} more teachers
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleUpgrade}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Load More (for pagination) - Only for premium users */}
      {isPremium && users.length >= 6 && (
        <div className="text-center pt-8">
          <button className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
            Load More Teachers
          </button>
        </div>
      )}
    </div>
  );
});