import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { documentService, handleApiError } from '../services/api';
import type { Document, SearchParams } from '../types';
import DocumentList from '../components/DocumentList';
import DocumentViewer from '../components/DocumentViewer';
import DocumentEditModal from '../components/DocumentEditModal';
import toast from 'react-hot-toast';

const DashboardFavorites: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 12,
    search: '',
    type: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isFavorite: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await documentService.getDocuments({ isFavorite: true });
        setDocuments(result.documents);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSearchChange = (params: SearchParams) => {
    setSearchParams({ ...params, isFavorite: true });
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
      
      // Si le document n'est plus favori, le retirer de la liste
      if (!updatedDocument.isFavorite) {
        setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        toast(`🗑️ "${document.name}" retiré des favoris`);
      } else {
        setDocuments(prev => 
          prev.map(doc => doc.id === document.id ? updatedDocument : doc)
        );
        toast.success(`💝 "${document.name}" ajouté aux favoris`);
      }
      
      if (selectedDocument?.id === document.id) {
        setSelectedDocument(updatedDocument);
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

  return (
    <>
      <div className="space-y-6">
        <div className="bg-base-100 rounded-box p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-semibold">Mes documents favoris</h1>
          </div>
          
          <DocumentList
            documents={documents}
            searchParams={searchParams}
            totalPages={1}
            currentPage={1}
            totalCount={documents.length}
            isLoading={isLoading}
            onSearchChange={handleSearchChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
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

export default DashboardFavorites;
