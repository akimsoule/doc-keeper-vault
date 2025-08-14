import { createContext } from 'react';
import { DocumentContextType, ViewMode } from '@/types';

const defaultContext: DocumentContextType = {
  isLoading: false,
  isCreatingDocument: false,
  documents: [],
  categories: [],
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
    field: 'createdAt',
    order: 'desc'
  },
  setFilters: (_filters) => {},
  setPagination: (_pagination) => {},
  setSorting: (_sorting) => {},
  addDocument: async (_document) => {},
  updateDocument: async (_id, _updates) => {},
  deleteDocument: async (_id) => {},
  toggleFavorite: async (_id) => {},
  filteredDocuments: [],
  refreshDocuments: async () => {},
  viewMode: 'grid',
  setViewMode: (_mode: ViewMode) => {}
};

export const DocumentContext = createContext<DocumentContextType>(defaultContext);