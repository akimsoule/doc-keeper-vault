import React from 'react';

interface TagFilterLegacyProps {
  tags: Array<{ name: string; count: number; color?: string }>;
  selectedTag: string;
  setSelectedTag: (tagName: string) => void;
  showFilters: boolean;
  totalDocuments: number;
}

export const CategoryFilter: React.FC<TagFilterLegacyProps> = ({
  tags,
  selectedTag,
  setSelectedTag,
  showFilters,
  totalDocuments,
}) => {
  if (!showFilters) return null;

  const handleKeyDown = (e: React.KeyboardEvent, tagName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedTag(tagName);
    }
  };

  return (
    <div 
      className="mb-4 sm:mb-6 p-4 sm:p-6 bg-base-100/60 backdrop-blur-sm rounded-lg sm:rounded-xl border border-base-300 animate-in slide-in-from-top-2 duration-200"
      role="group"
      aria-labelledby="tag-filter-title"
    >
      <h3 
        id="tag-filter-title" 
        className="text-sm font-medium text-base-content mb-3 sm:mb-4"
      >
        Filtrer par tag
      </h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2" role="radiogroup" aria-labelledby="tag-filter-title">
        <button
          onClick={() => setSelectedTag('')}
          onKeyDown={(e) => handleKeyDown(e, '')}
          className={`btn btn-sm ${
            selectedTag === ''
              ? 'btn-neutral'
              : 'btn-outline btn-ghost'
          }`}
          role="radio"
          aria-checked={selectedTag === ''}
          aria-label={`Afficher tous les documents (${totalDocuments} documents)`}
        >
          Tous ({totalDocuments})
        </button>
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => setSelectedTag(tag.name)}
            onKeyDown={(e) => handleKeyDown(e, tag.name)}
            className={`btn btn-sm flex items-center gap-1 sm:gap-2 ${
              selectedTag === tag.name
                ? 'btn-primary'
                : 'btn-outline btn-ghost'
            }`}
            style={{
              backgroundColor: selectedTag === tag.name ? tag.color : undefined,
              borderColor: selectedTag === tag.name ? tag.color : undefined,
            }}
            role="radio"
            aria-checked={selectedTag === tag.name}
            aria-label={`Filtrer par ${tag.name} (${tag.count} documents)`}
          >
            <span className="text-xs sm:text-sm" aria-hidden="true">#</span>
            {tag.name} ({tag.count})
          </button>
        ))}
      </div>
    </div>
  );
};