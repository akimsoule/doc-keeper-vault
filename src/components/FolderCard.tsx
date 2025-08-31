import React, { useState } from 'react';
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

  const handleDoubleClick = () => {
    onOpen(folder);
  };

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
      className={`relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 cursor-pointer ${
        viewMode === 'list' ? 'flex items-center p-3' : ''
      } ${className}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Menu contextuel */}
      <div className="absolute top-2 right-2 z-10">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-opacity"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <>
              {/* Overlay pour fermer le menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              {/* Menu déroulant */}
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={(e) => handleMenuAction('edit', e)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit3 className="h-4 w-4" />
                  Modifier
                </button>
                {onMove && (
                  <button
                    onClick={(e) => handleMenuAction('move', e)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Move className="h-4 w-4" />
                    Déplacer
                  </button>
                )}
                <button
                  onClick={(e) => handleMenuAction('delete', e)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Mode grille */
        <div className="p-4">
          {/* Icône et nom du dossier */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${folder.color}20` }}
            >
              <Folder
                className="h-8 w-8"
                style={{ color: folder.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {folder.description}
                </p>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">
                {folder.documentCount}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {folder.documentCount === 1 ? 'document' : 'documents'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">
                {folder.folderCount}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {folder.folderCount === 1 ? 'dossier' : 'dossiers'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">
                {formatFileSize(folder.totalSize)}
              </div>
              <div className="text-gray-500 dark:text-gray-400">taille</div>
            </div>
          </div>

          {/* Date de création */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Créé le {new Date(folder.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      ) : (
        /* Mode liste */
        <>
          {/* Icône et nom */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${folder.color}20` }}
            >
              <Folder
                className="h-6 w-6"
                style={{ color: folder.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {folder.description}
                </p>
              )}
            </div>
          </div>

          {/* Statistiques en ligne */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span>{folder.documentCount} {folder.documentCount === 1 ? 'document' : 'documents'}</span>
            <span>{folder.folderCount} {folder.folderCount === 1 ? 'dossier' : 'dossiers'}</span>
            <span>{formatFileSize(folder.totalSize)}</span>
            <span>{new Date(folder.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </>
      )}
    </div>
  );
};
