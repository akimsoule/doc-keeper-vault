import { useState, useCallback, useEffect } from 'react';
import { Document } from '../types';
import apiService from '../services/apiService';
import { useLocalStorage } from './useLocalStorage';

interface SearchResult {
  query: string;
  results: Document[];
  total: number;
  searchTime: number;
}

interface AdvancedSearchCriteria {
  query?: string;
  type?: string;
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
  limit?: number;
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

interface UseSearchOptions {
  maxHistoryItems?: number;
  enableCache?: boolean;
  debounceMs?: number;
}

interface UseSearchResult {
  searchResult: SearchResult | null;
  searchHistory: SearchHistoryItem[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  advancedSearch: (criteria: AdvancedSearchCriteria) => Promise<void>;
  clearResults: () => void;
  clearHistory: () => void;
  clearError: () => void;
  addToHistory: (query: string, resultsCount: number) => void;
  removeFromHistory: (index: number) => void;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchResult => {
  const { maxHistoryItems = 10, debounceMs = 300 } = options;

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useLocalStorage<SearchHistoryItem[]>('search-history', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setSearchResult(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, [setSearchHistory]);

  const addToHistory = useCallback((query: string, resultsCount: number) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: new Date(),
      resultsCount,
    };

    setSearchHistory(prev => {
      // Supprimer les doublons
      const filtered = prev.filter(item => item.query !== query);
      // Ajouter en début de liste
      const updated = [newItem, ...filtered];
      // Limiter le nombre d'éléments
      return updated.slice(0, maxHistoryItems);
    });
  }, [setSearchHistory, maxHistoryItems]);

  const removeFromHistory = useCallback((index: number) => {
    setSearchHistory(prev => prev.filter((_, i) => i !== index));
  }, [setSearchHistory]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      clearResults();
      return;
    }

    // Débounce
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.search(query);
        
        const result: SearchResult = {
          query,
          results: response.results,
          total: response.total,
          searchTime: response.searchTime,
        };

        setSearchResult(result);
        addToHistory(query, response.total);
      } catch (err) {
        console.error('Erreur lors de la recherche:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
        setSearchResult(null);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [debounceMs, debounceTimer, addToHistory, clearResults]);

  const advancedSearch = useCallback(async (criteria: AdvancedSearchCriteria) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.advancedSearch(criteria);
      
      const result: SearchResult = {
        query: criteria.query || 'Recherche avancée',
        results: response.results,
        total: response.total,
        searchTime: response.searchTime,
      };

      setSearchResult(result);
      
      if (criteria.query) {
        addToHistory(criteria.query, response.total);
      }
    } catch (err) {
      console.error('Erreur lors de la recherche avancée:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche avancée');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  }, [addToHistory]);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    searchResult,
    searchHistory,
    loading,
    error,
    search,
    advancedSearch,
    clearResults,
    clearHistory,
    clearError,
    addToHistory,
    removeFromHistory,
  };
};
