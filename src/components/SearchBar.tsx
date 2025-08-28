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
  return (
    <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Rechercher des documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
        />
      </div>
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex-1 sm:flex-none p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
            showFilters
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white border border-gray-200'
          }`}
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
        </button>
        <button className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white border border-gray-200 rounded-lg sm:rounded-xl transition-all duration-200">
          <SortDesc className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
        </button>
      </div>
    </div>
  );
};