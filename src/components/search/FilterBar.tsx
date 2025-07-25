import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilters } from "@/pages/SearchResults";
import { Crown, Lock } from "lucide-react";

interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isPremium: boolean;
}

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark",
  "Singapore", "Japan", "South Korea", "China", "India", "Brazil", "Mexico",
  "Argentina", "Chile", "South Africa", "Egypt", "Nigeria", "Kenya"
];

const skillLevels = ["Beginner", "Intermediate", "Expert"];
const ratingOptions = [
  { label: "5⭐ only", value: "5" },
  { label: "4⭐+", value: "4" },
  { label: "3⭐+", value: "3" }
];
const genderOptions = ["Male", "Female", "Other"];

export const FilterBar = ({ filters, onFiltersChange, isPremium }: FilterBarProps) => {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateGenderFilter = (gender: string, checked: boolean) => {
    const newGender = checked 
      ? [...filters.gender, gender]
      : filters.gender.filter(g => g !== gender);
    updateFilters("gender", newGender);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      country: "",
      skillLevel: "",
      rating: "",
      gender: [],
      mentorOnly: false
    });
  };

  const hasActiveFilters = filters.country || filters.skillLevel || filters.rating || 
                          filters.gender.length > 0 || filters.mentorOnly;

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const PremiumFeature = ({ children }: { children: React.ReactNode }) => {
    if (isPremium) return <>{children}</>;
    
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-2">Premium Feature</p>
            <Button variant="accent" size="sm" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="sticky top-6 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
        {!isPremium && (
          <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
            Free Plan - Limited Filters
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Country Filter - Always Available */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Country</Label>
          <div className="relative">
            <select
              value={filters.country}
              onChange={(e) => updateFilters("country", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Level Filter - Premium Only */}
        <PremiumFeature>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Skill Level</Label>
            <select
              value={filters.skillLevel}
              onChange={(e) => updateFilters("skillLevel", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Levels</option>
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </PremiumFeature>

        {/* Rating Filter - Premium Only */}
        <PremiumFeature>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Minimum Rating</Label>
            <select
              value={filters.rating}
              onChange={(e) => updateFilters("rating", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Any Rating</option>
              {ratingOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </PremiumFeature>

        {/* Gender Filter - Premium Only */}
        <PremiumFeature>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Gender</Label>
            <div className="space-y-2">
              {genderOptions.map(gender => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={gender}
                    checked={filters.gender.includes(gender)}
                    onCheckedChange={(checked) => updateGenderFilter(gender, checked as boolean)}
                  />
                  <Label htmlFor={gender} className="text-sm text-muted-foreground cursor-pointer">
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PremiumFeature>

        {/* Mentor Filter - Premium Only */}
        <PremiumFeature>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="mentor-filter" className="text-sm font-medium text-foreground">
                Mentor Filter
              </Label>
              <Switch
                id="mentor-filter"
                checked={filters.mentorOnly}
                onCheckedChange={(checked) => updateFilters("mentorOnly", checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Show only teachers willing to teach without return (🌟 Mentors)
            </p>
          </div>
        </PremiumFeature>

        {/* Premium Upgrade CTA */}
        {!isPremium && (
          <div className="p-4 bg-gradient-primary rounded-lg text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-white" />
            <h4 className="text-sm font-semibold text-white mb-2">
              Unlock All Filters
            </h4>
            <p className="text-xs text-white/90 mb-3">
              Get access to skill level, rating, gender, and mentor filters with Premium.
            </p>
            <Button variant="hero" size="sm" className="bg-white text-primary hover:bg-white/90 w-full">
              Upgrade to Premium
            </Button>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-1">
              {filters.country && (
                <Badge variant="secondary" className="text-xs">
                  {filters.country}
                </Badge>
              )}
              {filters.skillLevel && (
                <Badge variant="secondary" className="text-xs">
                  {filters.skillLevel}
                </Badge>
              )}
              {filters.rating && (
                <Badge variant="secondary" className="text-xs">
                  {ratingOptions.find(r => r.value === filters.rating)?.label}
                </Badge>
              )}
              {filters.gender.map(g => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
              {filters.mentorOnly && (
                <Badge variant="secondary" className="text-xs">
                  🌟 Mentors Only
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};