export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  tags: string[];
  uploadDate: Date;
  lastModified: Date;
  thumbnail?: string;
  favorite: boolean;
  shared: boolean;
  archived: boolean;
  archivedDate?: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  count: number;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface Activity {
  id: string;
  type: 'upload' | 'update' | 'delete' | 'view' | 'download' | 'sync' | 'archive' | 'unarchive';
  documentName: string;
  documentId: string;
  timestamp: string;
  details?: string;
}