import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft, Folder as FolderIcon, FileText, FolderInput } from 'lucide-react';
import { Folder, Document } from '../types';
import { FolderCard } from './FolderCard';
import { DocumentCard } from './DocumentCard';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { CreateFolderModal } from './CreateFolderModal';
import { MoveDocumentModal } from './MoveDocumentModal';
import { ConfirmModal } from './ConfirmModal';
import { useFolders } from '../hooks/useFolders';
import { LoadingSkeleton } from './Loading';
import { FolderService } from '../services/api';
import { tokenManager } from '../services/tokenManager';

const folderService = new FolderService();
// Enregistrer le service auprès du gestionnaire de tokens
tokenManager.registerService(folderService);

interface FolderViewProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onDocumentUpdate: (document: Document) => void;
  currentFolderId?: string | null;
  onFolderChange?: (folderId: string | null) => void;
  viewMode?: 'grid' | 'list';
}

export const FolderView: React.FC<FolderViewProps> = ({
  documents,
  onDocumentSelect,
  onDocumentUpdate,
  currentFolderId,
  onFolderChange,
  viewMode = 'grid',
}) => {
  const {
    folders,
    currentFolder,
    loading,
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    navigateToFolder,
  } = useFolders();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [showMoveDocumentModal, setShowMoveDocumentModal] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<Document | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<Array<{ id: string; name: string }>>([]);

  // Filtrer les documents du dossier actuel
  // Si currentFolderId est null (racine), afficher les documents sans folderId (null ou undefined)
  const currentFolderDocuments = documents.filter(doc => {
    if (currentFolderId === null) {
      return doc.folderId === null || doc.folderId === undefined;
    }
    return doc.folderId === currentFolderId;
  });

  // Charger les dossiers au montage et lors du changement de dossier courant
  useEffect(() => {
    loadFolders(currentFolderId || undefined);
  }, [currentFolderId, loadFolders]);

  // Construire le chemin de navigation
  useEffect(() => {
    const buildPath = () => {
      if (!currentFolder) {
        setBreadcrumbPath([]);
        return;
      }

      const path: Array<{ id: string; name: string }> = [];
      let folder: Folder | null = currentFolder;

      while (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        folder = folder.parent ? { ...folder.parent, parentId: undefined, ownerId: '', createdAt: new Date(), updatedAt: new Date(), documentCount: 0, folderCount: 0, totalSize: 0 } as Folder : null;
      }

      setBreadcrumbPath(path);
    };

    buildPath();
  }, [currentFolder]);

  const handleFolderOpen = (folder: Folder) => {
    const newFolderId = folder.id;
    navigateToFolder(newFolderId);
    onFolderChange?.(newFolderId);
  };

  const handleNavigate = (folderId: string | null) => {
    navigateToFolder(folderId);
    onFolderChange?.(folderId);
  };

  const handleBackToParent = () => {
    const parentId = currentFolder?.parentId || null;
    navigateToFolder(parentId);
    onFolderChange?.(parentId);
  };

  const handleCreateFolder = async (data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) => {
    await createFolder({
      ...data,
      parentId: currentFolderId || undefined,
    });
    setShowCreateModal(false);
  };

  const handleEditFolder = async (data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) => {
    if (!folderToEdit) return;
    
    await updateFolder(folderToEdit.id, data);
    setFolderToEdit(null);
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    await deleteFolder(folderToDelete.id, folderToDelete.name);
    setShowDeleteFolderModal(false);
    setFolderToDelete(null);
  };

  const handleMoveDocument = (document: Document) => {
    setDocumentToMove(document);
    setShowMoveDocumentModal(true);
  };

  const handleConfirmMoveDocument = async (documentId: string, folderId: string | null) => {
    try {
      // Utiliser l'API service pour déplacer le document
      await folderService.moveDocumentToFolder(documentId, folderId || undefined);
      
      // Recharger les documents (via le parent)
      onDocumentUpdate(documentToMove!);
      
      setShowMoveDocumentModal(false);
      setDocumentToMove(null);
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
    }
  };

  if (loading && folders.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {currentFolder && (
            <button
              onClick={handleBackToParent}
              className="btn btn-outline btn-sm gap-1 sm:gap-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}
          
          <div className="min-w-0 flex-1">
            <BreadcrumbNavigation
              path={breadcrumbPath}
              onNavigate={handleNavigate}
            />
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-sm gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:hidden">Nouveau</span>
          <span className="hidden sm:inline">Nouveau dossier</span>
        </button>
      </div>

      {/* Titre du dossier courant */}
      {currentFolder && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div
                className="p-2 sm:p-3 rounded-lg flex-shrink-0"
                style={{ backgroundColor: `${currentFolder.color}20` }}
              >
                <FolderIcon
                  className="h-6 w-6 sm:h-8 sm:w-8"
                  style={{ color: currentFolder.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                  {currentFolder.name}
                </h1>
                {currentFolder.description && (
                  <p className="text-base-content/70 mt-1 text-sm sm:text-base">
                    {currentFolder.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-base-content/60">
                  <span>{currentFolder.documentCount} documents</span>
                  <span>{currentFolder.folderCount} dossiers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="space-y-6">
        {/* Dossiers */}
        {folders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FolderIcon className="h-5 w-5 text-base-content/60" />
              <h2 className="text-lg font-medium text-base-content">
                Dossiers ({folders.length})
              </h2>
            </div>
            <div className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                : "space-y-3"
            }`}>
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpen={handleFolderOpen}
                  onEdit={setFolderToEdit}
                  onDelete={setFolderToDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {currentFolderDocuments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-base-content/60" />
              <h2 className="text-lg font-medium text-base-content">
                Documents ({currentFolderDocuments.length})
              </h2>
            </div>
            <div className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                : "space-y-3"
            }`}>
              {currentFolderDocuments.map((document) => (
                <div key={document.id} className="relative group">
                  <DocumentCard
                    document={document}
                    viewMode={viewMode}
                    onToggleFavorite={(doc) => {
                      onDocumentUpdate({ ...doc, favorite: !doc.favorite });
                    }}
                    onPreview={(doc) => {
                      onDocumentSelect(doc);
                    }}
                    onMove={handleMoveDocument}
                  />
                  
                  {/* Bouton de déplacement en overlay */}
                  <button
                    onClick={() => handleMoveDocument(document)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn btn-sm btn-circle bg-base-100 border-base-300 shadow-sm hover:shadow-md z-10"
                    title="Déplacer vers un dossier"
                  >
                    <FolderInput className="h-4 w-4 text-base-content/60" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message vide */}
        {folders.length === 0 && currentFolderDocuments.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-base-content/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-base-content mb-2">
              {currentFolder ? 'Dossier vide' : 'Aucun dossier'}
            </h3>
            <p className="text-base-content/60 mb-4">
              {currentFolder 
                ? 'Ce dossier ne contient aucun document ni sous-dossier.'
                : 'Commencez par créer votre premier dossier pour organiser vos documents.'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus className="h-4 w-4" />
              Créer un dossier
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateFolder}
        parentFolder={currentFolder}
      />

      <CreateFolderModal
        isOpen={!!folderToEdit}
        onClose={() => setFolderToEdit(null)}
        onSubmit={handleEditFolder}
        folderToEdit={folderToEdit}
        title="Modifier le dossier"
      />

      <MoveDocumentModal
        isOpen={showMoveDocumentModal}
        onClose={() => setShowMoveDocumentModal(false)}
        document={documentToMove}
        onMove={handleConfirmMoveDocument}
      />

      <ConfirmModal
        isOpen={showDeleteFolderModal}
        onClose={() => setShowDeleteFolderModal(false)}
        onConfirm={handleConfirmDeleteFolder}
        title="Supprimer le dossier"
        message={`Êtes-vous sûr de vouloir supprimer le dossier "${folderToDelete?.name}" ?`}
        confirmText="Supprimer"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-40">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="loading loading-spinner loading-md text-primary"></span>
                <span className="text-base-content">Chargement...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
