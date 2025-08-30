import React, { useRef, useEffect } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  ArchiveRestore,
  Download,
  Share2,
  Star,
  Trash2,
  Eye,
  MoreHorizontal,
  MoreVertical
} from 'lucide-react';
import { Document } from '../types';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
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
  onArchive,
  onUnarchive,
  viewMode,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const FileIcon = getFileIcon(document.type);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      window.document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFavoriteClick = () => {
    onToggleFavorite(document.id);
    setShowDropdown(false);
  };

  const handleDeleteClick = () => {
    onDelete(document.id);
    setShowDropdown(false);
  };

  const handleViewClick = () => {
    onView(document.id);
    setShowDropdown(false);
  };

  const handleDownloadClick = () => {
    // TODO: Implémenter le téléchargement
    console.log('Download:', document.id);
    setShowDropdown(false);
  };

  const handleShareClick = () => {
    // TODO: Implémenter le partage
    console.log('Share:', document.id);
    setShowDropdown(false);
  };

  const handleArchiveClick = () => {
    if (document.archived && onUnarchive) {
      onUnarchive(document.id);
    } else if (!document.archived && onArchive) {
      onArchive(document.id);
    }
    setShowDropdown(false); // Fermer le dropdown après l'action
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
        className="group document-card-enhanced card card-compact shadow-sm hover:shadow-lg transition-all duration-200"
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
                <div className="flex items-center gap-2">
                  <h3 className="card-title text-sm sm:text-base truncate">{document.name}</h3>
                  {document.archived && (
                    <span className="badge badge-warning badge-sm">Archivé</span>
                  )}
                </div>
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
              {/* Action principale : Voir */}
              <button
                onClick={handleViewClick}
                onKeyDown={(e) => handleKeyDown(e, handleViewClick)}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-primary hover:bg-primary/20"
                title="Voir le document"
                aria-label={`Voir le document ${document.name}`}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              
              {/* Action secondaire : Favoris */}
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

              {/* Menu dropdown pour les autres actions */}
              <div className="dropdown dropdown-end">
                <button 
                  ref={dropdownRef}
                  className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content hover:bg-base-200"
                  onClick={toggleDropdown}
                  onKeyDown={(e) => handleKeyDown(e, toggleDropdown)}
                  title="Plus d'actions"
                  aria-label={`Plus d'actions pour ${document.name}`}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                </button>
                {showDropdown && (
                  <ul 
                    className="dropdown-content z-[9999] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300"
                    role="menu"
                    aria-label={`Menu d'actions pour ${document.name}`}
                  >
                    <li role="none">
                      <button onClick={handleDownloadClick} className="flex items-center gap-2 text-left w-full" role="menuitem">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </li>
                    <li role="none">
                      <button onClick={handleShareClick} className="flex items-center gap-2 text-left w-full" role="menuitem">
                        <Share2 className="w-4 h-4" />
                        Partager
                      </button>
                    </li>
                    {(onArchive || onUnarchive) && (
                      <li role="none">
                        <button onClick={handleArchiveClick} className="flex items-center gap-2 text-left w-full" role="menuitem">
                          {document.archived ? (
                            <>
                              <ArchiveRestore className="w-4 h-4" />
                              Désarchiver
                            </>
                          ) : (
                            <>
                              <Archive className="w-4 h-4" />
                              Archiver
                            </>
                          )}
                        </button>
                      </li>
                    )}
                    <div className="divider my-1"></div>
                    <li role="none">
                      <button onClick={handleDeleteClick} className="flex items-center gap-2 text-left w-full text-error hover:bg-error/20" role="menuitem">
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="group document-card-enhanced card shadow-sm hover:shadow-xl transition-all duration-300"
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
          <div className="flex items-center justify-between">
            <h3 className="card-title text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
              {document.name}
            </h3>
            {document.archived && (
              <span className="badge badge-warning badge-sm ml-2">Archivé</span>
            )}
          </div>
          
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
              <div className="dropdown dropdown-left dropdown-end">
                <button 
                  ref={dropdownRef}
                  className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content hover:bg-base-content/10"
                  onClick={toggleDropdown}
                  onKeyDown={(e) => handleKeyDown(e, toggleDropdown)}
                  aria-label={`Actions pour ${document.name}`}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4" aria-hidden="true" />
                </button>
                {showDropdown && (
                  <ul 
                    className="dropdown-content z-[9999] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300"
                    role="menu"
                    aria-label={`Menu d'actions pour ${document.name}`}
                  >
                    <li role="none">
                      <button
                        onClick={handleViewClick}
                        className="flex items-center gap-2 text-left w-full"
                        role="menuitem"
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        Voir le document
                      </button>
                    </li>
                    <li role="none">
                      <button
                        onClick={handleFavoriteClick}
                        className="flex items-center gap-2 text-left w-full"
                        role="menuitem"
                      >
                        <Star className={`w-4 h-4 ${document.favorite ? 'fill-current text-warning' : ''}`} aria-hidden="true" />
                        {document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      </button>
                    </li>
                    <li role="none">
                      <button 
                        onClick={handleDownloadClick}
                        className="flex items-center gap-2 text-left w-full"
                        role="menuitem"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Télécharger
                      </button>
                    </li>
                    <li role="none">
                      <button 
                        onClick={handleShareClick}
                        className="flex items-center gap-2 text-left w-full"
                        role="menuitem"
                      >
                        <Share2 className="w-4 h-4" aria-hidden="true" />
                        Partager
                      </button>
                    </li>
                    {(onArchive || onUnarchive) && (
                      <li role="none">
                        <button
                          onClick={handleArchiveClick}
                          className="flex items-center gap-2 text-left w-full"
                          role="menuitem"
                        >
                          {document.archived ? (
                            <ArchiveRestore className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Archive className="w-4 h-4" aria-hidden="true" />
                          )}
                          {document.archived ? 'Désarchiver' : 'Archiver'}
                        </button>
                      </li>
                    )}
                    <div className="divider my-1"></div>
                    <li role="none">
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 text-left w-full text-error hover:bg-error/20"
                        role="menuitem"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        Supprimer
                      </button>
                    </li>
                  </ul>
                )}
              </div>
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