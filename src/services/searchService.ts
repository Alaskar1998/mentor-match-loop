import { getAllSkills, searchSkillsBilingual, findSkillByTranslation, getSkillTranslation } from "@/data/skills";
import { logger } from '@/utils/logger';

export interface SearchResult {
  user: any;
  matchType: 'exact' | 'prefix' | 'suffix' | 'partial';
  matchedSkills: string[];
}

export interface SearchSuggestion {
  suggestedTerm: string;
  confidence: number;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestion?: SearchSuggestion;
  totalFound: number;
  searchTerm: string;
  hasExactMatches: boolean;
}

class SearchService {
  private allSkills: Set<string> = new Set();
  private searchLog: Array<{ term: string; timestamp: Date; results: number }> = [];
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Initialize with all available skills for suggestion generation
  async initialize(users: any[]) {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize(users);
    await this.initializationPromise;
  }

  private async _initialize(users: any[]) {
    logger.debug('SearchService: Initializing with', users.length, 'users');
    
    // Extract all unique skills for suggestion generation
    this.allSkills.clear();
    users.forEach(user => {
      if (Array.isArray(user.skills)) {
        user.skills.forEach((skill: string) => {
          if (skill && typeof skill === 'string') {
            this.allSkills.add(skill.toLowerCase());
          }
        });
      }
    });
    
    // Add centralized skills from our master data
    const centralizedSkills = getAllSkills();
    centralizedSkills.forEach(skill => {
      this.allSkills.add(skill.toLowerCase());
    });
    
    // Add common skill variations and synonyms
    const commonSkills = [
      'writing', 'write', 'written',
      'javascript', 'js', 'ecmascript',
      'python', 'py',
      'react', 'reactjs',
      'node', 'nodejs',
      'html', 'css',
      'git', 'github',
      'sql', 'database',
      'api', 'rest',
      'design', 'ui', 'ux',
      'marketing', 'seo',
      'photography', 'photo',
      'cooking', 'baking',
      'guitar', 'piano', 'music',
      'fitness', 'workout',
      'yoga', 'meditation',
      'language', 'english', 'spanish', 'french', 'german',
      'business', 'entrepreneurship', 'startup',
      'finance', 'investment',
      'art', 'drawing', 'painting'
    ];
    
    commonSkills.forEach(skill => {
      this.allSkills.add(skill.toLowerCase());
    });
    
    logger.debug('SearchService: Extracted skills:', Array.from(this.allSkills));
    this.isInitialized = true;
  }

  // Main search function - NO fuzzy matching, only exact and partial
  async search(users: any[], searchTerm: string): Promise<SearchResponse> {
    if (!searchTerm.trim()) {
      return {
        results: [],
        suggestion: undefined,
        totalFound: 0,
        searchTerm: searchTerm.trim(),
        hasExactMatches: false
      };
    }

    const term = searchTerm.toLowerCase().trim();
    
    // Log search term for analytics
    this.logSearchTerm(term);

    logger.debug('SearchService: Searching for term:', term);
    logger.debug('SearchService: Users available:', users.length);

    // Initialize if not already done
    if (!this.isInitialized) {
      await this.initialize(users);
    }

    // Perform bilingual search
    const results = this.performBilingualSearch(users, term);
    
    // DEBUG: For "Advertising" search, show all users to debug
    if (term === 'advertising') {
      // console.log('🔍 DEBUG: Searching for "advertising" - showing all users for debugging');
      const debugResults = users.map(user => ({
        user,
        matchedSkills: user.skills,
        matchType: 'debug' as any
      }));
      logger.debug('🔍 DEBUG: All users for advertising search:', debugResults);
      
      // Also check what the popular skills function would see
      logger.debug('🔍 DEBUG: Checking what popular skills function sees...');
      const skillCounts: { [key: string]: number } = {};
      users.forEach(user => {
        if (Array.isArray(user.skills)) {
          user.skills.forEach((skill: string) => {
            if (skill && typeof skill === 'string') {
              const normalizedSkillName = skill.trim();
              if (normalizedSkillName) {
                skillCounts[normalizedSkillName] = (skillCounts[normalizedSkillName] || 0) + 1;
              }
            }
          });
        }
      });
      logger.debug('🔍 DEBUG: Skill counts from search users:', skillCounts);
              // console.log('🔍 DEBUG: "Advertising" count in search users:', skillCounts['Advertising'] || 0);
    }
    
    // Generate suggestion ONLY if no results found
    const suggestion = results.length === 0 ? this.generateSuggestion(term) : undefined;
    
    // Determine if we have exact matches
    const hasExactMatches = results.some(result => result.matchType === 'exact');

    return {
      results,
      suggestion,
      totalFound: results.length,
      searchTerm: term,
      hasExactMatches
    };
  }

  // Perform bilingual search (English and Arabic)
  private performBilingualSearch(users: any[], searchTerm: string): SearchResult[] {
    const results: SearchResult[] = [];

    // First, try to find English skill names that match the search term
    const matchingEnglishSkills = searchSkillsBilingual(searchTerm);
    logger.debug('SearchService: Searching for term:', searchTerm);
    logger.debug('SearchService: Bilingual search found skills:', matchingEnglishSkills);
    logger.debug('SearchService: Total users to search:', users.length);
    
    // Debug: Check if search term is in the skills list
    const allSkills = getAllSkills();
          // console.log(`SearchService: "${searchTerm}" in skills list:`, allSkills.includes(searchTerm));
      // console.log(`SearchService: All skills containing "${searchTerm}":`, allSkills.filter(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));

          // console.log('🔍 DEBUG: Starting to process', users.length, 'users');
      // console.log('🔍 DEBUG: Users with skills:', users.filter(u => Array.isArray(u.skills) && u.skills.length > 0).length);
      // console.log('🔍 DEBUG: Users without skills:', users.filter(u => !Array.isArray(u.skills) || u.skills.length === 0).length);
      // console.log('🔍 DEBUG: Sample users:', users.slice(0, 3).map(u => ({ 
      //   name: u.name, 
      //   skillsCount: Array.isArray(u.skills) ? u.skills.length : 'not array',
      //   skills: Array.isArray(u.skills) ? u.skills.slice(0, 3) : 'no skills'
      // })));
    
    users.forEach((user, index) => {
      logger.debug(`🔍 DEBUG: Processing user ${index + 1}/${users.length}:`, user.name, 'with skills:', user.skills);
      if (!Array.isArray(user.skills)) {
        logger.debug('🔍 DEBUG: User', user.name, 'has no skills array, skipping');
        return;
      }

      const matchedSkills: string[] = [];
      let matchType: SearchResult['matchType'] = 'partial';
      
      // Debug: Log user skills
      if (user.skills.length > 0) {
        logger.debug('SearchService: User', user.name, 'has skills:', user.skills);
      } else {
        logger.debug('SearchService: User', user.name, 'has NO skills');
      }

      user.skills.forEach((skill: any) => {
        // Handle both string and object skill formats
        let skillName = '';
        if (typeof skill === 'string') {
          skillName = skill;
        } else if (skill && typeof skill === 'object' && skill.name) {
          skillName = skill.name;
        } else {
          return; // Skip invalid skill format
        }
        
        if (!skillName) return;
        
        const skillLower = skillName.toLowerCase().trim();
        const searchTermLower = searchTerm.toLowerCase().trim();
        
        // console.log(`🔍 DEBUG: Skill comparison - Original: "${skillName}" Lowercase: "${skillLower}" Search term: "${searchTermLower}"`);
        // console.log(`🔍 DEBUG: Exact match check: ${skillLower === searchTermLower} for skill: "${skillName}"`);
        
        // Check for exact match first (case-insensitive)
        if (skillLower === searchTermLower) {
          matchedSkills.push(skillName);
          matchType = 'exact';
          logger.debug('🔍 DEBUG: Exact match found:', skillName, 'for term:', searchTerm);
        }
        // Check for prefix match
        else if (skillLower.startsWith(searchTermLower)) {
          matchedSkills.push(skillName);
          if (matchType !== 'exact') matchType = 'prefix';
        }
        // Check for suffix match
        else if (skillLower.endsWith(searchTermLower)) {
          matchedSkills.push(skillName);
          if (matchType !== 'exact') matchType = 'suffix';
        }
        // Check for partial match
        else if (skillLower.includes(searchTermLower)) {
          matchedSkills.push(skillName);
          if (matchType !== 'exact' && matchType !== 'prefix' && matchType !== 'suffix') {
            matchType = 'partial';
          }
        }
        // Check if this skill matches any of the bilingual search results
        else if (matchingEnglishSkills.includes(skillName)) {
          matchedSkills.push(skillName);
          if (matchType !== 'exact' && matchType !== 'prefix' && matchType !== 'suffix') {
            matchType = 'partial';
          }
        }
      });

      // Only add user if they have matched skills
      if (matchedSkills.length > 0) {
        logger.debug('🔍 DEBUG: Adding user to results:', user.name, 'with matched skills:', matchedSkills, 'match type:', matchType);
        results.push({
          user,
          matchedSkills: [...new Set(matchedSkills)], // Remove duplicates
          matchType
        });
      } else {
        logger.debug('🔍 DEBUG: User', user.name, 'has no matched skills, skipping');
      }
    });

    logger.debug('SearchService: Found', results.length, 'results with bilingual matching');
    
    // Sort results: exact matches first, then by match type priority
    return results.sort((a, b) => {
      const priority = { exact: 4, prefix: 3, suffix: 2, partial: 1 };
      return priority[b.matchType] - priority[a.matchType];
    });
  }

  // Generate "Did you mean?" suggestion ONLY when no results found
  private generateSuggestion(searchTerm: string): SearchSuggestion | undefined {
    logger.debug('SearchService: No results found, generating suggestion for:', searchTerm);
    logger.debug('SearchService: Available skills for suggestions:', Array.from(this.allSkills));
    
    let bestSuggestion = '';
    let bestConfidence = 0;

    this.allSkills.forEach(skill => {
      const similarity = this.calculateSimilarity(searchTerm, skill);
      
              // console.log(`SearchService: Comparing "${searchTerm}" with "${skill}" - similarity: ${similarity}`);
      
      // Only suggest for high-confidence corrections (1-2 letter errors)
      if (similarity > 0.6 && similarity > bestConfidence) {
        bestSuggestion = skill;
        bestConfidence = similarity;
        // console.log(`SearchService: New best suggestion: "${skill}" with confidence ${similarity}`);
      }
    });

    if (bestConfidence > 0.5) {
      logger.debug('SearchService: Final suggestion:', bestSuggestion, 'with confidence:', bestConfidence);
      return {
        suggestedTerm: bestSuggestion,
        confidence: bestConfidence
      };
    }

    logger.debug('SearchService: No strong suggestion found (best confidence was:', bestConfidence, ')');
    return undefined;
  }

  // Calculate similarity between two strings (Levenshtein-based)
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Special handling for common typos
    const commonTypos: { [key: string]: string } = {
      'writng': 'writing',
      'wrti': 'writing',
      'writting': 'writing',
      'javascrpt': 'javascript',
      'javascrip': 'javascript',
      'pyton': 'python',
      'pythn': 'python',
      'reactjs': 'react',
      'nodejs': 'node',
      'entrepreneurship': 'entrepreneurship',
      'entrepreneur': 'entrepreneurship',
      'photography': 'photography',
      'photograhy': 'photography',
      'cooking': 'cooking',
      'cookng': 'cooking',
      'guitar': 'guitar',
      'guitr': 'guitar',
      'fitness': 'fitness',
      'fitnes': 'fitness'
    };
    
    // Check for exact typo matches first
    if (commonTypos[str1] === str2 || commonTypos[str2] === str1) {
      return 0.9; // High confidence for known typos
    }
    
    const distance = this.levenshteinDistance(longer, shorter);
    const similarity = (longer.length - distance) / longer.length;
    
    // Boost similarity for shorter strings (more forgiving for short terms)
    if (longer.length <= 5) {
      return Math.min(1.0, similarity + 0.1);
    }
    
    return similarity;
  }

  // Levenshtein distance calculation
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Log search terms for analytics
  private logSearchTerm(term: string) {
    this.searchLog.push({
      term,
      timestamp: new Date(),
      results: 0 // Will be updated after search
    });

    // Keep only last 1000 searches to prevent memory issues
    if (this.searchLog.length > 1000) {
      this.searchLog = this.searchLog.slice(-1000);
    }
  }

  // Get search analytics (for future improvements)
  getSearchAnalytics() {
    const now = new Date();
    const last24Hours = this.searchLog.filter(log => 
      now.getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    const termFrequency: { [key: string]: number } = {};
    last24Hours.forEach(log => {
      termFrequency[log.term] = (termFrequency[log.term] || 0) + 1;
    });

    return {
      totalSearches: this.searchLog.length,
      searchesLast24Hours: last24Hours.length,
      mostSearchedTerms: Object.entries(termFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([term, count]) => ({ term, count }))
    };
  }

  // Clear search log (for privacy)
  clearSearchLog() {
    this.searchLog = [];
  }
}

// Export singleton instance
export const searchService = new SearchService(); 