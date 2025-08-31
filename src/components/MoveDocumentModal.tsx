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
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-base-content">
            Déplacer le document
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {document && (
            <div className="alert alert-info">
              <p className="text-sm">
                Document à déplacer : <span className="font-medium">{document.name}</span>
              </p>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Choisir le dossier de destination :</span>
            </label>
            
            {/* Option racine */}
            <div
              className={`card card-compact cursor-pointer transition-all ${
                selectedFolderId === null
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-base-200 border border-base-300 hover:bg-base-300'
              }`}
              onClick={() => setSelectedFolderId(null)}
            >
              <div className="card-body flex-row items-center gap-3">
                <Home className="h-5 w-5 text-base-content/60" />
                <span className="text-base-content">Racine (aucun dossier)</span>
              </div>
            </div>

            {/* Liste des dossiers */}
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`card card-compact cursor-pointer transition-all ${
                    selectedFolderId === folder.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-base-200 border border-base-300 hover:bg-base-300'
                  }`}
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <div className="card-body flex-row items-center gap-3">
                    <FolderIcon 
                      className="h-5 w-5 flex-shrink-0" 
                      style={{ color: folder.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base-content truncate">
                        {folder.name}
                      </p>
                      {folder.description && (
                        <p className="text-xs text-base-content/60 truncate">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Annuler
          </button>
          <button
            onClick={handleMove}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Déplacement...
              </>
            ) : (
              'Déplacer'
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
