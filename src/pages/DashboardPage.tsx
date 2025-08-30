import { useState, useMemo, useEffect, useCallback } from 'react';
import { Files, BarChart3, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { DocumentCard } from '../components/DocumentCard';
import { UploadArea } from '../components/UploadArea';
import { ViewControls } from '../components/ViewControls';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { ErrorMessage } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/Loading';
import { KeyboardShortcutsHelp } from '../components/SwipeGesture';
import { useDocuments } from '../hooks/useDocuments';
import { useToast } from '../hooks/useToast';
import { useViewMode } from '../hooks/useViewMode';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Category } from '../types';
import apiService from '../services/apiService';

export const DashboardPage = () => {
  // Hook pour gérer le mode de vue avec localStorage
  const { viewMode, setViewMode } = useViewMode();
  
  // Hook pour gérer les erreurs
  const { handleError } = useErrorHandler();
  
  // État de l'application
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
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
    loadDocuments,
    clearError: clearDocumentsError,
  } = useDocuments({
    autoLoad: true,
    // Ne pas passer searchQuery et category ici pour récupérer TOUS les documents
    // Le filtrage se fera dans le useMemo ci-dessous
  });

  // Hook des toasts
  const { addToast } = useToast();

  // Fonction helper pour les toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    addToast({ message, type });
  }, [addToast]);

  // Fonctions helper pour les catégories
  const getCategoryColor = useCallback((category: string): string => {
    const colors: Record<string, string> = {
      images: '#10b981',
      documents: '#3b82f6', 
      pdf: '#ef4444',
      tableaux: '#f59e0b',
      videos: '#8b5cf6',
      autres: '#6b7280',
    };
    return colors[category] || '#6b7280';
  }, []);

  const getCategoryIcon = useCallback((category: string): string => {
    const icons: Record<string, string> = {
      images: '🖼️',
      documents: '📄',
      pdf: '📕',
      tableaux: '📊',
      videos: '🎥',
      autres: '📁',
    };
    return icons[category] || '📁';
  }, []);

  // Documents filtrés et catégories dynamiques
  const { filteredDocuments, categories, totalDocuments } = useMemo(() => {
    // Protection contre undefined/null
    if (!Array.isArray(documents)) {
      return { filteredDocuments: [], categories: [], totalDocuments: 0 };
    }
    
    // Calculer le total des documents originaux (non filtrés)
    const total = documents.length;
    
    // Calculer les catégories à partir des documents
    const categoryMap = new Map<string, number>();
    documents.forEach(doc => {
      const category = doc.category || 'autres';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const dynamicCategories: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      color: getCategoryColor(name),
      icon: getCategoryIcon(name),
      count,
    }));

    // Filtrer les documents
    const filtered = documents.filter((doc) => {
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesCategory = selectedCategory === '' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    return { filteredDocuments: filtered, categories: dynamicCategories, totalDocuments: total };
  }, [documents, searchTerm, selectedCategory, getCategoryColor, getCategoryIcon]);

  // Configuration des raccourcis clavier
  const keyboardShortcuts = useMemo(() => ({
    'ctrl+k': () => {
      // Focus sur la barre de recherche
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    'ctrl+f': () => setShowFilters(!showFilters),
    'ctrl+g': () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
    'ctrl+r': () => loadDocuments(),
    'escape': () => {
      setSearchTerm('');
      setSelectedCategory('');
      setShowFilters(false);
      setShowKeyboardHelp(false);
    },
    'ctrl+?': () => setShowKeyboardHelp(true),
    'f1': () => setShowKeyboardHelp(true),
  }), [showFilters, setViewMode, viewMode, loadDocuments]);

  // Hook pour les raccourcis clavier
  useKeyboardShortcuts(keyboardShortcuts);

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
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ouverture du document';
      showToast(errorMessage, 'error');
      handleError(error instanceof Error ? error : new Error('Erreur lors de l\'ouverture du document'));
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload des fichiers';
      showToast(errorMessage, 'error');
      handleError(error instanceof Error ? error : new Error('Erreur lors de l\'upload des fichiers'));
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    // Le filtrage se fait automatiquement dans le useMemo
  };

  return (
    <>
      {/* Header avec liens et bouton d'aide */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Documents</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Gérez vos documents en toute sécurité
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="btn btn-ghost btn-square btn-sm"
            title="Aide et raccourcis clavier (F1)"
            aria-label="Afficher l'aide des raccourcis clavier"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <Link
            to="/dashboard/stats"
            className="btn btn-outline btn-primary gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Voir les statistiques</span>
          </Link>
        </div>
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
        totalDocuments={totalDocuments}
      />

      {/* View Controls */}
      <ViewControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalDocuments={filteredDocuments.length}
      />

      {/* Loading State */}
      {documentsLoading && (
        <LoadingSkeleton 
          type={viewMode === 'grid' ? 'card' : 'list'} 
          count={6}
          className="mt-6"
        />
      )}

      {/* Error State */}
      {documentsError && (
        <ErrorMessage
          error={documentsError}
          onRetry={() => {
            clearDocumentsError();
            loadDocuments();
          }}
          className="mt-6"
        />
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

      {/* Aide des raccourcis clavier */}
      <KeyboardShortcutsHelp
        isVisible={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={[
          { key: 'Ctrl + K', description: 'Recherche rapide' },
          { key: 'Ctrl + F', description: 'Afficher/masquer les filtres' },
          { key: 'Ctrl + G', description: 'Basculer vue grille/liste' },
          { key: 'Ctrl + R', description: 'Actualiser les documents' },
          { key: 'Ctrl + ?', description: 'Afficher cette aide' },
          { key: 'F1', description: 'Afficher cette aide' },
          { key: 'Échap', description: 'Réinitialiser filtres et fermer modals' },
        ]}
      />
    </>
  );
};
