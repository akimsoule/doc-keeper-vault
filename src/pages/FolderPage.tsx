import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import { useFolders } from '../hooks/useFolders';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { AdvancedSearchBar } from '../components/AdvancedSearchBar';
import { ViewControls } from '../components/ViewControls';
import { TagFilter } from '../components/TagFilter';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { FolderView } from '../components/FolderView';
import { BreadcrumbNavigation } from '../components/BreadcrumbNavigation';
import { Document } from '../types';
import { isDocumentArchived, isFolderArchived } from '../utils/tags';

export const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { handleError } = useErrorHandler();
  
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const {
    documents,
    loading,
    error
  } = useDocuments();

  // Hook pour gérer les dossiers
  const {
    folders: allFolders,
    loading: foldersLoading,
    error: foldersError,
    loadFolders
  } = useFolders();

  // Charger les dossiers du dossier courant
  useEffect(() => {
    loadFolders(folderId || undefined);
  }, [folderId, loadFolders]);

  // Clavier shortcuts
  useKeyboardShortcuts({
    onToggleView: () => setViewMode(prev => prev === 'grid' ? 'list' : 'grid'),
    onEscape: () => {
      setSelectedDocument(null);
      setSearchResults([]);
    }
  });

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      handleError(new Error(error));
    }
  }, [error, handleError]);

  // Gestion des erreurs des dossiers
  useEffect(() => {
    if (foldersError) {
      handleError(new Error(foldersError));
    }
  }, [foldersError, handleError]);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDocumentUpdate = (document: Document) => {
    // Logic pour mettre à jour le document
    console.log('Document updated:', document);
  };

  const handleSearchResults = (results: { results?: Document[] }) => {
    setSearchResults(results.results || []);
  };

  const displayedDocuments = searchResults.length > 0 ? searchResults : documents;

  // Filtrer les dossiers par tags sélectionnés et gestion spéciale du tag "archived"
  const filteredFolders = useMemo(() => {
    let filtered = allFolders;

    // Si le tag "archived" est sélectionné, montrer SEULEMENT les dossiers archivés
    if (selectedTags.includes('archived')) {
      filtered = filtered.filter(folder => isFolderArchived(folder));
    } else {
      // Sinon, exclure les dossiers archivés par défaut
      filtered = filtered.filter(folder => !isFolderArchived(folder));
    }

    // Appliquer les autres filtres de tags (excluant "archived")
    const otherSelectedTags = selectedTags.filter(tag => tag !== 'archived');
    if (otherSelectedTags.length > 0) {
      filtered = filtered.filter(folder => {
        if (!folder.tags || !Array.isArray(folder.tags)) return false;
        return otherSelectedTags.every(selectedTag => 
          folder.tags!.includes(selectedTag)
        );
      });
    }

    return filtered;
  }, [allFolders, selectedTags]);

  // Filtrer les documents par tags sélectionnés et gestion spéciale du tag "archived"
  const filteredDocuments = useMemo(() => {
    let filtered = displayedDocuments;

    // Si le tag "archived" est sélectionné, montrer SEULEMENT les documents archivés
    if (selectedTags.includes('archived')) {
      filtered = filtered.filter(doc => isDocumentArchived(doc));
    } else {
      // Sinon, exclure les documents archivés par défaut
      filtered = filtered.filter(doc => !isDocumentArchived(doc));
    }

    // Appliquer les autres filtres de tags (excluant "archived")
    const otherSelectedTags = selectedTags.filter(tag => tag !== 'archived');
    if (otherSelectedTags.length > 0) {
      filtered = filtered.filter(doc => {
        if (!doc.tags || !Array.isArray(doc.tags)) return false;
        return otherSelectedTags.every(selectedTag => 
          doc.tags.includes(selectedTag)
        );
      });
    }

    return filtered;
  }, [displayedDocuments, selectedTags]);

  // Calculer les tags disponibles à partir des documents ET des dossiers
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    // Compter les documents archivés
    const archivedDocuments = displayedDocuments.filter(doc => isDocumentArchived(doc)).length;
    // Compter les dossiers archivés
    const archivedFolders = allFolders.filter(folder => isFolderArchived(folder)).length;
    const totalArchived = archivedDocuments + archivedFolders;
    
    if (totalArchived > 0) {
      tagCounts.set('archived', totalArchived);
    }
    
    // Compter les autres tags des documents (seulement pour les documents non archivés)
    const nonArchivedDocuments = displayedDocuments.filter(doc => !isDocumentArchived(doc));
    nonArchivedDocuments.forEach(doc => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach(tag => {
          if (tag && tag.trim() && tag !== 'archived') {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          }
        });
      }
    });

    // Compter les autres tags des dossiers (seulement pour les dossiers non archivés)
    const nonArchivedFolders = allFolders.filter(folder => !isFolderArchived(folder));
    nonArchivedFolders.forEach(folder => {
      if (folder.tags && Array.isArray(folder.tags)) {
        folder.tags.forEach(tag => {
          if (tag && tag.trim() && tag !== 'archived') {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          }
        });
      }
    });

    return Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      count,
      color: name === 'archived' ? '#9CA3AF' : undefined // Couleur grise pour archived
    }));
  }, [displayedDocuments, allFolders]);

  if (loading || foldersLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <BreadcrumbNavigation path={[]} />
        
        {/* Barre de recherche */}
        <AdvancedSearchBar
          onSearchResults={handleSearchResults}
          onFiltersToggle={setShowFilters}
          placeholder="Rechercher dans ce dossier..."
        />
        
        {/* Contrôles de vue */}
        <ViewControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalDocuments={filteredDocuments.length}
        />
        
        {/* Filtre de tags */}
        {showFilters && (
          <TagFilter
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
          />
        )}
        
        {/* Vue des dossiers et documents */}
        <FolderView
          documents={filteredDocuments}
          folders={filteredFolders}
          onDocumentSelect={handleDocumentSelect}
          onDocumentUpdate={handleDocumentUpdate}
          currentFolderId={folderId}
          viewMode={viewMode}
        />
        
        {/* Modal de prévisualisation */}
        {selectedDocument && (
          <DocumentPreviewModal
            isOpen={!!selectedDocument}
            onClose={() => setSelectedDocument(null)}
            document={selectedDocument}
            fullDocument={selectedDocument}
          />
        )}
      </div>
    </div>
  );
};
