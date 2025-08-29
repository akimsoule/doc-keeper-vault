import { useState, useMemo, useEffect, useCallback } from 'react';
import { Files, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { DocumentCard } from '../components/DocumentCard';
import { UploadArea } from '../components/UploadArea';
import { ViewControls } from '../components/ViewControls';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { categories } from '../data/mockData';
import { useDocuments } from '../hooks/useDocuments';
import { useToast } from '../hooks/useToast';
import { useViewMode } from '../hooks/useViewMode';
import apiService from '../services/apiService';

export const DashboardPage = () => {
  // Hook pour gérer le mode de vue avec localStorage
  const { viewMode, setViewMode } = useViewMode();
  
  // État de l'application
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    documentId: string;
    documentName: string;
  }>({
    show: false,
    documentId: '',
    documentName: '',
  });

  const [previewModal, setPreviewModal] = useState<{
    show: boolean;
    document: { id: string; name: string; type: string; size: number } | null;
    fileData: { dataUrl: string; type: string } | null;
    loading: boolean;
  }>({
    show: false,
    document: null,
    fileData: null,
    loading: false,
  });

  // Hook des documents
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    uploadDocument,
    updateDocument,
    deleteDocument,
    searchDocuments,
    loadDocuments,
    clearError: clearDocumentsError,
  } = useDocuments({
    autoLoad: true,
    searchQuery: searchTerm,
    category: selectedCategory,
  });

  // Hook des toasts
  const { addToast } = useToast();

  // Fonction helper pour les toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    addToast({ message, type });
  }, [addToast]);

  // Documents filtrés
  const filteredDocuments = useMemo(() => {
    // Protection contre undefined/null
    if (!Array.isArray(documents)) {
      return [];
    }
    
    return documents.filter((doc) => {
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesCategory = selectedCategory === '' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  // Gestion des erreurs
  useEffect(() => {
    if (documentsError) {
      showToast(documentsError, 'error');
      clearDocumentsError();
    }
  }, [documentsError, showToast, clearDocumentsError]);

  // Handlers des documents
  const handleToggleFavorite = async (id: string) => {
    // Protection contre undefined/null
    if (!Array.isArray(documents)) return;
    
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    const success = await updateDocument(id, {
      isFavorite: !document.favorite,
    });

    if (success) {
      showToast(
        document.favorite ? 'Document retiré des favoris' : 'Document ajouté aux favoris',
        'success'
      );
    }
  };

  const handleDeleteDocument = (id: string) => {
    // Protection contre undefined/null
    if (!Array.isArray(documents)) return;
    
    const document = documents.find(doc => doc.id === id);
    if (!document) return;

    setConfirmDelete({
      show: true,
      documentId: id,
      documentName: document.name,
    });
  };

  const handleViewDocument = async (id: string) => {
    try {
      // Protection contre undefined/null
      if (!Array.isArray(documents)) return;
      
      const document = documents.find(doc => doc.id === id);
      if (!document) return;

      // Ouvrir le modal avec le document et commencer le chargement
      setPreviewModal({
        show: true,
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
          size: document.size
        },
        fileData: null,
        loading: true,
      });

      // Utiliser notre API backend pour obtenir le contenu du document
      const fileData = await apiService.downloadFile(id);
      
      if (fileData.dataUrl) {
        // Mettre à jour le modal avec les données du fichier
        setPreviewModal(prev => ({
          ...prev,
          fileData: {
            dataUrl: fileData.dataUrl!,
            type: fileData.type || 'unknown'
          },
          loading: false,
        }));
      } else {
        setPreviewModal(prev => ({ ...prev, loading: false }));
        showToast('Impossible d\'obtenir le contenu du document', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du document:', error);
      setPreviewModal(prev => ({ ...prev, loading: false }));
      showToast('Erreur lors de l\'ouverture du document', 'error');
    }
  };

  const closePreviewModal = () => {
    setPreviewModal({
      show: false,
      document: null,
      fileData: null,
      loading: false,
    });
  };

  const confirmDeleteDocument = async () => {
    const success = await deleteDocument(confirmDelete.documentId);
    
    if (success) {
      showToast('Document supprimé avec succès', 'success');
    }
    
    setConfirmDelete({
      show: false,
      documentId: '',
      documentName: '',
    });
  };

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      // Déterminer la catégorie en fonction du type de fichier
      let category = 'autres';
      if (file.type.startsWith('image/')) category = 'images';
      else if (file.type.includes('pdf')) category = 'pdf';
      else if (file.type.includes('word') || file.type.includes('document')) category = 'documents';
      else if (file.type.includes('sheet') || file.type.includes('excel')) category = 'tableaux';

      return uploadDocument(file, {
        category,
        tags: ['nouveau'],
      });
    });

    try {
      await Promise.all(uploadPromises);
      showToast(`${files.length} fichier(s) uploadé(s) avec succès`, 'success');
    } catch {
      showToast('Erreur lors de l\'upload des fichiers', 'error');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query && query.length > 2) {
      await searchDocuments(query);
    } else if (query === '') {
      await loadDocuments();
    }
  };

  return (
    <>
      {/* Lien vers les statistiques détaillées */}
      <div className="mb-6">
        <Link
          to="/dashboard/stats"
          className="btn btn-outline btn-primary gap-2 float-right"
        >
          <BarChart3 className="w-4 h-4" />
          Voir les statistiques
        </Link>
        <div className="clear-both"></div>
      </div>

      {/* Upload Area */}
      <UploadArea onFileUpload={handleFileUpload} />

      {/* Search and Filters */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          handleSearch(term);
        }}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showFilters={showFilters}
      />

      {/* View Controls */}
      <ViewControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalDocuments={filteredDocuments.length}
      />

      {/* Loading State */}
      {documentsLoading && (
        <div className="flex justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}

      {/* Documents Grid */}
      {!documentsLoading && (
        <>
          {filteredDocuments.length > 0 ? (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-3'
            }`}>
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteDocument}
                  onView={handleViewDocument}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="hero min-h-96">
              <div className="hero-content text-center">
                <div>
                  <div className="flex justify-center mb-4">
                    <div className="bg-base-200 text-base-content/40 rounded-full w-24 h-24 flex items-center justify-center">
                      <Files className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-base-content mb-2">
                    Aucun document trouvé
                  </h3>
                  <p className="text-base-content/60 mb-6">
                    Essayez de modifier vos critères de recherche ou ajoutez des documents.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      loadDocuments();
                    }}
                    className="btn btn-primary"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmation de suppression */}
      {confirmDelete.show && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmer la suppression</h3>
            <p className="py-4">
              Êtes-vous sûr de vouloir supprimer le document <strong>{confirmDelete.documentName}</strong> ?
              <br />
              Cette action est irréversible.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={confirmDeleteDocument}
                disabled={documentsLoading}
              >
                {documentsLoading && <span className="loading loading-spinner loading-sm"></span>}
                Supprimer
              </button>
              <button
                className="btn"
                onClick={() => setConfirmDelete({ show: false, documentId: '', documentName: '' })}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation */}
      <DocumentPreviewModal
        isOpen={previewModal.show}
        onClose={closePreviewModal}
        document={previewModal.document}
        fileData={previewModal.fileData}
      />
    </>
  );
};
