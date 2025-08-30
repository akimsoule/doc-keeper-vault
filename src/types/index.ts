export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  tags: string[];
  uploadDate: Date;
  lastModified: Date;
  url: string;
  thumbnail?: string;
  favorite: boolean;
  shared: boolean;
  archived: boolean;
  archivedDate?: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  count: number;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'tags';
export type SortOrder = 'asc' | 'desc';

export interface Activity {
  id: string;
  type: 'upload' | 'update' | 'delete' | 'view' | 'download' | 'sync' | 'archive' | 'unarchive';
  documentName: string;
  documentId: string;
  timestamp: string;
  details?: string;
}