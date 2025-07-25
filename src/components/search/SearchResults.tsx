import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileCard } from "./ProfileCard";
import { UserProfile } from "@/pages/SearchResults";

interface SearchResultsProps {
  users: UserProfile[];
  searchQuery: string;
}

export const SearchResults = ({ users, searchQuery }: SearchResultsProps) => {
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

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <ProfileCard key={user.id} user={user} />
        ))}
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
};