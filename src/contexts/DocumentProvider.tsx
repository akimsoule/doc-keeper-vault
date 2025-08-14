import { useCallback, useEffect, useState, useRef } from "react";
import {
  DocumentCategory,
  Document,
  DocumentSortField,
  SortOrder,
  CreateDocumentInput,
  ViewMode,
} from "@/types";
import { DocumentContext } from "./DocumentContext";
import {
  serviceCreateDocument,
  serviceListDocuments,
  serviceUpdateDocument,
  serviceDeleteDocument,
} from "@/services/documentService";
import { useErrorHandler } from "@/lib/errorHandler";

const defaultCategories: DocumentCategory[] = [
  { id: "pdf", name: "PDF", color: "destructive", icon: "FileText" },
  { id: "image", name: "Images", color: "success", icon: "Image" },
  { id: "document", name: "Documents", color: "primary", icon: "File" },
  { id: "spreadsheet", name: "Tableurs", color: "warning", icon: "Table" },
  {
    id: "presentation",
    name: "Présentations",
    color: "secondary",
    icon: "Presentation",
  },
  { id: "archive", name: "Archives", color: "muted", icon: "Archive" },
];

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const { showError, showSuccess } = useErrorHandler();
  const [state, setState] = useState({
    documents: [] as Document[],
    filters: {
      search: '',
      type: '',
      category: ''
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    },
    sorting: {
      field: 'createdAt' as DocumentSortField,
      order: 'desc' as SortOrder
    }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      if (typeof window === 'undefined') return 'grid';
      const stored = window.localStorage.getItem('doc_view_mode');
      return stored === 'list' ? 'list' : 'grid';
    } catch (e) {
      return 'grid';
    }
  });

  const categories = defaultCategories;

  // Persist viewMode to localStorage when it changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem('doc_view_mode', viewMode);
    } catch (e) {
      // ignore
    }
  }, [viewMode]);

  // Ref pour éviter les boucles infinies
  const loadingRef = useRef(false);
  const previousParamsRef = useRef<string>('');
  
  // Extraire les valeurs primitives pour éviter les références d'objet qui changent
  const page = state.pagination.page;
  const pageSize = state.pagination.pageSize;
  const search = state.filters.search;
  const type = state.filters.type;
  const category = state.filters.category;
  const sortField = state.sorting.field;
  const sortOrder = state.sorting.order;

  // Fonction pour charger les documents avec les paramètres actuels
  const loadDocuments = useCallback(async () => {
    if (loadingRef.current) return; // Éviter les appels concurrents
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Chargement documents avec paramètres:", {
        page, pageSize, search, type, category, sortField, sortOrder
      });
      
      const res = await serviceListDocuments({
        page,
        pageSize,
        search,
        type,
        category,
        sortBy: sortField,
        sortOrder,
      });
      const data = res.data;
      
      // Mettre à jour seulement les documents et la pagination réelle
      setState(prev => ({
        ...prev,
        documents: data.documents,
        pagination: {
          ...prev.pagination,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      }));
    } catch (err) {
      console.error("Erreur fetch documents:", err);
      showError(err, "Impossible de charger les documents");
      setState(prev => ({
        ...prev,
        documents: [],
        pagination: {
          ...prev.pagination,
          total: 0,
          totalPages: 0
        }
      }));
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [
    page,
    pageSize,
    search,
    type,
    category,
    sortField,
    sortOrder,
    showError,
  ]);

  // Chargement initial - une seule fois au montage
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionnellement vide pour ne charger qu'une fois

  // Recharger les documents quand les paramètres changent (avec protection contre les boucles)
  useEffect(() => {
    // Créer une chaîne des paramètres pour détecter les changements réels
    const currentParams = JSON.stringify({
      search, type, category, sortField, sortOrder, page, pageSize
    });
    
    // Si les paramètres ont vraiment changé et qu'on n'est pas en cours de chargement
    if (currentParams !== previousParamsRef.current && !loadingRef.current) {
      console.log("Paramètres changés, rechargement nécessaire:", {
        previous: previousParamsRef.current,
        current: currentParams
      });
      
      previousParamsRef.current = currentParams;
      
      // Débounce pour éviter trop d'appels
      const timeoutId = setTimeout(() => {
        if (!loadingRef.current) {
          loadDocuments();
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, category, sortField, sortOrder, page, pageSize]);

  // Fonction fetchDocuments pour la compatibilité avec le reste du code
  const fetchDocuments = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  // Fonction pour actualisation manuelle - exposée dans le context
  const refreshDocuments = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  const addDocument = async (documentData: CreateDocumentInput) => {
    setIsCreatingDocument(true);
    
    // Créer un document temporaire pour l'affichage optimiste
    const tempDocument: Document = {
      id: `temp-${Date.now()}`,
      name: documentData.name,
      type: documentData.type,
      size: 0, // Taille temporaire
      createdAt: new Date(),
      modifiedAt: new Date(),
      tags: documentData.tags || [],
      category: documentData.category,
      description: documentData.description,
      isFavorite: false,
      url: '',
      isTemporary: true // Marqueur pour indiquer que c'est un document temporaire
    };

    // Ajouter immédiatement le document temporaire à la liste
    setState(prev => ({
      ...prev,
      documents: [tempDocument, ...prev.documents],
      pagination: {
        ...prev.pagination,
        total: prev.pagination.total + 1
      }
    }));

    try {
      await serviceCreateDocument(documentData);
      // Supprimer le document temporaire et rafraîchir la liste
      setState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== tempDocument.id)
      }));
      await fetchDocuments();
      showSuccess("Document créé", "Le document a été créé avec succès");
    } catch (error) {
      // En cas d'erreur, supprimer le document temporaire
      setState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== tempDocument.id),
        pagination: {
          ...prev.pagination,
          total: prev.pagination.total - 1
        }
      }));
      
      console.error("Erreur création document:", error);
      showError(error, "Échec de la création du document");
      throw error;
    } finally {
      setIsCreatingDocument(false);
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      await serviceUpdateDocument({ id, ...updates });
      await fetchDocuments();
      showSuccess("Document modifié", "Le document a été modifié avec succès");
    } catch (error) {
      console.error("Erreur mise à jour document:", error);
      showError(error, "Échec de la modification du document");
      throw error;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await serviceDeleteDocument(id);
      await fetchDocuments();
      showSuccess("Document supprimé", "Le document a été supprimé avec succès");
    } catch (error) {
      console.error("Erreur suppression document:", error);
      showError(error, "Échec de la suppression du document");
      throw error;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const currentDoc = state.documents.find((doc) => doc.id === id);
      if (!currentDoc) throw new Error("Document non trouvé");
      await updateDocument(id, {
        isFavorite: !currentDoc.isFavorite,
      });
      const action = currentDoc.isFavorite ? "retiré des" : "ajouté aux";
      showSuccess("Favoris mis à jour", `Document ${action} favoris`);
    } catch (error) {
      console.error("Erreur lors du changement de favori:", error);
      showError(error, "Échec de la modification des favoris");
      throw error;
    }
  };

  const filteredDocuments = state.documents;

  return (
    <DocumentContext.Provider
      value={{
        isLoading,
        isCreatingDocument,
        documents: state.documents,
        categories,
        filters: state.filters,
        pagination: state.pagination,
        sorting: state.sorting,
        setFilters: (filters) => setState(prev => ({ ...prev, filters })),
        setPagination: (pagination) => setState(prev => ({ ...prev, pagination })),
        setSorting: (sorting) => setState(prev => ({ ...prev, sorting })),
        addDocument,
        updateDocument,
        deleteDocument,
        toggleFavorite,
        filteredDocuments,
        refreshDocuments, // Nouvelle fonction pour actualisation manuelle
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
