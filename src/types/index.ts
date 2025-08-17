// Types pour l'application de gestion de documents

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  description?: string;
  tags: string[];
  fileId: string;
  ownerId: string;
  isFavorite: boolean;
  createdAt: string;
  modifiedAt: string;
  previewUrl?: string;
}

export interface DocumentSearchResult {
  documents: Document[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  category?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isFavorite?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DocumentUpload {
  file: File;
  name: string;
  type: string;
  category: string;
  description?: string;
  tags: string[];
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

// Constantes pour les types de fichiers
export const FILE_TYPES = {
  PDF: 'pdf',
  IMAGE: 'image',
  DOCUMENT: 'document',
  SPREADSHEET: 'spreadsheet',
  OTHER: 'other'
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

// Constantes pour les catégories
export const CATEGORIES = {
  PERSONAL: 'personnel',
  WORK: 'professionnel',
  LEGAL: 'juridique',
  MEDICAL: 'médical',
  FINANCIAL: 'financier',
  OTHER: 'autre'
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

// Constantes pour le tri
export const SORT_OPTIONS = {
  CREATED_AT: 'createdAt',
  MODIFIED_AT: 'modifiedAt',
  NAME: 'name',
  SIZE: 'size',
  TYPE: 'type'
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

// Types pour les logs d'activité
export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  createdAt: string;
  document?: {
    id: string;
    name: string;
    type: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ActivityResponse {
  logs: ActivityLog[];
  totalCount: number;
  hasMore: boolean;
}

// Types pour la configuration MEGA
export interface MegaConfig {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MegaConfigForm {
  email: string;
  password: string;
  isActive?: boolean;
  testConnection?: boolean;
}
