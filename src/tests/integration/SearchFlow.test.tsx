/**
 * @file SearchFlow.test.tsx
 * @description Integration tests for the search functionality
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchResults } from '@/components/search/SearchResults';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { FilterBar } from '@/components/search/FilterBar';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { useSearchCache } from '@/hooks/search/useSearchCache';
import { useSearchDebounce } from '@/hooks/search/useSearchDebounce';

// Mock dependencies
jest.mock('@/hooks/useOptimizedSearch');
jest.mock('@/hooks/search/useSearchCache');
jest.mock('@/hooks/search/useSearchDebounce');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

const mockUseOptimizedSearch = useOptimizedSearch as jest.MockedFunction<
  typeof useOptimizedSearch
>;
const mockUseSearchCache = useSearchCache as jest.MockedFunction<
  typeof useSearchCache
>;
const mockUseSearchDebounce = useSearchDebounce as jest.MockedFunction<
  typeof useSearchDebounce
>;

describe('Search Flow Integration', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      bio: 'Software Developer',
      skillsToTeach: ['JavaScript', 'React'],
      skillsToLearn: ['Python'],
      rating: 4.5,
      exchangeCount: 10,
    },
    {
      id: '2',
      name: 'Jane Smith',
      bio: 'UX Designer',
      skillsToTeach: ['Figma', 'UI/UX'],
      skillsToLearn: ['JavaScript'],
      rating: 4.8,
      exchangeCount: 15,
    },
  ];

  const defaultSearchState = {
    users: [],
    loading: false,
    error: null,
    search: jest.fn(),
    clearResults: jest.fn(),
    hasMore: false,
    loadMore: jest.fn(),
  };

  const defaultCacheState = {
    getCachedResults: jest.fn(),
    setCachedResults: jest.fn(),
    clearCache: jest.fn(),
    isCached: jest.fn(),
  };

  const defaultDebounceState = {
    debouncedQuery: '',
    setQuery: jest.fn(),
    clearQuery: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOptimizedSearch.mockReturnValue(defaultSearchState);
    mockUseSearchCache.mockReturnValue(defaultCacheState);
    mockUseSearchDebounce.mockReturnValue(defaultDebounceState);
  });

  describe('Search Results Integration', () => {
    it('should display search results with user cards', async () => {
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: mockUsers,
        loading: false,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Software Developer')).toBeInTheDocument();
        expect(screen.getByText('UX Designer')).toBeInTheDocument();
      });
    });

    it('should handle loading states correctly', async () => {
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: [],
        loading: true,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should handle empty results', async () => {
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: [],
        loading: false,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it('should handle search errors', async () => {
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: [],
        loading: false,
        error: 'Search failed',
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filter Integration', () => {
    it('should apply filters and trigger new search', async () => {
      const mockSearch = jest.fn();
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        search: mockSearch,
      });

      render(
        <BrowserRouter>
          <FilterSidebar />
        </BrowserRouter>
      );

      // Apply skill filter
      const skillFilter = screen.getByLabelText(/javascript/i);
      fireEvent.click(skillFilter);

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: ['JavaScript'],
          })
        );
      });
    });

    it('should clear filters and reset search', async () => {
      const mockClearResults = jest.fn();
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        clearResults: mockClearResults,
      });

      render(
        <BrowserRouter>
          <FilterSidebar />
        </BrowserRouter>
      );

      const clearFiltersButton = screen.getByRole('button', {
        name: /clear filters/i,
      });
      fireEvent.click(clearFiltersButton);

      await waitFor(() => {
        expect(mockClearResults).toHaveBeenCalled();
      });
    });
  });

  describe('Search Bar Integration', () => {
    it('should debounce search queries', async () => {
      const mockSetQuery = jest.fn();
      mockUseSearchDebounce.mockReturnValue({
        ...defaultDebounceState,
        setQuery: mockSetQuery,
      });

      render(
        <BrowserRouter>
          <FilterBar />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText(/search users/i);
      fireEvent.change(searchInput, { target: { value: 'developer' } });

      await waitFor(() => {
        expect(mockSetQuery).toHaveBeenCalledWith('developer');
      });
    });

    it('should clear search when input is cleared', async () => {
      const mockClearQuery = jest.fn();
      mockUseSearchDebounce.mockReturnValue({
        ...defaultDebounceState,
        clearQuery: mockClearQuery,
      });

      render(
        <BrowserRouter>
          <FilterBar />
        </BrowserRouter>
      );

      const searchInput = screen.getByPlaceholderText(/search users/i);
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(mockClearQuery).toHaveBeenCalled();
      });
    });
  });

  describe('Cache Integration', () => {
    it('should use cached results when available', async () => {
      mockUseSearchCache.mockReturnValue({
        ...defaultCacheState,
        getCachedResults: jest.fn().mockReturnValue(mockUsers),
        isCached: jest.fn().mockReturnValue(true),
      });

      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: mockUsers,
        loading: false,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should cache new search results', async () => {
      const mockSetCachedResults = jest.fn();
      mockUseSearchCache.mockReturnValue({
        ...defaultCacheState,
        setCachedResults: mockSetCachedResults,
        isCached: jest.fn().mockReturnValue(false),
      });

      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: mockUsers,
        loading: false,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockSetCachedResults).toHaveBeenCalledWith(mockUsers);
      });
    });
  });

  describe('Pagination Integration', () => {
    it('should load more results when scrolling', async () => {
      const mockLoadMore = jest.fn();
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: mockUsers,
        hasMore: true,
        loadMore: mockLoadMore,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      // Simulate scroll to bottom
      const scrollEvent = new Event('scroll');
      Object.defineProperty(window, 'scrollY', { value: 1000 });
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
      });
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: 500,
      });

      window.dispatchEvent(scrollEvent);

      await waitFor(() => {
        expect(mockLoadMore).toHaveBeenCalled();
      });
    });

    it('should not load more when no more results', async () => {
      const mockLoadMore = jest.fn();
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        users: mockUsers,
        hasMore: false,
        loadMore: mockLoadMore,
      });

      render(
        <BrowserRouter>
          <SearchResults />
        </BrowserRouter>
      );

      // Simulate scroll to bottom
      const scrollEvent = new Event('scroll');
      window.dispatchEvent(scrollEvent);

      await waitFor(() => {
        expect(mockLoadMore).not.toHaveBeenCalled();
      });
    });
  });

  describe('Cross-Component State Management', () => {
    it('should maintain filter state across components', async () => {
      const mockSearch = jest.fn();
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        search: mockSearch,
      });

      render(
        <BrowserRouter>
          <div>
            <FilterSidebar />
            <FilterBar />
          </div>
        </BrowserRouter>
      );

      // Apply filter from sidebar
      const skillFilter = screen.getByLabelText(/javascript/i);
      fireEvent.click(skillFilter);

      // Apply search from search bar
      const searchInput = screen.getByPlaceholderText(/search users/i);
      fireEvent.change(searchInput, { target: { value: 'developer' } });

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            skills: ['JavaScript'],
            query: 'developer',
          })
        );
      });
    });

    it('should handle concurrent filter and search operations', async () => {
      const mockSearch = jest.fn();
      mockUseOptimizedSearch.mockReturnValue({
        ...defaultSearchState,
        search: mockSearch,
      });

      render(
        <BrowserRouter>
          <div>
            <FilterSidebar />
            <FilterBar />
          </div>
        </BrowserRouter>
      );

      // Rapidly apply multiple filters and searches
      const skillFilter = screen.getByLabelText(/javascript/i);
      const searchInput = screen.getByPlaceholderText(/search users/i);

      fireEvent.click(skillFilter);
      fireEvent.change(searchInput, { target: { value: 'developer' } });
      fireEvent.change(searchInput, { target: { value: 'designer' } });

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledTimes(3);
      });
    });
  });
});
