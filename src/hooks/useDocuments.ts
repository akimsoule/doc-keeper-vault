import { useState, useEffect, useCallback } from "react";
import { Document } from "../types";
import apiService from "../services/apiService";
import { useUserPreferences } from "./useUserPreferences";

interface UseDocumentsOptions {
  autoLoad?: boolean;
  searchQuery?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  includeArchived?: boolean;
  onlyArchived?: boolean;
}

interface UseDocumentsResult {
  documents: Document[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  // Actions
  loadDocuments: () => Promise<void>;
  createDocument: (data: {
    name: string;
    type: string;
    category: string;
    description?: string;
    tags?: string[];
  }) => Promise<Document | null>;
  uploadDocument: (
    file: File,
    data: {
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      tags?: string[];
    }
  ) => Promise<Document | null>;
  updateDocument: (
    id: string,
    data: {
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      tags?: string[];
      isFavorite?: boolean;
      archived?: boolean;
    }
  ) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  archiveDocument: (id: string) => Promise<boolean>;
  unarchiveDocument: (id: string) => Promise<boolean>;
  searchDocuments: (query: string) => Promise<void>;
  goToPage: (page: number) => void;
  totalPages: number;
  clearError: () => void;
}

export const useDocuments = (
  options: UseDocumentsOptions = {}
): UseDocumentsResult => {
  const { preferences } = useUserPreferences();

  const {
    autoLoad = true,
    searchQuery = "",
    category,
    tag,
    page = 1,
    limit = preferences.itemsPerPage || 20,
    includeArchived = false,
    onlyArchived = false,
  } = options;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentLimit] = useState(limit);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: {
        page: number;
        limit: number;
        category?: string;
        tag?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        includeArchived?: boolean;
      } = {
        page: currentPage,
        limit: currentLimit,
        sortBy: preferences.sortBy || "date",
        sortOrder: preferences.sortOrder || "desc",
        includeArchived: onlyArchived ? true : includeArchived, // Si onlyArchived, toujours inclure
      };

      if (category) params.category = category;
      if (tag) params.tag = tag;
      if (searchQuery) params.search = searchQuery;

      const response = await apiService.getDocuments(params);
      
      console.log('API response:', response);
      console.log('onlyArchived:', onlyArchived);
      console.log('includeArchived param:', params.includeArchived);
      
      // Si onlyArchived est true, filtrer pour ne garder que les documents archivés
      let filteredDocuments = response.documents;
      let filteredTotal = response.total;
      
      if (onlyArchived) {
        filteredDocuments = response.documents.filter(doc => doc.archived);
        filteredTotal = filteredDocuments.length;
        console.log('Filtered archived documents:', filteredDocuments);
      }
      
      setDocuments(filteredDocuments);
      setTotal(filteredTotal);
      setCurrentPage(response.page);
    } catch (err) {
      console.error("Erreur lors du chargement des documents:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des documents"
      );
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    currentLimit,
    category,
    tag,
    searchQuery,
    includeArchived,
    onlyArchived,
    preferences.sortBy,
    preferences.sortOrder,
  ]);

  const createDocument = useCallback(
    async (data: {
      name: string;
      type: string;
      category: string;
      description?: string;
      tags?: string[];
    }): Promise<Document | null> => {
      setLoading(true);
      setError(null);

      try {
        const newDocument = await apiService.createDocument(data);

        // Ajouter le nouveau document à la liste
        setDocuments((prev) => [newDocument, ...prev]);
        setTotal((prev) => prev + 1);

        return newDocument;
      } catch (err) {
        console.error("Erreur lors de la création du document:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la création du document"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const uploadDocument = useCallback(
    async (
      file: File,
      data: {
        name?: string;
        type?: string;
        category?: string;
        description?: string;
        tags?: string[];
      }
    ): Promise<Document | null> => {
      setLoading(true);
      setError(null);

      try {
        const newDocument = await apiService.uploadDocument(file, data);

        // Ajouter le nouveau document à la liste
        setDocuments((prev) => [newDocument, ...prev]);
        setTotal((prev) => prev + 1);

        return newDocument;
      } catch (err) {
        console.error("Erreur lors de l'upload du document:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de l'upload du document"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateDocument = useCallback(
    async (
      id: string,
      data: {
        name?: string;
        type?: string;
        category?: string;
        description?: string;
        tags?: string[];
        isFavorite?: boolean;
      }
    ): Promise<Document | null> => {
      setError(null);

      // Mettre d'abord à jour le document dans la liste (mise à jour optimiste)
      let originalDocument: Document | null = null;
      setDocuments((prev) => {
        return prev.map((doc) => {
          if (doc.id === id) {
            originalDocument = doc; // Sauvegarder l'original pour rollback si nécessaire
            return { ...doc, ...data };
          }
          return doc;
        });
      });

      // Faire le call pour mettre à jour le document en bd
      try {
        const updatedDocument = await apiService.updateDocument(id, data);

        // Mettre à jour avec les données du serveur
        setDocuments((prev) => {
          return prev.map((doc) => (doc.id === id ? updatedDocument : doc));
        });

        return updatedDocument;
      } catch (err) {
        console.error("Erreur lors de la mise à jour du document:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la mise à jour du document"
        );

        // Rollback en cas d'erreur
        if (originalDocument) {
          setDocuments((prev) => {
            return prev.map((doc) => (doc.id === id ? originalDocument! : doc));
          });
        }

        return null;
      }
    },
    []
  );

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await apiService.deleteDocument(id);

      // Supprimer le document de la liste
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setTotal((prev) => prev - 1);

      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression du document:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du document"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.search(query, {
          limit: currentLimit,
          category,
          tag,
        });

        setDocuments(response.results);
        setTotal(response.total);
      } catch (err) {
        console.error("Erreur lors de la recherche des documents:", err);
        setError(
          err instanceof Error ? err.message : "Erreur lors de la recherche"
        );
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    },
    [currentLimit, category, tag]
  );

  // Fonction pour archiver un document
  const archiveDocument = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    // Mettre à jour le document dans la liste
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? { ...doc, archived: true, archivedDate: new Date() }
          : doc
      )
    );

    try {
      await apiService.updateDocument(id, {
        archived: true,
      });

      return true;
    } catch (err) {
      console.error("Erreur lors de l'archivage du document:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'archivage du document"
      );
      return false;
    }
  }, []);

  // Fonction pour désarchiver un document
  const unarchiveDocument = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      // Mettre à jour le document dans la liste
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, archived: false, archivedDate: undefined }
            : doc
        )
      );

      try {
        await apiService.updateDocument(id, {
          archived: false,
        });

        return true;
      } catch (err) {
        console.error("Erreur lors de la désarchivage du document:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors de la désarchivage du document"
        );
        return false;
      }
    },
    []
  );

  // Fonction pour aller à une page spécifique
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(total / currentLimit);

  // Charger les documents automatiquement
  useEffect(() => {
    if (autoLoad) {
      if (searchQuery) {
        searchDocuments(searchQuery);
      } else {
        loadDocuments();
      }
    }
  }, [autoLoad, searchQuery, loadDocuments, searchDocuments]);

  return {
    documents,
    loading,
    error,
    total,
    page: currentPage,
    limit: currentLimit,
    // Actions
    loadDocuments,
    createDocument,
    uploadDocument,
    updateDocument,
    deleteDocument,
    archiveDocument,
    unarchiveDocument,
    searchDocuments,
    goToPage,
    totalPages,
    clearError,
  };
};
