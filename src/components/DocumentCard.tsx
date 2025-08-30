import React, { useRef, useEffect, useState } from 'react';
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
  MoreVertical,
  Tag,
  X,
  Plus,
  Check
} from 'lucide-react';
import { Document } from '../types';
import { apiService } from '../services/apiService';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
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
  onUpdateTags,
  viewMode,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(document.tags || []);
  const [newTag, setNewTag] = useState('');
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const toggleDropdownKeyboard = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFavoriteClick = () => {
    onToggleFavorite(document.id);
    setShowDropdown(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(document.id);
    setShowDropdown(false);
  };

  const handleViewClick = () => {
    onView(document.id);
    setShowDropdown(false);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      alert("Téléchargement en cours...");
      // Télécharger le fichier via l'API
      const blob = await apiService.downloadDocument(document.id);
      
      // Créer un lien temporaire pour télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Téléchargement initié pour:', document.name);
      // TODO: Afficher un toast de succès
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      
      // Fallback: essayer avec l'URL directe
      try {
        const link = window.document.createElement('a');
        link.href = document.url;
        link.download = document.name;
        link.target = '_blank';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      
      } catch (fallbackError) {
        console.error('Erreur du fallback:', fallbackError);
        // TODO: Afficher un toast d'erreur
      }
    }
    
    setShowDropdown(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Créer l'URL de partage
      const shareUrl = `${window.location.origin}/document/${document.id}`;
      
      // Copier dans le presse-papiers
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          console.log('Lien copié dans le presse-papiers');
          // TODO: Afficher un toast de succès
        }).catch((error) => {
          console.error('Erreur lors de la copie:', error);
          fallbackCopyToClipboard(shareUrl);
        });
      } else {
        // Fallback pour les anciens navigateurs
        fallbackCopyToClipboard(shareUrl);
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      // TODO: Afficher un toast d'erreur
    }
    
    setShowDropdown(false);
  };

  // Fonction fallback pour copier dans le presse-papiers
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = window.document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    window.document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      window.document.execCommand('copy');
      console.log('Lien copié dans le presse-papiers (fallback)');
      // TODO: Afficher un toast de succès
    } catch (error) {
      console.error('Erreur lors de la copie (fallback):', error);
      // TODO: Afficher un toast d'erreur
    }
    
    window.document.body.removeChild(textArea);
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (document.archived && onUnarchive) {
      onUnarchive(document.id);
    } else if (!document.archived && onArchive) {
      onArchive(document.id);
    }
    setShowDropdown(false);
  };

  const handleEditTagsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingTags(true);
    setEditTags(document.tags || []);
    setShowDropdown(false);
  };

  const handleSaveTags = async () => {
    if (onUpdateTags) {
      try {
        await onUpdateTags(document.id, editTags);
        setIsEditingTags(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des tags:', error);
      }
    }
  };

  const handleCancelEditTags = () => {
    setIsEditingTags(false);
    setEditTags(document.tags || []);
    setNewTag('');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      handleCancelEditTags();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const formatTagsDescription = (tags: string[]) => {
    if (tags.length === 0) return "Aucun tag";
    return `Tags: ${tags.join(', ')}`;
  };

  if (viewMode === 'list') {
    return (
      <article 
        className={`group document-card-enhanced card card-compact shadow-sm hover:shadow-lg transition-shadow duration-200 ${showDropdown ? 'dropdown-active' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        aria-label={`Document ${document.name}, ${formatFileSize(document.size)}, ${formatTagsDescription(document.tags)}`}
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
                  {document.tags.length > 0 && (
                    <>
                      <span className="hidden md:inline" aria-hidden="true">•</span>
                      <div className="hidden md:flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag} 
                            className="text-xs text-primary" 
                            aria-label={`Tag: ${tag}`}
                          >
                            #{tag}
                          </span>
                        ))}
                        {document.tags.length > 3 && (
                          <span className="text-xs text-base-content/60">
                            +{document.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-1 flex-wrap flex-shrink-0" aria-label={formatTagsDescription(document.tags)}>
                {document.tags.map((tag) => (
                  <span key={tag} className="badge badge-primary badge-sm whitespace-nowrap text-xs">
                    #{tag}
                  </span>
                ))}
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
                  onKeyDown={(e) => handleKeyDown(e, toggleDropdownKeyboard)}
                  title="Plus d'actions"
                  aria-label={`Plus d'actions pour ${document.name}`}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                </button>
                {showDropdown && (
                  <div 
                    className="dropdown-content menu p-2 shadow-xl bg-white rounded-box w-52 border border-gray-300"
                    style={{
                      position: 'absolute',
                      zIndex: 999999,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      right: 0,
                      top: '100%',
                      marginTop: '4px',
                      pointerEvents: 'auto'
                    }}
                    role="menu"
                    aria-label={`Menu d'actions pour ${document.name}`}
                  >
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadClick(e);
                      }}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded" 
                      role="menuitem" 
                      style={{ 
                        color: '#000000',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Download className="w-4 h-4" style={{ color: '#000000' }} />
                      Télécharger
                    </button>
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleShareClick(e);
                      }}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded" 
                      role="menuitem" 
                      style={{ 
                        color: '#000000',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Share2 className="w-4 h-4" style={{ color: '#000000' }} />
                      Partager
                    </button>
                    {(onArchive || onUnarchive) && (
                      <button 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleArchiveClick(e);
                        }}
                        className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded" 
                        role="menuitem" 
                        style={{ 
                          color: '#000000',
                          pointerEvents: 'auto'
                        }}
                      >
                        {document.archived ? (
                          <ArchiveRestore className="w-4 h-4" style={{ color: '#000000' }} />
                        ) : (
                          <Archive className="w-4 h-4" style={{ color: '#000000' }} />
                        )}
                        {document.archived ? 'Désarchiver' : 'Archiver'}
                      </button>
                    )}
                    {onUpdateTags && (
                      <button 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditTagsClick(e);
                        }}
                        className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded" 
                        role="menuitem" 
                        style={{ 
                          color: '#000000',
                          pointerEvents: 'auto'
                        }}
                      >
                        <Tag className="w-4 h-4" style={{ color: '#000000' }} />
                        Modifier les tags
                      </button>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button 
                      onClick={handleDeleteClick} 
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-red-50 rounded" 
                      role="menuitem" 
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#dc2626' }} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interface d'édition des tags */}
        {isEditingTags && (
          <div className="p-4 border-t border-base-300 bg-base-50">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Modifier les tags
            </h4>
            
            <div className="space-y-3">
              {/* Tags actuels */}
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary/80 ml-1"
                      aria-label={`Supprimer le tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Ajouter un nouveau tag */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-base-content/60">#</span>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="input input-sm pl-6 pr-2 w-full"
                    placeholder="nouveau tag"
                    maxLength={20}
                  />
                </div>
                <button
                  onClick={handleAddTag}
                  className="btn btn-sm btn-primary"
                  disabled={!newTag.trim() || editTags.includes(newTag.trim())}
                  aria-label="Ajouter le tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEditTags}
                  className="btn btn-sm btn-ghost"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTags}
                  className="btn btn-sm btn-primary"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    );
  }

  return (
    <article 
      className={`group document-card-enhanced card shadow-sm hover:shadow-xl transition-shadow duration-300 ${showDropdown ? 'dropdown-active' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      aria-label={`Document ${document.name}, ${formatFileSize(document.size)}, ${formatTagsDescription(document.tags)}`}
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
            {document.tags.map((tag) => (
              <span key={tag} className="badge badge-primary badge-sm whitespace-nowrap text-xs">
                #{tag}
              </span>
            ))}
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
                  onKeyDown={(e) => handleKeyDown(e, toggleDropdownKeyboard)}
                  aria-label={`Actions pour ${document.name}`}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4" aria-hidden="true" />
                </button>
                {showDropdown && (
                  <div 
                    className="dropdown-content menu p-2 shadow-xl bg-white rounded-box w-52 border border-gray-300"
                    style={{
                      position: 'absolute',
                      zIndex: 99999,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      right: 0,
                      bottom: '100%',
                      marginBottom: '4px',
                      pointerEvents: 'auto'
                    }}
                    role="menu"
                    aria-label={`Menu d'actions pour ${document.name}`}
                  >
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewClick();
                      }}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded"
                      role="menuitem"
                      style={{ 
                        color: '#000000',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" style={{ color: '#000000' }} />
                      Voir le document
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavoriteClick();
                      }}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded"
                      role="menuitem"
                      style={{ 
                        color: '#000000',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Star className={`w-4 h-4 ${document.favorite ? 'fill-current' : ''}`} aria-hidden="true" style={{ color: document.favorite ? '#f59e0b' : '#000000' }} />
                      {document.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </button>
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadClick(e);
                      }}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded"
                      role="menuitem"
                      style={{ 
                        color: '#000000',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Download className="w-4 h-4" aria-hidden="true" style={{ color: '#000000' }} />
                      Télécharger
                    </button>
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleShareClick(e);
                      }}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded"
                      role="menuitem"
                      style={{ 
                        color: '#000000',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" style={{ color: '#000000' }} />
                      Partager
                    </button>
                    {(onArchive || onUnarchive) && (
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleArchiveClick(e);
                        }}
                        className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded"
                        role="menuitem"
                        style={{ 
                          color: '#000000',
                          pointerEvents: 'auto'
                        }}
                      >
                        {document.archived ? (
                          <ArchiveRestore className="w-4 h-4" aria-hidden="true" style={{ color: '#000000' }} />
                        ) : (
                          <Archive className="w-4 h-4" aria-hidden="true" style={{ color: '#000000' }} />
                        )}
                        {document.archived ? 'Désarchiver' : 'Archiver'}
                      </button>
                    )}
                    {onUpdateTags && (
                      <button 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditTagsClick(e);
                        }}
                        className="flex items-center gap-2 text-left w-full p-2 hover:bg-gray-100 rounded" 
                        role="menuitem" 
                        style={{ 
                          color: '#000000',
                          pointerEvents: 'auto'
                        }}
                      >
                        <Tag className="w-4 h-4" aria-hidden="true" style={{ color: '#000000' }} />
                        Modifier les tags
                      </button>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center gap-2 text-left w-full p-2 hover:bg-red-50 rounded"
                      role="menuitem"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" style={{ color: '#dc2626' }} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
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
          </div>
        </div>

        {/* Interface d'édition des tags */}
        {isEditingTags && (
          <div className="p-4 border-t border-base-300 bg-base-50">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Modifier les tags
            </h4>
            
            <div className="space-y-3">
              {/* Tags actuels */}
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary/80 ml-1"
                      aria-label={`Supprimer le tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Ajouter un nouveau tag */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-base-content/60">#</span>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="input input-sm pl-6 pr-2 w-full"
                    placeholder="nouveau tag"
                    maxLength={20}
                  />
                </div>
                <button
                  onClick={handleAddTag}
                  className="btn btn-sm btn-primary"
                  disabled={!newTag.trim() || editTags.includes(newTag.trim())}
                  aria-label="Ajouter le tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEditTags}
                  className="btn btn-sm btn-ghost"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTags}
                  className="btn btn-sm btn-primary"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};