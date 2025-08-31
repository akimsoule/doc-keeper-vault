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
  folderId?: string; // ID du dossier parent (null si à la racine)
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  documentCount: number;
  folderCount: number;
  totalSize: number;
  tags?: string[]; // Tags du dossier (pour l'archivage, etc.)
  parent?: {
    id: string;
    name: string;
  };
  children?: Folder[];
}

export interface FolderPath {
  id: string;
  name: string;
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