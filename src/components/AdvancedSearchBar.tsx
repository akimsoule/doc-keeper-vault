import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, SortDesc, History, X, Loader2 } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Document } from '../types';

interface SearchResult {
  query: string;
  results: Document[];
  total: number;
  searchTime: number;
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

interface AdvancedSearchBarProps {
  onSearchResults?: (results: SearchResult) => void;
  onFiltersToggle?: (show: boolean) => void;
  placeholder?: string;
  showHistory?: boolean;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  onSearchResults,
  onFiltersToggle,
  placeholder = "Rechercher des documents...",
  showHistory = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const { preferences, updatePreference } = useUserPreferences();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchResult,
    searchHistory,
    loading,
    error,
    search,
    clearResults,
    clearHistory,
    clearError,
    removeFromHistory,
  } = useSearch({
    maxHistoryItems: 10,
    debounceMs: 300,
  });

  // Notifier les résultats au parent
  useEffect(() => {
    if (searchResult && onSearchResults) {
      onSearchResults(searchResult);
    }
  }, [searchResult, onSearchResults]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      search(query);
    } else {
      clearResults();
    }
    setShowHistoryDropdown(false);
  };

  const handleHistoryItemClick = (historyItem: SearchHistoryItem) => {
    handleSearch(historyItem.query);
    searchInputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    clearResults();
    clearError();
    searchInputRef.current?.focus();
  };

  const toggleFilters = () => {
    const newShowFilters = !preferences.showFilters;
    updatePreference('showFilters', newShowFilters);
    onFiltersToggle?.(newShowFilters);
  };

  const handleSortToggle = () => {
    const newSortOrder = preferences.sortOrder === 'asc' ? 'desc' : 'asc';
    updatePreference('sortOrder', newSortOrder);
  };

  return (
    <div className="relative">
      {/* Barre de recherche principale */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4 sm:w-5 sm:h-5" />
          
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowHistoryDropdown(showHistory && searchHistory.length > 0)}
            className="input input-bordered w-full pl-10 sm:pl-12 pr-20 bg-base-100/80 backdrop-blur-sm text-sm sm:text-base"
          />
          
          {/* Indicateurs d'état */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            )}
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="btn btn-ghost btn-xs btn-circle"
                title="Effacer la recherche"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {showHistory && searchHistory.length > 0 && (
              <button
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className="btn btn-ghost btn-xs btn-circle"
                title="Historique de recherche"
              >
                <History className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={toggleFilters}
            className={`btn btn-square ${
              preferences.showFilters
                ? 'btn-primary'
                : 'btn-outline'
            }`}
            title="Filtres"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={handleSortToggle}
            className="btn btn-square btn-outline"
            title={`Tri ${preferences.sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
          >
            <SortDesc className={`w-4 h-4 sm:w-5 sm:h-5 ${preferences.sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={clearError} className="btn btn-ghost btn-xs">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropdown d'historique */}
      {showHistoryDropdown && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-base-300 flex items-center justify-between">
            <span className="text-sm font-medium text-base-content/70">Historique de recherche</span>
            <button
              onClick={clearHistory}
              className="btn btn-ghost btn-xs"
              title="Effacer l'historique"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="py-1">
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 hover:bg-base-200 cursor-pointer group"
                onClick={() => handleHistoryItemClick(item)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-base-content truncate">
                    {item.query}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {item.resultsCount} résultat{item.resultsCount !== 1 ? 's' : ''} • {' '}
                    {new Date(item.timestamp).toLocaleDateString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(index);
                  }}
                  className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer de l'historique"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {showHistoryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowHistoryDropdown(false)}
        />
      )}
    </div>
  );
};
