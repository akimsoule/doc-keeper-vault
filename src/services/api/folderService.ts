import { BaseApiService } from './baseService';
import { Folder, Document } from '../../types';
import { cacheService } from '../cacheService';

// Document du backend (avec isFavorite)
interface BackendDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  tags: string;
  ownerId: string;
  isFavorite: boolean;
  archived?: boolean;
  archivedAt?: string;
  createdAt: string;
  modifiedAt: string;
  description?: string;
  hash: string;
  fileId: string;
  folderId?: string; // ID du dossier parent
}

// Adaptateur pour convertir les documents du backend vers l'interface frontend
const adaptBackendDocument = (backendDoc: BackendDocument): Document => ({
  id: backendDoc.id,
  name: backendDoc.name,
  type: backendDoc.type,
  size: backendDoc.size,
  tags: backendDoc.tags
    ? backendDoc.tags.split(",").filter((tag) => tag.trim())
    : [],
  uploadDate: new Date(backendDoc.createdAt),
  lastModified: new Date(backendDoc.modifiedAt),
  url: `/.netlify/functions/documents/${backendDoc.id}/download`,
  favorite: backendDoc.isFavorite,
  shared: false, // TODO: implémenter le partage dans le backend
  thumbnail: undefined, // TODO: implémenter les thumbnails
  folderId: backendDoc.folderId || undefined, // Mapper le folderId
});

/**
 * Service de gestion des dossiers
 * CRUD pour les dossiers, navigation hiérarchique, déplacement de documents
 */
export class FolderService extends BaseApiService {

  async getFolders(parentId?: string): Promise<Folder[]> {
    const cacheKey = cacheService.generateKey('getFolders', { parentId });
    const cached = cacheService.get<Folder[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const searchParams = new URLSearchParams();
    if (parentId) {
      searchParams.append('parentId', parentId);
    }

    const url = `${this.baseUrl}/folders${searchParams.toString() ? `?${searchParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Folder[]>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.documents);
    
    return result;
  }

  async getFolder(id: string): Promise<Folder> {
    const cacheKey = cacheService.generateKey('getFolder', { id });
    const cached = cacheService.get<Folder>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/folders/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Folder>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.document);
    
    return result;
  }

  async createFolder(data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
  }): Promise<Folder> {
    const response = await fetch(`${this.baseUrl}/folders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<Folder>(response);
    
    // Invalider le cache des dossiers
    cacheService.invalidate('getFolders');
    
    return result;
  }

  async updateFolder(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    parentId?: string;
  }): Promise<Folder> {
    const response = await fetch(`${this.baseUrl}/folders/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<Folder>(response);
    
    // Invalider le cache des dossiers
    cacheService.invalidate('getFolders');
    cacheService.invalidateKey(cacheService.generateKey('getFolder', { id }));
    
    return result;
  }

  async deleteFolder(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/folders/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<{ message: string }>(response);
    
    // Invalider le cache des dossiers
    cacheService.invalidate('getFolders');
    cacheService.invalidateKey(cacheService.generateKey('getFolder', { id }));
    
    return result;
  }

  async moveDocumentToFolder(documentId: string, folderId?: string): Promise<Document> {
    const response = await fetch(`${this.baseUrl}/folders/move-document`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ documentId, folderId }),
    });

    const backendDocument = await this.handleResponse<BackendDocument>(response);
    
    // Invalider le cache des documents et dossiers
    cacheService.invalidate('getDocuments');
    cacheService.invalidate('getFolders');
    cacheService.invalidateKey(cacheService.generateKey('getDocument', { id: documentId }));
    
    return adaptBackendDocument(backendDocument);
  }

  async getFolderPath(id: string): Promise<{ path: string }> {
    const response = await fetch(`${this.baseUrl}/folders/${id}/path`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ path: string }>(response);
  }
}
