import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SearchHeaderProps {
  searchQuery: string;
  disabled?: boolean;
}

export const SearchHeader = ({ searchQuery, disabled = false }: SearchHeaderProps) => {
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
            <div className={`relative flex items-center bg-white rounded-lg shadow-card ${disabled ? 'opacity-50' : ''}`}>
              <Input
                type="text"
                placeholder={disabled ? "Search disabled for your account" : "What skill do you want to learn?"}
                value={query}
                onChange={(e) => !disabled && setQuery(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0 text-lg px-6 py-4 bg-transparent"
                onKeyDown={(e) => !disabled && e.key === "Enter" && handleSearch()}
                disabled={disabled}
              />
              <Button 
                variant="default" 
                onClick={disabled ? undefined : handleSearch}
                className="rounded-r-lg rounded-l-none px-8"
                disabled={disabled}
              >
                <Search className="w-5 h-5 mr-2" />
                {disabled ? 'Disabled' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {searchQuery ? `People who teach "${searchQuery}"` : "All Skills"}
              </h1>
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