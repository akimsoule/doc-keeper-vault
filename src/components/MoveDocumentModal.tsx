import React, { useState, useEffect } from 'react';
import { X, Folder as FolderIcon, Home } from 'lucide-react';
import { Document } from '../types';
import { useFolders } from '../hooks/useFolders';

interface MoveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onMove: (documentId: string, folderId: string | null) => Promise<void>;
}

export const MoveDocumentModal: React.FC<MoveDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  onMove,
}) => {
  const { folders, loadFolders } = useFolders();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders(); // Charger tous les dossiers
    }
  }, [isOpen, loadFolders]);

  const handleMove = async () => {
    if (!document) return;
    
    setLoading(true);
    try {
      await onMove(document.id, selectedFolderId);
      onClose();
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Déplacer le document
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {document && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Document à déplacer :
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {document.name}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choisir le dossier de destination :
            </label>
            
            {/* Option racine */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedFolderId === null
                  ? 'bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <Home className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900 dark:text-white">Racine (aucun dossier)</span>
            </div>

            {/* Liste des dossiers */}
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <FolderIcon 
                    className="h-5 w-5" 
                    style={{ color: folder.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white truncate">
                      {folder.name}
                    </p>
                    {folder.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {folder.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleMove}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Déplacement...' : 'Déplacer'}
          </button>
        </div>
      </div>
    </div>
  );
};
