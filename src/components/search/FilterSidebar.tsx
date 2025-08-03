import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

import { X, Filter, Crown } from 'lucide-react';
import { SearchFilters } from '@/pages/SearchResults';
import { useLanguage } from '@/hooks/useLanguage';
import { translateCountry } from '@/utils/translationUtils';
import { useNavigate } from 'react-router-dom';

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

export const FilterSidebar = ({ filters, onFiltersChange, isPremium, isOpen, onClose }: FilterSidebarProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('🔍 FilterSidebar Debug:', {
    isPremium,
    shouldShowUpgradeBanner: !isPremium,
    isOpen
  });
  
  // Allow filter changes only for premium users
  const updateFilters = (key: keyof SearchFilters, value: any) => {
    if (!isPremium) return; // Block all filter updates for free users
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateGenderFilter = (gender: string, checked: boolean) => {
    if (!isPremium) return; // Block gender filter updates for free users
    const newGenderFilters = checked
      ? [...filters.gender, gender]
      : filters.gender.filter(g => g !== gender);
    onFiltersChange({ ...filters, gender: newGenderFilters });
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
          </CardHeader>

          <CardContent className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)] lg:h-[calc(100vh-200px)]">
            {/* Premium Upgrade Banner for Free Users */}
            {!isPremium && (
              <Card className="border-orange-200 bg-orange-50/50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-orange-600" />
                    <h3 className="font-semibold text-orange-800 text-sm">Upgrade to Premium</h3>
                  </div>
                  <p className="text-xs text-orange-700 mb-3">
                    Advanced filtering is available with Premium. Upgrade to filter by country, gender, and more.
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                    onClick={handleUpgrade}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Country Filter - Show but disabled for free users */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Country
              </Label>
              <select
                value={filters.country}
                onChange={(e) => updateFilters("country", e.target.value)}
                disabled={!isPremium}
                className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground ${
                  !isPremium ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{translateCountry(country, language)}</option>
                ))}
              </select>
              {!isPremium && (
                <p className="text-xs text-muted-foreground">
                  Available with Premium
                </p>
              )}
            </div>

            {/* Skill Level Filter - Available for all users */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Skill Level
              </Label>
              <select
                value={filters.skillLevel}
                onChange={(e) => updateFilters("skillLevel", e.target.value)}
                disabled={!isPremium}
                className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground ${
                  !isPremium ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Any Level</option>
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {!isPremium && (
                <p className="text-xs text-muted-foreground">
                  Available with Premium
                </p>
              )}
            </div>

            {/* Rating Filter - Available for all users */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Minimum Rating
              </Label>
              <select
                value={filters.rating}
                onChange={(e) => updateFilters("rating", e.target.value)}
                disabled={!isPremium}
                className={`w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground ${
                  !isPremium ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {!isPremium && (
                <p className="text-xs text-muted-foreground">
                  Available with Premium
                </p>
              )}
            </div>

            {/* Gender Filter - Show but disabled for free users */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Gender
              </Label>
              <div className="space-y-2">
                {genderOptions.map(gender => (
                  <div key={gender} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gender-${gender}`}
                      checked={filters.gender.includes(gender)}
                      onCheckedChange={(checked) => updateGenderFilter(gender, checked as boolean)}
                      disabled={!isPremium}
                    />
                    <Label
                      htmlFor={`gender-${gender}`}
                      className={`text-sm ${!isPremium ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      {gender}
                    </Label>
                  </div>
                ))}
              </div>
              {!isPremium && (
                <p className="text-xs text-muted-foreground">
                  Available with Premium
                </p>
              )}
            </div>

            {/* Mentor Only Filter - Show but disabled for free users */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Mentors Only
                </Label>
                <Switch
                  checked={filters.mentorOnly}
                  onCheckedChange={(checked) => updateFilters("mentorOnly", checked)}
                  disabled={!isPremium}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Show only users willing to teach without expecting anything in return
              </p>
              {!isPremium && (
                <p className="text-xs text-primary">
                  Available with Premium
                </p>
              )}
            </div>

            {/* Active Filters Summary & Clear All */}
            <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Filters</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    disabled={!isPremium}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-1">
                  {filters.country && (
                    <Badge variant="secondary" className="text-xs">
                      Country: {translateCountry(filters.country, language)}
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}; 