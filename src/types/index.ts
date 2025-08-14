export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
  tags: string[];
  category: string;
  description?: string;
  url?: string;
  isFavorite: boolean;
  isTemporary?: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DocumentFilters {
  search: string;
  type: string;
  category: string;
}

export interface DocumentSorting {
  field: DocumentSortField;
  order: SortOrder;
}

export interface DocumentContextType {
  isLoading: boolean;
  isCreatingDocument?: boolean;
  documents: Document[];
  categories: DocumentCategory[];
  filters: DocumentFilters;
  pagination: Pagination;
  sorting: DocumentSorting;
  setFilters: (filters: DocumentFilters) => void;
  setPagination: (pagination: Pagination) => void;
  setSorting: (sorting: DocumentSorting) => void;
  addDocument: (document: CreateDocumentInput) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  toggleFavorite: (id: string) => void;
  filteredDocuments: Document[];
  refreshDocuments: () => Promise<void>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export type DocumentSortField =
  | "name"
  | "createdAt"
  | "modifiedAt"
  | "size"
  | "type";
export type SortOrder = "asc" | "desc";

export type ViewMode = 'grid' | 'list';

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListDocumentsResponse {
  data: {
    documents: Document[];
    pagination: Pagination;
    filters: DocumentFilters;
    sorting: DocumentSorting;
  };
}

export interface CreateDocumentInput {
  name: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
  base64File: string;
  mimeType: string;
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  id: string;
}
