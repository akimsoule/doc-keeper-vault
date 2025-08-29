import { useState, useEffect, useCallback } from 'react';
import { Document } from '../types';
import apiService from '../services/apiService';

interface UseDocumentsOptions {
  autoLoad?: boolean;
  searchQuery?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
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
  uploadDocument: (file: File, data: {
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    tags?: string[];
  }) => Promise<Document | null>;
  updateDocument: (id: string, data: {
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
  }) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  searchDocuments: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useDocuments = (options: UseDocumentsOptions = {}): UseDocumentsResult => {
  const {
    autoLoad = true,
    searchQuery = '',
    category,
    tag,
    page = 1,
    limit = 20
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
      } = {
        page: currentPage,
        limit: currentLimit,
      };
      
      if (category) params.category = category;
      if (tag) params.tag = tag;
      if (searchQuery) params.search = searchQuery;
      
      const response = await apiService.getDocuments(params);
      
      setDocuments(response.documents);
      setTotal(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, category, tag, searchQuery]);

  const createDocument = useCallback(async (data: {
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
      setDocuments(prev => [newDocument, ...prev]);
      setTotal(prev => prev + 1);
      
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du document');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, data: {
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    tags?: string[];
  }): Promise<Document | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newDocument = await apiService.uploadDocument(file, data);
      
      // Ajouter le nouveau document à la liste
      setDocuments(prev => [newDocument, ...prev]);
      setTotal(prev => prev + 1);
      
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload du document');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (id: string, data: {
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
  }): Promise<Document | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedDocument = await apiService.updateDocument(id, data);
      
      // Mettre à jour le document dans la liste
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );
      
      return updatedDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du document');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteDocument(id);
      
      // Supprimer le document de la liste
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setTotal(prev => prev - 1);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du document');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(async (query: string) => {
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [currentLimit, category, tag]);

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
    searchDocuments,
    clearError,
  };
};
