import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X, Filter, Lock } from 'lucide-react';
import { SearchFilters } from '@/pages/SearchResults';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isPremium: boolean;
  isOpen: boolean;
  onClose: () => void;
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

// Premium lock indicator component
const PremiumLockIndicator = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    {children}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Lock className="w-4 h-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Premium Feature – Unlock with Premium</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export const FilterSidebar = ({ filters, onFiltersChange, isPremium, isOpen, onClose }: FilterSidebarProps) => {
  // Block all filter updates for free users
  const updateFilters = (key: keyof SearchFilters, value: any) => {
    if (!isPremium) return;
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateGenderFilter = (gender: string, checked: boolean) => {
    if (!isPremium) return;
    const newGenderFilters = checked
      ? [...filters.gender, gender]
      : filters.gender.filter(g => g !== gender);
    onFiltersChange({ ...filters, gender: newGenderFilters });
  };

  const clearAllFilters = () => {
    if (!isPremium) return;
    onFiltersChange({
      country: "",
      skillLevel: "",
      rating: "",
      gender: [],
      mentorOnly: false
    });
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('filter-sidebar');
      const filterButton = document.getElementById('filter-button');
      
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          filterButton && !filterButton.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div
        id="filter-sidebar"
        className={`fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Card className="h-full rounded-none border-0 shadow-none">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Premium status badge */}
            {!isPremium && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-200 mt-2">
                Free Plan - All Filters Locked
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)] lg:h-[calc(100vh-200px)]">
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

            {/* Skill Level Filter */}
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
                <option value="">Any Level</option>
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
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
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
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
                      id={`gender-${gender}`}
                      checked={filters.gender.includes(gender)}
                      onCheckedChange={(checked) => updateGenderFilter(gender, checked as boolean)}
                      disabled={!isPremium}
                      className={!isPremium ? 'opacity-50' : ''}
                    />
                    <Label
                      htmlFor={`gender-${gender}`}
                      className={`text-sm ${!isPremium ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {gender}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentor Only Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <PremiumLockIndicator>
                  <Label className={`text-sm font-medium ${!isPremium ? 'text-muted-foreground' : 'text-foreground'}`}>
                    Mentors Only
                  </Label>
                </PremiumLockIndicator>
                <Switch
                  checked={filters.mentorOnly}
                  onCheckedChange={(checked) => updateFilters("mentorOnly", checked)}
                  disabled={!isPremium}
                  className={!isPremium ? 'opacity-50' : ''}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Show only users willing to teach without expecting anything in return
              </p>
            </div>

            {/* Premium Upgrade CTA for Free Users */}
            {!isPremium && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Unlock All Filters</h4>
                <p className="text-xs text-blue-700 mb-3">
                  Upgrade to Premium to use country, skill level, rating, gender, and mentor filters.
                </p>
                <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Upgrade to Premium - $4.99/month
                </Button>
              </div>
            )}

            {/* Active Filters Summary & Clear All - Premium Only */}
            {isPremium && (
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Filters</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-1">
                  {filters.country && (
                    <Badge variant="secondary" className="text-xs">
                      Country: {filters.country}
                    </Badge>
                  )}
                  {filters.skillLevel && (
                    <Badge variant="secondary" className="text-xs">
                      Level: {filters.skillLevel}
                    </Badge>
                  )}
                  {filters.rating && (
                    <Badge variant="secondary" className="text-xs">
                      Rating: {filters.rating}⭐+
                    </Badge>
                  )}
                  {filters.gender.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Gender: {filters.gender.join(', ')}
                    </Badge>
                  )}
                  {filters.mentorOnly && (
                    <Badge variant="secondary" className="text-xs">
                      Mentors Only
                    </Badge>
                  )}
                  {!filters.country && !filters.skillLevel && !filters.rating && 
                   filters.gender.length === 0 && !filters.mentorOnly && (
                    <span className="text-xs text-muted-foreground">No active filters</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 