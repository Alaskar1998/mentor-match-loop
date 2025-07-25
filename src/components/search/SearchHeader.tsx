import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchHeaderProps {
  searchQuery: string;
  resultCount: number;
}

export const SearchHeader = ({ searchQuery, resultCount }: SearchHeaderProps) => {
  const [query, setQuery] = useState(searchQuery);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-gradient-subtle border-b border-border py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative flex items-center bg-white rounded-lg shadow-card">
              <Input
                type="text"
                placeholder="What do you want to learn?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0 text-lg px-6 py-4 bg-transparent"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button 
                variant="default" 
                onClick={handleSearch}
                className="rounded-r-lg rounded-l-none px-8"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {searchQuery ? `Results for "${searchQuery}"` : "All Skills"}
              </h1>
              <p className="text-muted-foreground">
                Found {resultCount} {resultCount === 1 ? 'teacher' : 'teachers'} available
              </p>
            </div>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <button 
                onClick={() => navigate('/')}
                className="hover:text-primary transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <span>Search Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};