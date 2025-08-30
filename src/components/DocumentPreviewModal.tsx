import { useEffect, useState } from 'react';
import { X, Download, FileText, Image, FileVideo, FileAudio, Archive, Star, Trash2, Share2, Tag, Plus, Check, ArchiveRestore, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
    size: number;
  } | null;
  fileData?: {
    dataUrl: string;
    type: string;
  } | null;
  // Actions supplémentaires
  fullDocument?: Document | null; // Document complet avec tous les champs
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onShare?: (id: string) => void;
  // Navigation entre documents
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  canNavigatePrevious?: boolean;
  canNavigateNext?: boolean;
  currentIndex?: number;
  totalDocuments?: number;
}

export const DocumentPreviewModal = ({ 
  isOpen, 
  onClose, 
  document, 
  fileData,
  fullDocument,
  onToggleFavorite,
  onDelete,
  onArchive,
  onUnarchive,
  onUpdateTags,
  onShare,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious,
  canNavigateNext,
  currentIndex,
  totalDocuments
}: DocumentPreviewModalProps) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editableTags, setEditableTags] = useState<string[]>([]);

  // Initialiser les tags modifiables avec les tags du document
  useEffect(() => {
    if (fullDocument?.tags) {
      setEditableTags([...fullDocument.tags]);
    }
  }, [fullDocument?.tags]);

  const handleSaveTags = () => {
    if (fullDocument && onUpdateTags) {
      onUpdateTags(fullDocument.id, editableTags);
      setEditingTags(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editableTags.includes(newTag.trim())) {
      setEditableTags([...editableTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditableTags(editableTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  // Gestion des événements clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (canNavigatePrevious && onNavigatePrevious) {
            onNavigatePrevious();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (canNavigateNext && onNavigateNext) {
            onNavigateNext();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, canNavigatePrevious, canNavigateNext, onNavigatePrevious, onNavigateNext, onClose]);

  useEffect(() => {
    if (fileData && fileData.dataUrl) {
      // Créer un blob à partir des données base64
      try {
        const byteCharacters = atob(fileData.dataUrl.split(',')[1] || fileData.dataUrl);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const type = getMimeType(fileData.type, document?.name, fileData.dataUrl);
        const blob = new Blob([byteArray], { type });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        // Nettoyer l'URL précédente
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Erreur lors de la création du blob:', error);
      }
    } else {
      setBlobUrl(null);
    }
  }, [fileData, document?.name]);

  // Nettoyer l'URL quand le composant se démonte
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Fonction helper pour obtenir le type MIME
  const getMimeType = (fileType: string, fileName?: string, dataUrl?: string): string => {
    // Si on a une dataUrl avec un type MIME, l'utiliser en priorité
    if (dataUrl && dataUrl.startsWith('data:')) {
      const mimeTypeMatch = dataUrl.match(/^data:([^;]+)/);
      if (mimeTypeMatch) {
        return mimeTypeMatch[1];
      }
    }

    // Essayer d'extraire l'extension du nom de fichier en priorité
    let extension = '';
    if (fileName) {
      extension = fileName.toLowerCase().split('.').pop() || '';
    } else {
      // Fallback sur le fileType si pas de nom de fichier
      extension = fileType.toLowerCase().split('.').pop() || fileType.toLowerCase();
    }

    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json',
      'xml': 'text/xml',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'ico': 'image/x-icon',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/avi',
      'mov': 'video/quicktime',
      'wmv': 'video/x-ms-wmv',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
      'tar': 'application/x-tar',
      'gz': 'application/gzip'
    };
    
    const mimeType = mimeTypes[extension] || 'application/octet-stream';
    return mimeType;
  };

  const getFileIcon = (fileType: string, fileName?: string) => {
    // Utiliser le nom du fichier en priorité pour extraire l'extension
    let extension = '';
    if (fileName) {
      extension = fileName.toLowerCase().split('.').pop() || '';
    } else {
      extension = fileType.toLowerCase().split('.').pop() || fileType.toLowerCase();
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return <Image className="w-12 h-12 text-info" />;
    } else if (['mp4', 'webm', 'avi', 'mov', 'wmv'].includes(extension)) {
      return <FileVideo className="w-12 h-12 text-secondary" />;
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return <FileAudio className="w-12 h-12 text-success" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <Archive className="w-12 h-12 text-warning" />;
    } else {
      return <FileText className="w-12 h-12 text-base-content/60" />;
    }
  };

  const canPreview = (fileType: string, fileName?: string): boolean => {
    // Utiliser le nom du fichier en priorité pour extraire l'extension
    let extension = '';
    if (fileName) {
      extension = fileName.toLowerCase().split('.').pop() || '';
    } else {
      extension = fileType.toLowerCase().split('.').pop() || fileType.toLowerCase();
    }
    
    const previewableTypes = [
      'pdf', 'txt', 'html', 'css', 'js', 'json', 'xml',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
      'mp4', 'webm', 'mp3', 'wav', 'ogg'
    ];
    return previewableTypes.includes(extension);
  };

  const renderPreview = () => {
    if (!blobUrl || !document) return null;

    // Utiliser le nom du fichier pour déterminer l'extension
    const extension = document.name.toLowerCase().split('.').pop() || document.type.toLowerCase();

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return (
        <img 
          src={blobUrl} 
          alt={document.name}
          className="max-w-full max-h-full object-contain rounded-lg"
          onError={() => console.error('Erreur lors du chargement de l\'image')}
        />
      );
    }

    // PDF
    if (extension === 'pdf') {
      return (
        <iframe
          src={blobUrl}
          className="w-full h-full border border-base-300 rounded-lg bg-base-100"
          title={document.name}
        />
      );
    }

    // Texte
    if (['txt', 'html', 'css', 'js', 'json', 'xml'].includes(extension)) {
      return (
        <iframe
          src={blobUrl}
          className="w-full h-full border border-base-300 rounded-lg bg-base-100"
          title={document.name}
        />
      );
    }

    // Vidéo
    if (['mp4', 'webm'].includes(extension)) {
      return (
        <video 
          src={blobUrl} 
          controls 
          className="max-w-full max-h-full rounded-lg"
          preload="metadata"
        >
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    // Audio
    if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return (
        <audio 
          src={blobUrl} 
          controls 
          className="w-full"
          preload="metadata"
        >
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      );
    }

    return null;
  };

  const handleDownload = () => {
    if (blobUrl && document) {
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-6xl w-full h-full max-h-screen overflow-hidden flex flex-col border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300 flex-shrink-0 bg-base-200">
          {/* Navigation précédente */}
          <div className="flex items-center space-x-2">
            {onNavigatePrevious && (
              <button
                onClick={onNavigatePrevious}
                disabled={!canNavigatePrevious}
                className="btn btn-sm btn-circle btn-outline"
                title="Document précédent (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mx-4">
            <div className="flex-shrink-0">
              {getFileIcon(document.type, document.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-semibold text-base-content truncate">
                {document.name}
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-xs sm:text-sm text-base-content/60">
                  {document.type.toUpperCase()} • {formatFileSize(document.size)}
                </p>
                {/* Indicateur de position */}
                {currentIndex !== undefined && totalDocuments !== undefined && (
                  <span className="text-xs text-base-content/50">
                    {currentIndex + 1} / {totalDocuments}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {blobUrl && (
              <button
                onClick={handleDownload}
                className="btn btn-sm btn-outline btn-primary hover:btn-primary"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Télécharger</span>
              </button>
            )}
            
            {/* Navigation suivante */}
            {onNavigateNext && (
              <button
                onClick={onNavigateNext}
                disabled={!canNavigateNext}
                className="btn btn-sm btn-circle btn-outline"
                title="Document suivant (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="btn btn-sm btn-outline hover:btn-error"
              title="Fermer (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Fermer</span>
            </button>
          </div>
        </div>

        {/* Actions et Tags */}
        {fullDocument && (
          <div className="flex flex-col border-b border-base-300 bg-base-100">
            {/* Barre d'actions */}
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                {/* Toggle favoris */}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(fullDocument.id)}
                    className={`btn btn-sm ${fullDocument.favorite ? 'btn-warning' : 'btn-outline'}`}
                    title={fullDocument.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Star className={`w-4 h-4 ${fullDocument.favorite ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline ml-1">
                      {fullDocument.favorite ? 'Favoris' : 'Favoris'}
                    </span>
                  </button>
                )}

                {/* Archiver/Désarchiver */}
                {fullDocument.archived ? (
                  onUnarchive && (
                    <button
                      onClick={() => onUnarchive(fullDocument.id)}
                      className="btn btn-sm btn-outline btn-info"
                      title="Désarchiver"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Désarchiver</span>
                    </button>
                  )
                ) : (
                  onArchive && (
                    <button
                      onClick={() => onArchive(fullDocument.id)}
                      className="btn btn-sm btn-outline btn-warning"
                      title="Archiver"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Archiver</span>
                    </button>
                  )
                )}

                {/* Modifier les tags */}
                {onUpdateTags && (
                  <button
                    onClick={() => setEditingTags(!editingTags)}
                    className={`btn btn-sm ${editingTags ? 'btn-primary' : 'btn-outline'}`}
                    title="Modifier les tags"
                  >
                    <Tag className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Tags</span>
                  </button>
                )}

                {/* Partager */}
                {onShare && (
                  <button
                    onClick={() => onShare(fullDocument.id)}
                    className="btn btn-sm btn-outline btn-secondary"
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Partager</span>
                  </button>
                )}
              </div>

              {/* Supprimer */}
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
                      onDelete(fullDocument.id);
                      onClose();
                    }
                  }}
                  className="btn btn-sm btn-outline btn-error"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Supprimer</span>
                </button>
              )}
            </div>

            {/* Section des tags */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-base-content/70">Tags:</span>
                
                {editingTags ? (
                  /* Mode édition des tags */
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    {editableTags.map((tag, index) => (
                      <div key={index} className="badge badge-primary gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="btn btn-xs btn-circle btn-ghost hover:btn-error"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nouveau tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="input input-xs input-bordered w-24"
                      />
                      <button
                        onClick={handleAddTag}
                        className="btn btn-xs btn-primary"
                        disabled={!newTag.trim()}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={handleSaveTags}
                        className="btn btn-xs btn-success"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTags(false);
                          setEditableTags(fullDocument.tags || []);
                          setNewTag('');
                        }}
                        className="btn btn-xs btn-ghost"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Mode affichage des tags */
                  <div className="flex flex-wrap gap-1">
                    {fullDocument.tags && fullDocument.tags.length > 0 ? (
                      fullDocument.tags.map((tag, index) => (
                        <span key={index} className="badge badge-outline">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-base-content/50 italic">Aucun tag</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-auto flex-1 min-h-0 bg-base-50">
          {!fileData ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <span className="text-base-content/70 text-center">
                Chargement du document...
              </span>
            </div>
          ) : canPreview(document.type, document.name) ? (
            <div className="flex flex-col items-center space-y-4 h-full">
              <div className="w-full h-full flex items-center justify-center bg-base-100 rounded-lg border border-base-300">
                {renderPreview()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-base-100 rounded-lg border border-base-300">
              <div className="opacity-60">
                {getFileIcon(document.type, document.name)}
              </div>
              <div className="text-center space-y-3">
                <p className="text-base-content/70 text-sm sm:text-base">
                  Aperçu non disponible pour ce type de fichier
                </p>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary btn-sm sm:btn-md"
                  disabled={!blobUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le fichier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
