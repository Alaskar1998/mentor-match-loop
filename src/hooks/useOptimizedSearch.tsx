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

    // Improved cache key generation - include user count and user IDs hash
    const userHash = userList.length > 0 ? 
      userList.slice(0, 3).map(u => u.id || u.name).join('_') : 'empty';
    const cacheKey = `${term.toLowerCase().trim()}_${userList.length}_${userHash}`;
    
    console.log('🔍 DEBUG: Search term:', term);
    console.log('🔍 DEBUG: Cache key:', cacheKey);
    console.log('🔍 DEBUG: Cache size:', cacheRef.current.size);
    console.log('🔍 DEBUG: Cache has key:', cacheRef.current.has(cacheKey));
    console.log('🔍 DEBUG: Available cache keys:', Array.from(cacheRef.current.keys()));
    
    if (cacheResults && cacheRef.current.has(cacheKey)) {
      console.log('🔍 DEBUG: Using cached result for:', cacheKey);
      const cached = cacheRef.current.get(cacheKey)!;
      setResults(cached.results.map(r => r.user));
      setSearchResponse(cached);
      return;
    }

    console.log('🔍 DEBUG: Performing fresh search for:', term);
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
      
      console.log('🔍 DEBUG: Search completed. Found', response.results.length, 'results');
      
      // Cache the result
      if (cacheResults) {
        if (cacheRef.current.size >= maxCacheSize) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
          console.log('🔍 DEBUG: Evicted cache entry:', firstKey);
        }
        cacheRef.current.set(cacheKey, response);
        console.log('🔍 DEBUG: Cached result for:', cacheKey);
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
    console.log('🔍 DEBUG: Users updated in useOptimizedSearch:', users.length);
    usersRef.current = users;
    // Clear cache when users change to ensure fresh results
    if (cacheResults) {
      cacheRef.current.clear();
      console.log('🔍 DEBUG: Cache cleared due to users update');
    }
  }, [users, cacheResults]);

  const updateSearchTerm = useCallback((term: string) => {
    console.log('🔍 DEBUG: Updating search term from:', searchTerm, 'to:', term);
    setSearchTerm(term);
  }, [searchTerm]);

  const clearCache = useCallback(() => {
    console.log('🔍 DEBUG: Manually clearing cache');
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