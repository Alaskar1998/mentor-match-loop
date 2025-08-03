import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Crown, Lock } from 'lucide-react';
import { SearchFilters } from '@/pages/SearchResults';
import { useLanguage } from '@/hooks/useLanguage';
import { translateCountry } from '@/utils/translationUtils';
import { useNavigate } from 'react-router-dom';

interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isPremium: boolean;
}

// Filter options
const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France", 
  "Australia", "Japan", "Brazil", "India", "Mexico", "Italy", "Spain",
  "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland",
  "Austria", "Belgium", "Portugal", "Greece", "Poland", "Czech Republic",
  "Hungary", "Slovakia", "Slovenia", "Croatia", "Serbia", "Bulgaria",
  "Romania", "Ukraine", "Russia", "Turkey", "Israel", "Saudi Arabia",
  "UAE", "Egypt", "South Africa", "Nigeria", "Kenya", "Morocco",
  "Argentina", "Chile", "Colombia", "Peru", "Venezuela", "Uruguay",
  "Paraguay", "Bolivia", "Ecuador", "Guyana", "Suriname", "French Guiana"
];

const skillLevels = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Expert", value: "Expert" }
];

const ratingOptions = [
  { label: "Any Rating", value: "" },
  { label: "4⭐+", value: "4" },
  { label: "3⭐+", value: "3" }
];

const genderOptions = ["Male", "Female"];

export const FilterBar = ({ filters, onFiltersChange, isPremium }: FilterBarProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
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

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const hasActiveFilters = filters.country || filters.skillLevel || filters.rating || 
                          filters.gender.length > 0 || filters.mentorOnly;

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const PremiumLockIndicator = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      {children}
      {!isPremium && <Lock className="w-3 h-3 text-muted-foreground" />}
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Advanced Filters
          {!isPremium && <Badge variant="secondary" className="text-xs">Premium</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Country Filter - Disabled for Free Users */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className="text-sm font-medium">Country</Label>
          </PremiumLockIndicator>
          <select
            value={filters.country}
            onChange={(e) => updateFilters("country", e.target.value)}
            disabled={!isPremium}
            className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground ${
              !isPremium ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">All Countries</option>
            {filteredCountries.map(country => (
              <option key={country} value={country}>{translateCountry(country, language)}</option>
            ))}
          </select>
        </div>

        {/* Skill Level Filter - Disabled for Free Users */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className="text-sm font-medium">Skill Level</Label>
          </PremiumLockIndicator>
          <select
            value={filters.skillLevel}
            onChange={(e) => updateFilters("skillLevel", e.target.value)}
            disabled={!isPremium}
            className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground ${
              !isPremium ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Any Level</option>
            {skillLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        {/* Rating Filter - Disabled for Free Users */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className="text-sm font-medium">Minimum Rating</Label>
          </PremiumLockIndicator>
          <select
            value={filters.rating}
            onChange={(e) => updateFilters("rating", e.target.value)}
            disabled={!isPremium}
            className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground ${
              !isPremium ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {ratingOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Gender Filter - Disabled for Free Users */}
        <div className="space-y-3">
          <PremiumLockIndicator>
            <Label className="text-sm font-medium">Gender</Label>
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
            <Button size="sm" className="w-full" onClick={handleUpgrade}>
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