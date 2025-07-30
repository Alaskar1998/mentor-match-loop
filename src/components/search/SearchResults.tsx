import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "./ProfileCard";
import { UserProfile } from "@/pages/SearchResults";
import { SearchResponse } from "@/services/searchService";
import { NoResultsMessage } from "./SearchSuggestion";

interface SearchResultsProps {
  users: UserProfile[];
  searchQuery: string;
  isPremium: boolean;
  searchResponse?: SearchResponse | null;
  onSuggestionClick?: (suggestedTerm: string) => void;
}

export const SearchResults = React.memo(({ 
  users, 
  searchQuery, 
  isPremium, 
  searchResponse, 
  onSuggestionClick 
}: SearchResultsProps) => {
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
        
        {/* Sort Options */}
        <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
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
      

      {/* Load More (for pagination) */}
      {users.length >= 6 && (
        <div className="text-center pt-8">
          <button className="px-8 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
            Load More Teachers
          </button>
        </div>
      )}
    </div>
  );
});