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