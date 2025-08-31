import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Star,
  MoreVertical,
  FolderInput
} from 'lucide-react';
import { Document } from '../types';
import { formatFileSize, formatDate } from '../utils/formatters';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite: (id: string) => void;
  onView: (id: string) => void;
  onMove?: (document: Document) => void;
  viewMode: 'grid' | 'list';
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return FileText;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onToggleFavorite,
  onView,
  onMove,
  viewMode,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const FileIcon = getFileIcon(document.type);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(document.id);
  };

  const handleCardClick = () => {
    onView(document.id);
  };

  const formatTagsDescription = (tags: string[]) => {
    if (tags.length === 0) return "Aucun tag";
    return `Tags: ${tags.join(', ')}`;
  };

  if (viewMode === 'list') {
    return (
      <article 
        className="group document-card-enhanced card shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-base-200 rounded-lg flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-base-content/60" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base-content truncate" title={document.name}>
                  {document.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
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

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="badge badge-primary badge-xs text-xs" 
                      aria-label={`Tag: ${tag}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bouton Favoris */}
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
              
              {/* Bouton Déplacer */}
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
              <FileIcon className="w-6 h-6 text-base-content/60" />
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
