import { useState, useMemo, useEffect, useCallback } from 'react';
import { Files, BarChart3, HelpCircle, Cloud, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { DocumentCard } from '../components/DocumentCard';
import { UploadArea } from '../components/UploadArea';
import { ViewControls } from '../components/ViewControls';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { Pagination } from '../components/Pagination';
import { ErrorMessage } from '../components/ErrorBoundary';
import { LoadingSkeleton } from '../components/Loading';
import { KeyboardShortcutsHelp } from '../components/SwipeGesture';
import { useDocuments } from '../hooks/useDocuments';
import { useViewMode } from '../hooks/useViewMode';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMegaSync } from '../hooks/useMegaSync';
import { Document as DocumentType } from '../types';
import apiService from '../services/apiService';

export const DashboardPage = () => {
  // Hook pour gérer le mode de vue avec localStorage
  const { viewMode, setViewMode } = useViewMode();
  
  // Hook pour gérer les erreurs
  const { handleError } = useErrorHandler();
  
  // Hook pour la synchronisation MEGA
  const { isSyncing, syncMegaFiles } = useMegaSync();
  
  // État de l'application
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [archivedCount, setArchivedCount] = useState(0);
  const [allNonArchivedDocuments, setAllNonArchivedDocuments] = useState<DocumentType[]>([]);
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
    fullDocument: DocumentType | null;
    fileData: { dataUrl: string; type: string } | null;
    loading: boolean;
  }>({
    show: false,
    document: null,
    fullDocument: null,
    fileData: null,
    loading: false,
  });

  // Hook des documents
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    page: currentPage,
    totalPages,
    updateDocument,
    deleteDocument,
    archiveDocument,
    unarchiveDocument,
    loadDocuments,
    uploadDocument,
    goToPage,
    clearError: clearDocumentsError,
  } = useDocuments({
    autoLoad: true,
    searchQuery: searchTerm,
    // Ne pas filtrer par tag côté serveur pour permettre le filtrage multiple côté client
    includeArchived: selectedTags.includes('archive') ? true : includeArchived,
    onlyArchived: selectedTags.includes('archive'),
  });

  // Fonction helper pour les toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
    }
  }, []);

  // Fonction pour charger le nombre de documents archivés
  const loadArchivedCount = useCallback(async () => {
    try {
      // Compter les documents archivés
      const archivedResponse = await apiService.getDocuments({
        page: 1,
        limit: 1000, // Prendre un grand nombre pour compter
        includeArchived: true
      });
      
      const archived = archivedResponse.documents.filter(doc => doc.archived);
      setArchivedCount(archived.length);
      
      // Calculer aussi le total des documents non archivés (pour le bouton "Tous")
      const nonArchived = archivedResponse.documents.filter(doc => !doc.archived);
      setAllNonArchivedDocuments(nonArchived);
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de documents archivés:', error);
    }
  }, []);

  // Charger le nombre de documents archivés au démarrage
  useEffect(() => {
    loadArchivedCount();
  }, [loadArchivedCount]);

  // Fonctions helper pour les catégories
    const getTagColor = useCallback((tag: string): string => {
    const colors: { [key: string]: string } = {
      'archive': '#9CA3AF',
      'travail': '#3B82F6',
      'personnel': '#10B981',
      'important': '#EF4444',
      'finance': '#F59E0B',
      'santé': '#8B5CF6',
      'administration': '#6B7280',
      'projet': '#06B6D4',
      'formation': '#84CC16',
      'juridique': '#F97316',
    };
    return colors[tag.toLowerCase()] || '#6B7280';
  }, []);

  // Fonction de synchronisation MEGA avec useCallback
  const handleSyncMega = useCallback(async () => {
    const result = await syncMegaFiles();
    
    if (result) {
      // Recharger les documents après la synchronisation réussie
      await loadDocuments();
    }
  }, [syncMegaFiles, loadDocuments]);

  // Documents et tags dynamiques
  const { tagsWithCount } = useMemo(() => {
    // Utiliser allNonArchivedDocuments pour calculer les tags (pas documents qui varie selon la vue)
    const documentsForTags = allNonArchivedDocuments;
    
    // Protection contre undefined/null
    if (!Array.isArray(documentsForTags)) {
      return { tagsWithCount: [] };
    }
    
    // Calculer les tags à partir des documents NON ARCHIVÉS
    const tagMap = new Map<string, number>();
    documentsForTags.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });

    const dynamicTags = Array.from(tagMap.entries()).map(([name, count]) => ({
      name,
      count,
      color: getTagColor(name),
    }));
    
    // Ajouter le tag Archive (test avec compteur fixe)
    if (archivedCount > 0) {
      dynamicTags.push({
        name: 'archive',
        count: archivedCount,
        color: getTagColor('archive'),
      });
    }
    
    return { tagsWithCount: dynamicTags };
  }, [allNonArchivedDocuments, archivedCount, getTagColor]);

  // Filtrage côté client des documents par tags sélectionnés
  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    
    // Si aucun tag sélectionné, retourner tous les documents
    if (selectedTags.length === 0) return documents;
    
    // Filtrer par tags sélectionnés (ET logique : le document doit avoir TOUS les tags sélectionnés)
    return documents.filter(doc => {
      const docTags = doc.tags || [];
      return selectedTags.every(selectedTag => 
        docTags.includes(selectedTag)
      );
    });
  }, [documents, selectedTags]);

  // Remettre à la page 1 quand les filtres changent
  useEffect(() => {
    if (currentPage > 1) {
      goToPage(1);
    }
  }, [searchTerm, selectedTags, goToPage, currentPage]);

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
    'ctrl+shift+s': () => {
      // Raccourci pour synchroniser avec MEGA
      if (!isSyncing) {
        handleSyncMega();
      }
    },
    'escape': () => {
      setSearchTerm('');
      setSelectedTags([]);
      setShowFilters(false);
      setShowKeyboardHelp(false);
    },
    'ctrl+?': () => setShowKeyboardHelp(true),
    'f1': () => setShowKeyboardHelp(true),
  }), [showFilters, setViewMode, viewMode, loadDocuments, isSyncing, handleSyncMega]);

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

  const handleUpdateTags = async (id: string, tags: string[]) => {
    try {
      await apiService.updateDocument(id, { tags });
      
      // Actualiser la liste des documents
      await loadDocuments();
      
      // Mettre à jour le document dans le modal si c'est le même
      if (previewModal.fullDocument?.id === id) {
        const updatedDocument = documents.find(doc => doc.id === id);
        if (updatedDocument) {
          setPreviewModal(prev => ({
            ...prev,
            fullDocument: updatedDocument
          }));
        }
      }
      
      showToast('Tags mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des tags:', error);
      showToast('Erreur lors de la mise à jour des tags', 'error');
      handleError(error instanceof Error ? error : new Error('Erreur lors de la mise à jour des tags'));
    }
  };

  const handleShareDocument = async (id: string) => {
    try {
      // Ici on pourrait implémenter la logique de partage
      // Pour l'instant, on copie le lien vers le presse-papier
      const url = `${window.location.origin}/document/${id}`;
      await navigator.clipboard.writeText(url);
      showToast('Lien copié dans le presse-papier', 'success');
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      showToast('Erreur lors du partage', 'error');
    }
  };

  const handleDeleteFromModal = async (id: string) => {
    const success = await deleteDocument(id);
    if (success) {
      closePreviewModal();
      showToast('Document supprimé avec succès', 'success');
    }
  };

  const handleArchiveFromModal = async (id: string) => {
    const success = await archiveDocument(id);
    if (success) {
      // Mettre à jour le document dans le modal
      if (previewModal.fullDocument?.id === id) {
        setPreviewModal(prev => ({
          ...prev,
          fullDocument: prev.fullDocument ? { ...prev.fullDocument, archived: true } : null
        }));
      }
      showToast('Document archivé avec succès', 'success');
    }
  };

  const handleUnarchiveFromModal = async (id: string) => {
    const success = await unarchiveDocument(id);
    if (success) {
      // Mettre à jour le document dans le modal
      if (previewModal.fullDocument?.id === id) {
        setPreviewModal(prev => ({
          ...prev,
          fullDocument: prev.fullDocument ? { ...prev.fullDocument, archived: false } : null
        }));
      }
      showToast('Document désarchivé avec succès', 'success');
    }
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
        fullDocument: document,
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
      fullDocument: null,
      fileData: null,
      loading: false,
    });
  };

  // Fonctions de navigation entre documents
  const getCurrentDocumentIndex = () => {
    if (!previewModal.fullDocument || !Array.isArray(filteredDocuments)) return -1;
    return filteredDocuments.findIndex(doc => doc.id === previewModal.fullDocument!.id);
  };

  const handleNavigatePrevious = () => {
    const currentIndex = getCurrentDocumentIndex();
    if (currentIndex > 0) {
      const previousDocument = filteredDocuments[currentIndex - 1];
      handleViewDocument(previousDocument.id);
    }
  };

  const handleNavigateNext = () => {
    const currentIndex = getCurrentDocumentIndex();
    if (currentIndex >= 0 && currentIndex < filteredDocuments.length - 1) {
      const nextDocument = filteredDocuments[currentIndex + 1];
      handleViewDocument(nextDocument.id);
    }
  };

  const canNavigatePrevious = () => {
    const currentIndex = getCurrentDocumentIndex();
    return currentIndex > 0;
  };

  const canNavigateNext = () => {
    const currentIndex = getCurrentDocumentIndex();
    return currentIndex >= 0 && currentIndex < filteredDocuments.length - 1;
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
          <button
            onClick={handleSyncMega}
            disabled={isSyncing}
            className="btn btn-outline btn-sm gap-2 hover:border-primary hover:text-primary"
            title="Synchroniser les fichiers MEGA"
            aria-label="Synchroniser avec MEGA"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isSyncing ? 'Synchronisation...' : 'Sync MEGA'}
            </span>
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

      {showFilters && (
        <TagFilter
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={tagsWithCount}
          className="mb-4"
        />
      )}

      {/* Archive Filter */}
      {showFilters && !selectedTags.includes('archive') && (
        <div className="mb-4 p-4 bg-base-200 rounded-lg">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
              />
              <span className="label-text">Inclure les documents archivés</span>
            </label>
          </div>
        </div>
      )}

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
                      setSelectedTags([]);
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

      {/* Pagination */}
      {!documentsLoading && filteredDocuments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          isLoading={documentsLoading}
          className="my-8"
        />
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
        fullDocument={previewModal.fullDocument}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteFromModal}
        onArchive={handleArchiveFromModal}
        onUnarchive={handleUnarchiveFromModal}
        onUpdateTags={handleUpdateTags}
        onShare={handleShareDocument}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        canNavigatePrevious={canNavigatePrevious()}
        canNavigateNext={canNavigateNext()}
        currentIndex={getCurrentDocumentIndex()}
        totalDocuments={filteredDocuments.length}
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
          { key: 'Ctrl + Shift + S', description: 'Synchroniser avec MEGA' },
          { key: 'Ctrl + ?', description: 'Afficher cette aide' },
          { key: 'F1', description: 'Afficher cette aide' },
          { key: 'Échap', description: 'Réinitialiser filtres et fermer modals' },
        ]}
      />
    </>
  );
};
