import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Download,
  Share2,
  Star,
  Trash2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  viewMode: 'grid' | 'list';
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  return FileText;
};

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onToggleFavorite,
  onDelete,
  onView,
  viewMode,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const FileIcon = getFileIcon(document.type);

  const handleDeleteClick = () => {
    onDelete(document.id);
  };

  const handleViewClick = () => {
    onView(document.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const formatTagsDescription = (tags: string[]) => {
    if (tags.length === 0) return "Aucun tag";
    if (tags.length <= 2) return `Tags: ${tags.join(', ')}`;
    return `Tags: ${tags.slice(0, 2).join(', ')} et ${tags.length - 2} autres`;
  };

  if (viewMode === 'list') {
    return (
      <article 
        className="group card card-compact bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm hover:shadow-lg transition-all duration-200"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        aria-label={`Document ${document.name}, ${formatFileSize(document.size)}, ${document.category}`}
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="flex">
                <div 
                  className="bg-primary/10 text-primary rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <FileIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="card-title text-sm sm:text-base truncate">{document.name}</h3>
                <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-base-content/60">
                  <span aria-label={`Taille du fichier: ${formatFileSize(document.size)}`}>
                    {formatFileSize(document.size)}
                  </span>
                  <span className="hidden sm:inline" aria-hidden="true">•</span>
                  <span className="hidden sm:inline" aria-label={`Date d'upload: ${formatDate(document.uploadDate)}`}>
                    {formatDate(document.uploadDate)}
                  </span>
                  <span className="hidden md:inline" aria-hidden="true">•</span>
                  <span className="capitalize hidden md:inline" aria-label={`Catégorie: ${document.category}`}>
                    {document.category}
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0" aria-label={formatTagsDescription(document.tags)}>
                {document.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="badge badge-ghost badge-sm whitespace-nowrap">
                    {tag}
                  </span>
                ))}
                {document.tags.length > 2 && (
                  <span className="text-xs text-base-content/40">+{document.tags.length - 2}</span>
                )}
              </div>
            </div>
            <div 
              className={`flex items-center gap-1 sm:gap-2 transition-opacity duration-200 flex-shrink-0 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}
              role="toolbar"
              aria-label={`Actions pour le document ${document.name}`}
            >
              <button
                onClick={handleViewClick}
                onKeyDown={(e) => handleKeyDown(e, handleViewClick)}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-primary hover:bg-primary/20"
                title="Voir le document"
                aria-label={`Voir le document ${document.name}`}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => onToggleFavorite(document.id)}
                onKeyDown={(e) => handleKeyDown(e, () => onToggleFavorite(document.id))}
                className={`btn btn-ghost btn-sm btn-square ${
                  document.favorite
                    ? 'text-warning hover:bg-warning/20'
                    : 'text-base-content/40 hover:text-warning hover:bg-warning/20'
                }`}
                title={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-label={document.favorite ? `Retirer ${document.name} des favoris` : `Ajouter ${document.name} aux favoris`}
                aria-pressed={document.favorite}
              >
                <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} aria-hidden="true" />
              </button>
              <button 
                className="hidden sm:flex btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-info hover:bg-info/20"
                title="Télécharger"
                aria-label={`Télécharger ${document.name}`}
              >
                <Download className="w-4 h-4" aria-hidden="true" />
              </button>
              <button 
                className="hidden sm:flex btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-success hover:bg-success/20"
                title="Partager"
                aria-label={`Partager ${document.name}`}
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={handleDeleteClick}
                onKeyDown={(e) => handleKeyDown(e, handleDeleteClick)}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error hover:bg-error/20"
                title="Supprimer"
                aria-label={`Supprimer ${document.name}`}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="group card bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      aria-label={`Document ${document.name}, ${formatFileSize(document.size)}, ${document.category}`}
    >
      <div className="card-body">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex">
            <div 
              className="bg-primary/10 text-primary rounded-lg w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center"
              aria-hidden="true"
            >
              <FileIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div 
            className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}
            role="toolbar"
            aria-label={`Actions rapides pour ${document.name}`}
          >
            <button
              onClick={() => onToggleFavorite(document.id)}
              onKeyDown={(e) => handleKeyDown(e, () => onToggleFavorite(document.id))}
              className={`btn btn-ghost btn-sm btn-square ${
                document.favorite
                  ? 'text-warning hover:bg-warning/20'
                  : 'text-base-content/40 hover:text-warning hover:bg-warning/20'
              }`}
              title={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-label={document.favorite ? `Retirer ${document.name} des favoris` : `Ajouter ${document.name} aux favoris`}
              aria-pressed={document.favorite}
            >
              <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>
            <button 
              className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content/60"
              aria-label={`Plus d'options pour ${document.name}`}
              title="Plus d'options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h3 className="card-title text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {document.name}
          </h3>
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-base-content/60">
            <span aria-label={`Taille: ${formatFileSize(document.size)}`}>
              {formatFileSize(document.size)}
            </span>
            <span className="hidden sm:inline" aria-label={`Date: ${formatDate(document.uploadDate)}`}>
              {formatDate(document.uploadDate)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1" aria-label={formatTagsDescription(document.tags)}>
            {document.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge badge-ghost badge-sm whitespace-nowrap">
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="text-xs text-base-content/40">+{document.tags.length - 2}</span>
            )}
          </div>
          
          <div 
            className={`card-actions justify-between transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}
            role="toolbar"
            aria-label={`Actions pour le document ${document.name}`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handleViewClick}
                onKeyDown={(e) => handleKeyDown(e, handleViewClick)}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-primary hover:bg-primary/20"
                title="Voir le document"
                aria-label={`Voir ${document.name}`}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <button 
                onClick={() => onToggleFavorite(document.id)}
                onKeyDown={(e) => handleKeyDown(e, () => onToggleFavorite(document.id))}
                className={`btn btn-ghost btn-sm btn-square ${
                  document.favorite
                    ? 'text-warning hover:bg-warning/20'
                    : 'text-base-content/40 hover:text-warning hover:bg-warning/20'
                }`}
                title={document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-label={document.favorite ? `Retirer ${document.name} des favoris` : `Ajouter ${document.name} aux favoris`}
                aria-pressed={document.favorite}
              >
                <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} aria-hidden="true" />
              </button>
              <button 
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-info hover:bg-info/20"
                title="Télécharger"
                aria-label={`Télécharger ${document.name}`}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <button 
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-success hover:bg-success/20"
                title="Partager"
                aria-label={`Partager ${document.name}`}
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <button
                onClick={handleDeleteClick}
                onKeyDown={(e) => handleKeyDown(e, handleDeleteClick)}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error hover:bg-error/20"
                title="Supprimer"
                aria-label={`Supprimer ${document.name}`}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>
            <span className="text-xs text-base-content/40 capitalize hidden sm:inline" aria-label={`Catégorie: ${document.category}`}>
              {document.category}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};