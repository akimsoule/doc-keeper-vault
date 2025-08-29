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
  MoreHorizontal
} from 'lucide-react';
import { Document } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface DocumentCardProps {
  document: Document;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
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
  viewMode,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const FileIcon = getFileIcon(document.type);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(document.id);
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="group card card-compact bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm hover:shadow-lg transition-all duration-200"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="flex">
                <div className="bg-primary/10 text-primary rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <FileIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="card-title text-sm sm:text-base truncate">{document.name}</h3>
                <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-base-content/60">
                  <span>{formatFileSize(document.size)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{formatDate(document.uploadDate)}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="capitalize hidden md:inline">{document.category}</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
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
            <div className={`flex items-center gap-1 sm:gap-2 transition-opacity duration-200 flex-shrink-0 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
              <button
                onClick={() => onToggleFavorite(document.id)}
                className={`btn btn-ghost btn-sm btn-square ${
                  document.favorite
                    ? 'text-warning hover:bg-warning/20'
                    : 'text-base-content/40 hover:text-warning hover:bg-warning/20'
                }`}
              >
                <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} />
              </button>
              <button className="hidden sm:flex btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-info hover:bg-info/20">
                <Download className="w-4 h-4" />
              </button>
              <button className="hidden sm:flex btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-success hover:bg-success/20">
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error hover:bg-error/20"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group card bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="card-body">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex">
            <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <FileIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
          <div className={`flex items-center gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
            <button
              onClick={() => onToggleFavorite(document.id)}
              className={`btn btn-ghost btn-sm btn-square ${
                document.favorite
                  ? 'text-warning hover:bg-warning/20'
                  : 'text-base-content/40 hover:text-warning hover:bg-warning/20'
              }`}
            >
              <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${document.favorite ? 'fill-current' : ''}`} />
            </button>
            <button className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content/60">
              <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h3 className="card-title text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {document.name}
          </h3>
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-base-content/60">
            <span>{formatFileSize(document.size)}</span>
            <span className="hidden sm:inline">{formatDate(document.uploadDate)}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {document.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge badge-ghost badge-sm whitespace-nowrap">
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="text-xs text-base-content/40">+{document.tags.length - 2}</span>
            )}
          </div>
          
          <div className={`card-actions justify-between transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-info hover:bg-info/20">
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-success hover:bg-success/20">
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error hover:bg-error/20"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <span className="text-xs text-base-content/40 capitalize hidden sm:inline">{document.category}</span>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le document"
        message={`Êtes-vous sûr de vouloir supprimer "${document.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};