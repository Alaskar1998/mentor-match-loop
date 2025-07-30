import { useState, useEffect, useCallback, useRef } from 'react';
import { searchService, SearchResponse } from '@/services/searchService';

interface UseOptimizedSearchOptions {
  debounceMs?: number;
  cacheResults?: boolean;
  maxCacheSize?: number;
}

export const useOptimizedSearch = (options: UseOptimizedSearchOptions = {}) => {
  const { debounceMs = 300, cacheResults = true, maxCacheSize = 50 } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, SearchResponse>>(new Map());
  const usersRef = useRef<any[]>([]);

  // Debounced search function
  const performSearch = useCallback(async (term: string, userList: any[]) => {
    if (!term.trim()) {
      setResults([]);
      setSearchResponse(null);
      return;
    }

    // Check cache first
    const cacheKey = `${term}_${userList.length}`;
    if (cacheResults && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setResults(cached.results.map(r => r.user));
      setSearchResponse(cached);
      return;
    }

    setIsLoading(true);
    try {
      // Fix: Properly await the async search method
      const response = await searchService.search(userList, term);
      
      // Add null check for response
      if (!response || !response.results) {
        console.warn('SearchService returned invalid response:', response);
        setResults([]);
        setSearchResponse(null);
        return;
      }
      
      // Cache the result
      if (cacheResults) {
        if (cacheRef.current.size >= maxCacheSize) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(cacheKey, response);
      }

      setResults(response.results.map(r => r.user));
      setSearchResponse(response);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSearchResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, [cacheResults, maxCacheSize]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchTerm, usersRef.current);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, performSearch, debounceMs]);

  // Update users reference
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    searchTerm,
    results,
    searchResponse,
    isLoading,
    users,
    setUsers,
    updateSearchTerm,
    clearCache,
    performSearch: (term: string) => performSearch(term, usersRef.current)
  };
}; 