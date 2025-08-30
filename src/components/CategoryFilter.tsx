import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  showFilters: boolean;
  totalDocuments: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  showFilters,
  totalDocuments,
}) => {
  if (!showFilters) return null;

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div 
      className="mb-4 sm:mb-6 p-4 sm:p-6 bg-base-100/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-base-300 animate-in slide-in-from-top-2 duration-200"
      role="group"
      aria-labelledby="category-filter-title"
    >
      <h3 
        id="category-filter-title" 
        className="text-sm font-medium text-base-content mb-3 sm:mb-4"
      >
        Filtrer par catégorie
      </h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2" role="radiogroup" aria-labelledby="category-filter-title">
        <button
          onClick={() => setSelectedCategory('')}
          onKeyDown={(e) => handleKeyDown(e, '')}
          className={`btn btn-sm ${
            selectedCategory === ''
              ? 'btn-neutral'
              : 'btn-outline btn-ghost'
          }`}
          role="radio"
          aria-checked={selectedCategory === ''}
          aria-label={`Afficher tous les documents (${totalDocuments} documents)`}
        >
          Tous ({totalDocuments})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            onKeyDown={(e) => handleKeyDown(e, category.id)}
            className={`btn btn-sm flex items-center gap-1 sm:gap-2 ${
              selectedCategory === category.id
                ? 'btn-primary'
                : 'btn-outline btn-ghost'
            }`}
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : undefined,
              borderColor: selectedCategory === category.id ? category.color : undefined,
            }}
            role="radio"
            aria-checked={selectedCategory === category.id}
            aria-label={`Filtrer par ${category.name} (${category.count} documents)`}
          >
            <span className="text-xs sm:text-sm" aria-hidden="true">{category.icon}</span>
            {category.name} ({category.count})
          </button>
        ))}
      </div>
    </div>
  );
};