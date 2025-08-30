import React from 'react';
import { Tag, X } from 'lucide-react';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Array<{ name: string; count: number; color?: string }>;
  className?: string;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
  className = ""
}) => {
  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(tag => tag !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const getTagStyle = (tag: { name: string; count: number; color?: string }) => {
    return {
      backgroundColor: tag.color || '#6B7280',
      borderColor: tag.color || '#6B7280'
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-base-content/60" />
          <h3 className="text-lg font-semibold text-base-content">Tags</h3>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-sm text-base-content/60 hover:text-base-content transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-base-content/80">Sélectionnés :</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagName => {
              const tag = availableTags.find(t => t.name === tagName);
              return (
                <button
                  key={tagName}
                  onClick={() => handleTagToggle(tagName)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
                  style={tag ? getTagStyle(tag) : { backgroundColor: '#6B7280' }}
                >
                  {tagName}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tous les tags disponibles */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-base-content/80">Disponibles :</h4>
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {availableTags
            .filter(tag => !selectedTags.includes(tag.name))
            .map(tag => (
              <button
                key={tag.name}
                onClick={() => handleTagToggle(tag.name)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border-2 transition-all hover:scale-105 hover:shadow-md"
                style={{
                  borderColor: tag.color || '#6B7280',
                  color: tag.color || '#6B7280',
                  backgroundColor: 'transparent'
                }}
              >
                <span>{tag.name}</span>
                <span 
                  className="text-xs px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: tag.color || '#6B7280' }}
                >
                  {tag.count}
                </span>
              </button>
            ))
          }
        </div>
      </div>

      {/* Message si aucun tag */}
      {availableTags.length === 0 && (
        <div className="text-center py-8 text-base-content/50">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun tag disponible</p>
        </div>
      )}
    </div>
  );
};

export default TagFilter;
