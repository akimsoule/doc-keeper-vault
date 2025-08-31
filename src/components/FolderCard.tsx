import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, MoreVertical, Edit3, Trash2, Move } from 'lucide-react';
import { Folder as FolderType } from '../types';
import { formatFileSize } from '../utils/formatters';

interface FolderCardProps {
  folder: FolderType;
  onEdit: (folder: FolderType) => void;
  onDelete: (folder: FolderType) => void;
  onMove?: (folder: FolderType) => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  onMove,
  className = '',
  viewMode = 'grid',
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Nettoyer le menu lorsque l'on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const handleMenuAction = (action: 'edit' | 'delete' | 'move', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);
    
    switch (action) {
      case 'edit':
        onEdit(folder);
        break;
      case 'delete':
        onDelete(folder);
        break;
      case 'move':
        onMove?.(folder);
        break;
    }
  };

  return (
    <Link
      to={`/dashboard/folder/${folder.id}`}
      className={`relative group card bg-base-100 border border-base-300 hover:border-base-content/20 hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation block ${
        viewMode === 'list' ? 'card-side' : ''
      } ${className}`}
      aria-label={`Dossier ${folder.name}, ${folder.documentCount} documents, ${folder.folderCount} sous-dossiers`}
    >
      {/* Menu contextuel */}
      <div className="absolute top-2 right-2 z-10">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 btn btn-ghost btn-sm sm:btn-xs btn-circle transition-opacity touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] bg-base-100/80 backdrop-blur-sm"
            aria-label="Menu du dossier"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <>
              {/* Overlay pour fermer le menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              {/* Menu déroulant */}
              <div className="absolute right-0 top-full mt-1 w-40 card bg-base-100 shadow-lg border border-base-300 z-20">
                <div className="card-body p-1">
                  <button
                    onClick={(e) => handleMenuAction('edit', e)}
                    className="btn btn-ghost btn-sm justify-start gap-2 w-full"
                  >
                    <Edit3 className="h-4 w-4" />
                    Modifier
                  </button>
                  {onMove && (
                    <button
                      onClick={(e) => handleMenuAction('move', e)}
                      className="btn btn-ghost btn-sm justify-start gap-2 w-full"
                    >
                      <Move className="h-4 w-4" />
                      Déplacer
                    </button>
                  )}
                  <button
                    onClick={(e) => handleMenuAction('delete', e)}
                    className="btn btn-ghost btn-sm justify-start gap-2 w-full text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Mode grille */
        <div className="card-body">
          {/* Icône du dossier centrée */}
          <div className="flex flex-col items-center text-center mb-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-2"
              style={{ backgroundColor: folder.color || '#3B82F6' + '20' }}
            >
              <Folder 
                className="w-8 h-8" 
                style={{ color: folder.color || '#3B82F6' }}
              />
            </div>
            
            {/* Nom du dossier */}
            <h3 className="font-semibold text-base-content truncate w-full mb-1">
              {folder.name}
            </h3>
            
            {/* Description */}
            {folder.description && (
              <p className="text-xs text-base-content/60 truncate w-full mb-2">
                {folder.description}
              </p>
            )}
            
            {/* Stats - en bas de l'icône */}
            <div className="grid grid-cols-1 gap-1 text-xs text-base-content/60 w-full">
              <div className="flex items-center justify-center gap-1">
                <span>{folder.documentCount} docs</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <span>{folder.folderCount} dossiers</span>
              </div>
              {folder.totalSize > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <span>{formatFileSize(folder.totalSize)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode liste */
        <div className="card-body">
          <div className="flex items-center space-x-3">
            {/* Icône du dossier */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-primary flex-shrink-0"
              style={{ backgroundColor: folder.color || '#3B82F6' + '20' }}
            >
              <Folder 
                className="w-6 h-6" 
                style={{ color: folder.color || '#3B82F6' }}
              />
            </div>
            
            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base-content truncate">
                {folder.name}
              </h3>
              
              {folder.description && (
                <p className="text-sm text-base-content/60 truncate">
                  {folder.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-base-content/60 mt-1">
                <span>{folder.documentCount} documents</span>
                <span>{folder.folderCount} dossiers</span>
                {folder.totalSize > 0 && (
                  <span>{formatFileSize(folder.totalSize)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};
