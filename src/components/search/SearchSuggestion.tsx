import { Button } from "@/components/ui/button";
import { SearchSuggestion } from "@/services/searchService";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchSuggestionProps {
  suggestion: SearchSuggestion;
  onSuggestionClick: (suggestedTerm: string) => void;
  onDismiss?: () => void;
}

export const SearchSuggestionCard = ({ 
  suggestion, 
  onSuggestionClick, 
  onDismiss 
}: SearchSuggestionProps) => {
  const { t } = useTranslation();
  const confidencePercentage = Math.round(suggestion.confidence * 100);
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-blue-600">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm text-blue-800">
              {t('actions.didYouMean')} <button 
                onClick={() => onSuggestionClick(suggestion.suggestedTerm)}
                className="font-medium text-blue-900 hover:text-blue-700 underline cursor-pointer"
              >
                {suggestion.suggestedTerm}
              </button>?
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {confidencePercentage}% {t('actions.confidence')}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

interface NoResultsMessageProps {
  searchTerm: string;
  suggestion?: SearchSuggestion;
  onSuggestionClick: (suggestedTerm: string) => void;
}

export const NoResultsMessage = ({ 
  searchTerm, 
  suggestion, 
  onSuggestionClick 
}: NoResultsMessageProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">{t('actions.noResultsFound')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('actions.couldntFindTeachers')} <span className="font-medium">"{searchTerm}"</span>
        </p>
        
        {suggestion && (
          <div className="mb-6">
            <SearchSuggestionCard
              suggestion={suggestion}
              onSuggestionClick={onSuggestionClick}
            />
          </div>
        )}
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• {t('actions.tryDifferentKeywords')}</p>
          <p>• {t('actions.checkSpelling')}</p>
          <p>• {t('actions.removeFilters')}</p>
          <p>• {t('actions.browseAllSkills')}</p>
        </div>
      </div>
    </div>
  );
}; 