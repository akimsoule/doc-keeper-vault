import React, { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { tagsService, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

interface TagsFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({ selectedTags, onTagsChange }) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      try {
        const tags = await tagsService.getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, []);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Retirer le tag s'il est déjà sélectionné
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // Ajouter le tag s'il n'est pas sélectionné
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  if (isLoading) {
    return (
      <div className="bg-base-100 rounded-box p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-primary" />
          <span className="font-medium">Tags disponibles</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      </div>
    );
  }

  if (availableTags.length === 0) {
    return (
      <div className="bg-base-100 rounded-box p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-primary" />
          <span className="font-medium">Tags disponibles</span>
        </div>
        <p className="text-base-content/60 text-sm">
          Aucun tag disponible pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-box p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-5 h-5 text-primary" />
        <span className="font-medium">Tags disponibles</span>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAllTags}
            className="text-xs text-error hover:text-error/80 ml-auto"
          >
            Effacer tout
          </button>
        )}
      </div>

      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-base-content/60 mb-2">Tags sélectionnés :</div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <div
                key={tag}
                className="badge badge-primary gap-1 cursor-pointer hover:badge-primary/80"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <X className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tous les tags disponibles */}
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`badge cursor-pointer transition-colors ${
                isSelected
                  ? 'badge-primary'
                  : 'badge-outline hover:badge-primary hover:badge-outline-primary'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TagsFilter;
