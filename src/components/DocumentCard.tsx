import React, { useState } from 'react';
import { Document } from '../types';
import { FileText, Star, FolderInput } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  viewMode: 'grid' | 'list';
  onToggleFavorite?: (document: Document) => void;
  onMove?: (document: Document) => void;
  onPreview?: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  viewMode,
  onToggleFavorite,
  onMove,
  onPreview
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTagsDescription = (tags: string[]): string => {
    if (tags.length === 0) return 'Aucun tag';
    if (tags.length === 1) return `Tag: ${tags[0]}`;
    return `Tags: ${tags.join(', ')}`;
  };

  const handleCardClick = () => {
    if (onPreview) {
      onPreview(document);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(document);
    }
  };

  if (viewMode === 'list') {
    return (
      <article 
        className="group document-card-enhanced bg-base-100 border border-base-300 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`Document ${document.name}, ${formatFileSize(document.size)}, ${formatTagsDescription(document.tags)}`}
      >
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-base-content/60" />
              </div>
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="font-medium text-base-content truncate" title={document.name}>
                {document.name}
              </h3>
              <div className="text-sm text-base-content/60 mt-1">
                <div className="flex items-center gap-2">
                  <span aria-label={`Taille: ${formatFileSize(document.size)}`}>
                    {formatFileSize(document.size)}
                  </span>
                  <span aria-hidden="true">•</span>
                  <span aria-label={`Date d'upload: ${formatDate(document.uploadDate)}`}>
                    {formatDate(document.uploadDate)}
                  </span>
                </div>
              </div>
              
              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2" aria-label={formatTagsDescription(document.tags)}>
                  {document.tags.map((tag) => (
                    <span key={tag} className="badge badge-primary badge-sm whitespace-nowrap text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Boutons d'action */}
            <div className="flex gap-1">
              <button
                onClick={handleFavoriteClick}
                className={`btn btn-ghost btn-sm transition-opacity duration-200 ${
                  showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                }`}
                aria-label={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                title={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Star 
                  className={`w-4 h-4 ${document.favorite ? 'fill-current text-yellow-500' : 'text-base-content/60'}`} 
                />
              </button>
              
              {onMove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(document);
                  }}
                  className={`btn btn-ghost btn-sm transition-opacity duration-200 ${
                    showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                  }`}
                  aria-label="Déplacer vers un dossier"
                  title="Déplacer vers un dossier"
                >
                  <FolderInput className="w-4 h-4 text-base-content/60" />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Vue grille
  return (
    <article 
      className="group document-card-enhanced card card-compact shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Document ${document.name}, ${formatFileSize(document.size)}, ${formatTagsDescription(document.tags)}`}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-base-200 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-base-content/60" />
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex gap-1">
            <button
              onClick={handleFavoriteClick}
              className={`btn btn-ghost btn-sm transition-opacity duration-200 ${
                showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'
              }`}
              aria-label={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              title={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star 
                className={`w-4 h-4 ${document.favorite ? 'fill-current text-yellow-500' : 'text-base-content/60'}`} 
              />
            </button>
            
            {onMove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(document);
                }}
                className={`btn btn-ghost btn-sm transition-opacity duration-200 ${
                  showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'
                }`}
                aria-label="Déplacer vers un dossier"
                title="Déplacer vers un dossier"
              >
                <FolderInput className="w-4 h-4 text-base-content/60" />
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-base-content line-clamp-2" title={document.name}>
            {document.name}
          </h3>
          
          <div className="text-xs text-base-content/60">
            <div className="flex items-center gap-2">
              <span aria-label={`Taille: ${formatFileSize(document.size)}`}>
                {formatFileSize(document.size)}
              </span>
              <span aria-hidden="true">•</span>
              <span aria-label={`Date d'upload: ${formatDate(document.uploadDate)}`}>
                {formatDate(document.uploadDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3" aria-label={formatTagsDescription(document.tags)}>
            {document.tags.map((tag) => (
              <span key={tag} className="badge badge-primary badge-sm whitespace-nowrap text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};