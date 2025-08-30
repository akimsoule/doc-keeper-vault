import React from 'react';
import { Search, Filter, SortDesc } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div className="relative flex-1">
        <Search 
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-4 h-4 sm:w-5 sm:h-5" 
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Rechercher des documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input input-bordered w-full pl-10 sm:pl-12 bg-base-100/80 backdrop-blur-sm text-sm sm:text-base"
          aria-label="Rechercher des documents"
          aria-describedby="search-help"
        />
        <span id="search-help" className="sr-only">
          Tapez pour rechercher des documents par nom ou tag. Appuyez sur Échap pour effacer.
        </span>
      </div>
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-square ${
            showFilters
              ? 'btn-primary'
              : 'btn-outline'
          }`}
          aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          aria-pressed={showFilters}
          title={showFilters ? "Masquer les filtres" : "Afficher les filtres"}
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        </button>
        <button 
          className="btn btn-square btn-outline"
          aria-label="Options de tri"
          title="Options de tri"
        >
          <SortDesc className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};