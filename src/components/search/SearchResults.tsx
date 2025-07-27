import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "./ProfileCard";
import { DummyAdCard } from "@/components/ads/DummyAdCard";
import { UserProfile } from "@/pages/SearchResults";
import { getRandomAds } from "@/data/dummyData";

interface SearchResultsProps {
  users: UserProfile[];
  searchQuery: string;
  isPremium: boolean;
}

export const SearchResults = ({ users, searchQuery, isPremium }: SearchResultsProps) => {
  if (users.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No teachers found
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? `We couldn't find any teachers for "${searchQuery}". Try adjusting your search or filters.`
              : "No teachers match your current filters. Try adjusting your criteria."
            }
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Try using different keywords</p>
            <p>• Check your spelling</p>
            <p>• Remove some filters</p>
            <p>• Browse all available skills</p>
          </div>
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
              Searching: {searchQuery}
            </Badge>
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

      {/* Results Grid with Ads */}
      <div className="space-y-6">
        {users.map((user, index) => (
          <div key={user.id}>
            <ProfileCard 
              user={user} 
              isBlurred={!isPremium && index >= 3}
            />
            
            {/* Insert dummy ad every 3 profiles */}
            {(index + 1) % 3 === 0 && index < users.length - 1 && (
              <div className="mt-6">
                <DummyAdCard 
                  ad={getRandomAds(1)[0]} 
                  className="mx-auto max-w-md"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Premium Upgrade Prompt for Free Users */}
      {!isPremium && users.length > 3 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">🔒 Unlock All Results</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade to Premium to see all {users.length} search results clearly and unlock unlimited invites!
          </p>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Upgrade to Premium
          </button>
        </div>
      )}

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
};