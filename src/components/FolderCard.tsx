import React, { useState, useEffect } from 'react';
import { Folder, MoreVertical, Edit3, Trash2, Move } from 'lucide-react';
import { Folder as FolderType } from '../types';
import { formatFileSize } from '../utils/formatters';

interface FolderCardProps {
  folder: FolderType;
  onOpen: (folder: FolderType) => void;
  onEdit: (folder: FolderType) => void;
  onDelete: (folder: FolderType) => void;
  onMove?: (folder: FolderType) => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpen,
  onEdit,
  onDelete,
  onMove,
  className = '',
  viewMode = 'grid',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleDoubleClick = () => {
    // Annuler le timeout du simple clic si double-clic détecté
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    onOpen(folder);
  };

  const handleClick = (_e: React.MouseEvent) => {
    // Sur les appareils tactiles, utiliser le simple clic immédiatement
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      onOpen(folder);
      return;
    }

    // Sur desktop, attendre un peu pour voir s'il y a un double-clic
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    
    const timeout = setTimeout(() => {
      onOpen(folder);
      setClickTimeout(null);
    }, 200);
    
    setClickTimeout(timeout);
  };

  // Nettoyer le timeout au démontage du composant
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const handleMenuAction = (action: 'edit' | 'delete' | 'move', e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div
      className={`relative group card bg-base-100 border border-base-300 hover:border-base-content/20 hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation ${
        viewMode === 'list' ? 'card-side' : ''
      } ${className}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(folder);
        }
      }}
      aria-label={`Dossier ${folder.name}, ${folder.documentCount} documents, ${folder.folderCount} sous-dossiers`}
    >
      {/* Menu contextuel */}
      <div className="absolute top-2 right-2 z-10">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
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
              className="p-3 sm:p-4 rounded-lg mb-2"
              style={{ backgroundColor: `${folder.color}20` }}
            >
              <Folder
                className="h-8 w-8 sm:h-10 sm:w-10"
                style={{ color: folder.color }}
              />
            </div>
            
            {/* Nom et description */}
            <div className="w-full">
              <h3 className="font-medium text-sm sm:text-base text-base-content truncate">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-xs sm:text-sm text-base-content/60 truncate mt-1">
                  {folder.description}
                </p>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-base-content text-sm sm:text-base">
                {folder.documentCount}
              </div>
              <div className="text-base-content/60 text-xs">
                {folder.documentCount === 1 ? 'doc' : 'docs'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-base-content text-sm sm:text-base">
                {folder.folderCount}
              </div>
              <div className="text-base-content/60 text-xs">
                {folder.folderCount === 1 ? 'dossier' : 'dossiers'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-base-content text-sm sm:text-base">
                {formatFileSize(folder.totalSize)}
              </div>
              <div className="text-base-content/60 text-xs">taille</div>
            </div>
          </div>

          {/* Date de création */}
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-base-300">
            <p className="text-xs text-base-content/60">
              Créé le {new Date(folder.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      ) : (
        /* Mode liste */
        <>
          {/* Icône et nom */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 p-3 sm:p-4 pr-12">
            <div
              className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${folder.color}20` }}
            >
              <Folder
                className="h-5 w-5 sm:h-6 sm:w-6"
                style={{ color: folder.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm sm:text-base text-base-content truncate">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-xs sm:text-sm text-base-content/60 truncate">
                  {folder.description}
                </p>
              )}
            </div>
          </div>

          {/* Statistiques en ligne */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-sm text-base-content/60 p-4 pr-12">
            <span>{folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}</span>
            <span>{folder.folderCount} {folder.folderCount === 1 ? 'dossier' : 'dossiers'}</span>
            <span>{formatFileSize(folder.totalSize)}</span>
            <span>{new Date(folder.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          
          {/* Statistiques mobiles */}
          <div className="sm:hidden p-2 bg-base-200 mr-12">
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="font-medium text-base-content">{folder.documentCount}</div>
                <div className="text-base-content/60">docs</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-base-content">{folder.folderCount}</div>
                <div className="text-base-content/60">dossiers</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-base-content">{formatFileSize(folder.totalSize)}</div>
                <div className="text-base-content/60">taille</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
