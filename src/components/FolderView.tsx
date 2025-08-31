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
      const apiService = await import('../services/apiService');
      await apiService.default.moveDocumentToFolder(documentId, folderId || undefined);
      
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentFolder && (
            <button
              onClick={handleBackToParent}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          )}
          
          <BreadcrumbNavigation
            path={breadcrumbPath}
            onNavigate={handleNavigate}
          />
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4" />
          Nouveau dossier
        </button>
      </div>

      {/* Titre du dossier courant */}
      {currentFolder && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${currentFolder.color}20` }}
            >
              <FolderIcon
                className="h-8 w-8"
                style={{ color: currentFolder.color }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentFolder.name}
              </h1>
              {currentFolder.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {currentFolder.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{currentFolder.documentCount} documents</span>
                <span>{currentFolder.folderCount} dossiers</span>
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
              <FolderIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Dossiers ({folders.length})
              </h2>
            </div>
            <div className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Documents ({currentFolderDocuments.length})
              </h2>
            </div>
            <div className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-sm hover:shadow-md z-10"
                    title="Déplacer vers un dossier"
                  >
                    <FolderInput className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message vide */}
        {folders.length === 0 && currentFolderDocuments.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {currentFolder ? 'Dossier vide' : 'Aucun dossier'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {currentFolder 
                ? 'Ce dossier ne contient aucun document ni sous-dossier.'
                : 'Commencez par créer votre premier dossier pour organiser vos documents.'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
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
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-white">Chargement...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
