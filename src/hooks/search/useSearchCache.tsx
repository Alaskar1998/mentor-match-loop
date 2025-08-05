/**
 * @file useSearchCache.tsx
 * @description Hook for managing search result caching
 */

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

/**
 * @interface CacheEntry
 * @description Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  query: string;
}

/**
 * @interface UseSearchCacheOptions
 * @description Options for search cache hook
 */
interface UseSearchCacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
}

/**
 * @interface UseSearchCacheReturn
 * @description Return type for search cache hook
 */
interface UseSearchCacheReturn<T> {
  get: (query: string) => T | null;
  set: (query: string, data: T) => void;
  clear: () => void;
  has: (query: string) => boolean;
  size: number;
}

/**
 * @hook useSearchCache
 * @description Manages search result caching with TTL and size limits
 * 
 * @param {UseSearchCacheOptions} options - Cache configuration options
 * @param {number} options.maxSize - Maximum number of cache entries (default: 50)
 * @param {number} options.ttl - Time to live for cache entries in milliseconds (default: 5 minutes)
 * 
 * @returns {UseSearchCacheReturn<T>} Cache management functions and state
 * 
 * @example
 * const { get, set, clear, has, size } = useSearchCache({
 *   maxSize: 100,
 *   ttl: 300000 // 5 minutes
 * });
 */
export const useSearchCache = <T>(options: UseSearchCacheOptions = {}): UseSearchCacheReturn<T> => {
  const { maxSize = 50, ttl = 5 * 60 * 1000 } = options;
  const [size, setSize] = useState(0);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  /**
   * @function cleanupExpiredEntries
   * @description Removes expired cache entries
   */
  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        cache.delete(key);
      }
    }
    
    setSize(cache.size);
  }, [ttl]);

  /**
   * @function evictOldestEntry
   * @description Removes the oldest cache entry when cache is full
   */
  const evictOldestEntry = useCallback(() => {
    const cache = cacheRef.current;
    if (cache.size >= maxSize) {
      let oldestKey: string | null = null;
      let oldestTimestamp = Date.now();

      for (const [key, entry] of cache.entries()) {
        if (entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        cache.delete(oldestKey);
        logger.debug('Evicted oldest cache entry:', oldestKey);
      }
    }
  }, [maxSize]);

  /**
   * @function get
   * @description Retrieves data from cache
   */
  const get = useCallback((query: string): T | null => {
    cleanupExpiredEntries();
    
    const cache = cacheRef.current;
    const entry = cache.get(query);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(query);
      setSize(cache.size);
      return null;
    }

    // Move to end (LRU behavior)
    cache.delete(query);
    cache.set(query, entry);
    
    return entry.data;
  }, [cleanupExpiredEntries, ttl]);

  /**
   * @function set
   * @description Stores data in cache
   */
  const set = useCallback((query: string, data: T) => {
    cleanupExpiredEntries();
    
    const cache = cacheRef.current;
    
    // Remove existing entry if it exists
    if (cache.has(query)) {
      cache.delete(query);
    }
    
    // Evict oldest entry if cache is full
    evictOldestEntry();
    
    // Add new entry
    cache.set(query, {
      data,
      timestamp: Date.now(),
      query,
    });
    
    setSize(cache.size);
    logger.debug('Cached search result for query:', query);
  }, [cleanupExpiredEntries, evictOldestEntry]);

  /**
   * @function clear
   * @description Clears all cache entries
   */
  const clear = useCallback(() => {
    cacheRef.current.clear();
    setSize(0);
    logger.debug('Search cache cleared');
  }, []);

  /**
   * @function has
   * @description Checks if query exists in cache and is not expired
   */
  const has = useCallback((query: string): boolean => {
    cleanupExpiredEntries();
    
    const cache = cacheRef.current;
    const entry = cache.get(query);
    
    if (!entry) {
      return false;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(query);
      setSize(cache.size);
      return false;
    }

    return true;
  }, [cleanupExpiredEntries, ttl]);

  return {
    get,
    set,
    clear,
    has,
    size,
  };
}; 