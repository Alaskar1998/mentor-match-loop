import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterButtonProps {
  onClick: () => void;
  isOpen: boolean;
  activeFiltersCount: number;
  disabled?: boolean;
}

export const FilterButton = ({ onClick, isOpen, activeFiltersCount, disabled = false }: FilterButtonProps) => {
  return (
    <Button
      id="filter-button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 transition-all duration-200 ${
        isOpen ? 'bg-primary text-primary-foreground border-primary' : ''
      } ${disabled ? 'border-orange-500 text-orange-600 hover:bg-orange-50 opacity-60 cursor-not-allowed' : ''}`}
    >
      <Filter className="w-4 h-4" />
      <span className="hidden sm:inline">
        Filters
      </span>
      {activeFiltersCount > 0 && !disabled && (
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );
}; 