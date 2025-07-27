import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
const genderOptions = ["Male", "Female"];

export const FilterBar = ({ filters, onFiltersChange, isPremium }: FilterBarProps) => {
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // For free users, we don't allow any filter changes
  const updateFilters = (key: keyof SearchFilters, value: any) => {
    if (!isPremium) return; // Block all filter updates for free users
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateGenderFilter = (gender: string, checked: boolean) => {
    if (!isPremium) return; // Block gender filter updates for free users
    const newGender = checked 
      ? [...filters.gender, gender]
      : filters.gender.filter(g => g !== gender);
    onFiltersChange({ ...filters, gender: newGender });
  };

  const clearAllFilters = () => {
    if (!isPremium) return; // Block clearing filters for free users
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

  // Component to show premium lock indicator
  const PremiumLockIndicator = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      {children}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Lock className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Unlock with Premium</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <Card className="sticky top-6 shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {isPremium && hasActiveFilters && (
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
          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
            Free Plan - All Filters Locked
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Country Filter - Premium Only */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className={`text-sm font-medium ${!isPremium ? 'text-muted-foreground' : 'text-foreground'}`}>
              Country
            </Label>
          </PremiumLockIndicator>
          <select
            value={filters.country}
            onChange={(e) => updateFilters("country", e.target.value)}
            disabled={!isPremium}
            className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              isPremium 
                ? 'bg-background text-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Skill Level Filter - Always Visible, Disabled for Free */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className={`text-sm font-medium ${!isPremium ? 'text-muted-foreground' : 'text-foreground'}`}>
              Skill Level
            </Label>
          </PremiumLockIndicator>
          <select
            value={filters.skillLevel}
            onChange={(e) => updateFilters("skillLevel", e.target.value)}
            disabled={!isPremium}
            className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              isPremium 
                ? 'bg-background text-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            <option value="">All Levels</option>
            {skillLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Rating Filter - Always Visible, Disabled for Free */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className={`text-sm font-medium ${!isPremium ? 'text-muted-foreground' : 'text-foreground'}`}>
              Minimum Rating
            </Label>
          </PremiumLockIndicator>
          <select
            value={filters.rating}
            onChange={(e) => updateFilters("rating", e.target.value)}
            disabled={!isPremium}
            className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              isPremium 
                ? 'bg-background text-foreground' 
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            <option value="">Any Rating</option>
            {ratingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Gender Filter - Always Visible, Disabled for Free */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className={`text-sm font-medium ${!isPremium ? 'text-muted-foreground' : 'text-foreground'}`}>
              Gender
            </Label>
          </PremiumLockIndicator>
          <div className="space-y-2">
            {genderOptions.map(gender => (
              <div key={gender} className="flex items-center space-x-2">
                <Checkbox
                  id={gender}
                  checked={filters.gender.includes(gender)}
                  onCheckedChange={(checked) => updateGenderFilter(gender, checked as boolean)}
                  disabled={!isPremium}
                  className={!isPremium ? 'opacity-50 cursor-not-allowed' : ''}
                />
                <Label 
                  htmlFor={gender} 
                  className={`text-sm cursor-pointer ${
                    isPremium ? 'text-muted-foreground' : 'text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {gender}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Filter - Always Visible, Disabled for Free */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <PremiumLockIndicator>
              <Label htmlFor="mentor-filter" className={`text-sm font-medium ${!isPremium ? 'text-muted-foreground' : 'text-foreground'}`}>
                Mentor Filter
              </Label>
            </PremiumLockIndicator>
            <Switch
              id="mentor-filter"
              checked={filters.mentorOnly}
              onCheckedChange={(checked) => updateFilters("mentorOnly", checked)}
              disabled={!isPremium}
              className={!isPremium ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Show only teachers willing to teach without return (🌟 Mentors)
          </p>
        </div>

        {/* Premium Upgrade CTA */}
        {!isPremium && (
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Unlock All Filters
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Upgrade to Premium to use country, skill level, rating, gender, and mentor filters.
            </p>
            <Button size="sm" className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium - $4.99/mo
            </Button>
          </div>
        )}

        {/* Active Filters Summary - Only for Premium Users */}
        {isPremium && hasActiveFilters && (
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