import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  showFilters: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  showFilters,
}) => {
  if (!showFilters) return null;

  return (
    <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3 sm:mb-4">Filtrer par catégorie</h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
            selectedCategory === ''
              ? 'bg-gray-800 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous ({categories.reduce((sum, cat) => sum + cat.count, 0)})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
              selectedCategory === category.id
                ? `text-white shadow-lg`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : undefined,
            }}
          >
            <span className="text-xs sm:text-sm">{category.icon}</span>
            {category.name} ({category.count})
          </button>
        ))}
      </div>
    </div>
  );
};