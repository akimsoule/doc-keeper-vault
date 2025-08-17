import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { documentService, handleApiError } from '../services/api';
import type { Document, DocumentSearchResult, SearchParams } from '../types';
import DocumentList from '../components/DocumentList';
import DocumentViewer from '../components/DocumentViewer';
import DocumentEditModal from '../components/DocumentEditModal';
import TagsFilter from '../components/TagsFilter';
import toast from 'react-hot-toast';

const DashboardSearch: React.FC = () => {
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Chargement initial seulement
    const load = async () => {
      setIsLoading(true);
      try {
        const initialParams = {
          page: 1,
          pageSize: 12,
          search: '',
          type: '',
          category: '',
          tags: [],
          sortBy: 'createdAt',
          sortOrder: 'desc' as const,
        };
        const result = await documentService.getDocuments(initialParams);
        setSearchResult(result);
        setDocuments(result.documents);
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []); // Seulement au premier chargement

  // Cleanup du timeout au démontage
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const performSearch = useCallback(async (params: SearchParams) => {
    setIsSearching(true);
    try {
      const result = await documentService.getDocuments(params);
      setSearchResult(result);
      setDocuments(result.documents);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback((params: SearchParams) => {
    // Annuler la recherche précédente si elle existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si c'est une recherche par texte, on debounce
    if (params.search !== searchParams.search) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(params);
      }, 300); // 300ms de délai
    } else {
      // Pour les autres filtres (type, catégorie, tags), recherche immédiate
      performSearch(params);
    }
  }, [searchParams.search, performSearch]);

  const handleSearchChange = (params: SearchParams) => {
    setSearchParams(params);
    debouncedSearch(params);
  };

  const handleTagsChange = (tags: string[]) => {
    const newParams = { ...searchParams, tags, page: 1 };
    setSearchParams(newParams);
    debouncedSearch(newParams);
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
        toast.success(`💝 "${document.name}" ajouté aux favoris`);
      } else {
        toast(`🗑️ "${document.name}" retiré des favoris`);
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
            <Search className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold">Rechercher dans vos documents</h1>
          </div>
          
          <div className="space-y-4">
            {/* Filtres par tags */}
            <TagsFilter
              selectedTags={searchParams.tags || []}
              onTagsChange={handleTagsChange}
            />
            
            {/* Indicateur de recherche en cours */}
            {isSearching && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="loading loading-spinner loading-sm"></span>
                <span className="text-sm text-base-content/60">Recherche en cours...</span>
              </div>
            )}
            
            {/* Toujours afficher DocumentList pour avoir la barre de recherche */}
            <DocumentList
              documents={documents}
              searchParams={searchParams}
              totalPages={searchResult.totalPages}
              currentPage={searchResult.currentPage}
              totalCount={searchResult.totalCount}
              isLoading={isLoading || isSearching}
              onSearchChange={handleSearchChange}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onToggleFavorite={handleToggleFavorite}
            />
            
            {/* Message d'aide quand aucune recherche n'est active */}
            {!searchParams.search && !searchParams.type && !searchParams.category && (!searchParams.tags || searchParams.tags.length === 0) && (
              <div className="text-center py-8">
                <Search className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Commencez votre recherche</h3>
                <p className="text-base-content/60">
                  Utilisez la barre de recherche ci-dessus, les filtres ou sélectionnez des tags pour trouver vos documents
                </p>
              </div>
            )}
          </div>
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

export default DashboardSearch;
