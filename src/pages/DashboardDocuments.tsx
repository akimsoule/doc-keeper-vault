import React, { useState, useEffect } from 'react';
import { documentService, handleApiError } from '../services/api';
import type { Document, DocumentSearchResult, SearchParams, DocumentUpload } from '../types';
import FileUpload from '../components/FileUpload';
import DocumentList from '../components/DocumentList';
import DocumentViewer from '../components/DocumentViewer';
import DocumentEditModal from '../components/DocumentEditModal';
import toast from 'react-hot-toast';

const DashboardDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResult, setSearchResult] = useState<DocumentSearchResult>({
    documents: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 12,
    search: '',
    type: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await documentService.getDocuments(searchParams);
        setSearchResult(result);
        setDocuments(result.documents);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const handleUpload = async (upload: DocumentUpload): Promise<void> => {
    setIsUploading(true);
    try {
      await documentService.uploadDocument(upload);
      toast.success('Document téléchargé avec succès !');
      
      // Recharger les documents
      const result = await documentService.getDocuments(searchParams);
      setSearchResult(result);
      setDocuments(result.documents);
    } catch (error) {
      toast.error(handleApiError(error));
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearchChange = (params: SearchParams) => {
    setSearchParams(params);
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Document>): Promise<void> => {
    try {
      const updatedDocument = await documentService.updateDocument(id, updates);
      toast.success('Document mis à jour avec succès !');
      
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );
      
      if (selectedDocument?.id === id) {
        setSelectedDocument(updatedDocument);
      }
    } catch (error) {
      toast.error(handleApiError(error));
      throw error;
    }
  };

  const handleDelete = async (document: Document) => {
    const modal = window.document.getElementById('delete-modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
      
      const handleConfirm = async () => {
        try {
          await documentService.deleteDocument(document.id);
          toast.success('Document supprimé avec succès !');
          
          setDocuments(prev => prev.filter(doc => doc.id !== document.id));
          
          if (selectedDocument?.id === document.id) {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }
          
          modal.close();
        } catch (error) {
          toast.error(handleApiError(error));
        }
      };

      const confirmBtn = modal.querySelector('#confirm-delete');
      const cancelBtn = modal.querySelector('#cancel-delete');
      
      if (confirmBtn && cancelBtn) {
        confirmBtn.addEventListener('click', handleConfirm, { once: true });
        cancelBtn.addEventListener('click', () => modal.close(), { once: true });
      }
    }
  };

  const handleToggleFavorite = async (document: Document) => {
    try {
      const updatedDocument = await documentService.toggleFavorite(document.id, document.isFavorite);
      
      setDocuments(prev => 
        prev.map(doc => doc.id === document.id ? updatedDocument : doc)
      );
      
      if (selectedDocument?.id === document.id) {
        setSelectedDocument(updatedDocument);
      }
      
      if (updatedDocument.isFavorite) {
        toast.success(`💝 "${document.name}" ajouté aux favoris`, {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#ffffff',
            border: '1px solid #059669',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10b981',
          },
        });
      } else {
        toast(`🗑️ "${document.name}" retiré des favoris`, {
          duration: 2500,
          style: {
            background: '#f97316',
            color: '#ffffff',
            border: '1px solid #ea580c',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          icon: '❌',
        });
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { url } = await documentService.getDocumentUrl(document.id);
      
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      toast.success('Téléchargement démarré');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };
  
  const handleSyncMegaFiles = async () => {
    try {
      const result = await documentService.syncMegaFiles();
      
      if (result.syncedFiles > 0) {
        toast.success(`${result.syncedFiles} document(s) synchronisé(s) depuis MEGA !`, {
          duration: 4000,
        });
        
        // Recharger les documents
        const updatedResult = await documentService.getDocuments(searchParams);
        setSearchResult(updatedResult);
        setDocuments(updatedResult.documents);
      } else {
        toast.success('Tous les fichiers sont déjà synchronisés', {
          duration: 3000,
          icon: '👍',
        });
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mes Documents</h1>
        </div>

        <FileUpload 
          onUpload={handleUpload} 
          isUploading={isUploading} 
        />
        
        <DocumentList
          documents={documents}
          searchParams={searchParams}
          totalPages={searchResult.totalPages}
          currentPage={searchResult.currentPage}
          totalCount={searchResult.totalCount}
          isLoading={isLoading}
          onSearchChange={handleSearchChange}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
          onSyncMegaFiles={handleSyncMegaFiles}
        />
      </div>

      {/* Modals */}
      <DocumentViewer
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedDocument(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
      />

      <DocumentEditModal
        document={selectedDocument}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDocument(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Modal de confirmation de suppression */}
      <dialog id="delete-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirmer la suppression</h3>
          <p className="py-4">
            Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
          </p>
          <div className="modal-action">
            <button id="cancel-delete" className="btn btn-ghost">
              Annuler
            </button>
            <button id="confirm-delete" className="btn btn-error">
              Supprimer
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default DashboardDocuments;
