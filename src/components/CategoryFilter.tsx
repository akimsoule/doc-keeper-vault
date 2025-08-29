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
    <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-base-100/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-base-300 animate-in slide-in-from-top-2 duration-200">
      <h3 className="text-sm font-medium text-base-content mb-3 sm:mb-4">Filtrer par catégorie</h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`btn btn-sm ${
            selectedCategory === ''
              ? 'btn-neutral'
              : 'btn-outline btn-ghost'
          }`}
        >
          Tous ({categories.reduce((sum, cat) => sum + cat.count, 0)})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`btn btn-sm flex items-center gap-1 sm:gap-2 ${
              selectedCategory === category.id
                ? 'btn-primary'
                : 'btn-outline btn-ghost'
            }`}
            style={{
              backgroundColor: selectedCategory === category.id ? category.color : undefined,
              borderColor: selectedCategory === category.id ? category.color : undefined,
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