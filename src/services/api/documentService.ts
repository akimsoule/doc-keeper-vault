import { BaseApiService } from './baseService';
import { Document } from '../../types';
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
 * Service de gestion des documents
 * CRUD complet pour les documents, upload, téléchargement, synchronisation MEGA
 */
export class DocumentService extends BaseApiService {

  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    tag?: string;
  }) {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getDocuments', params);
    
    // Vérifier le cache
    const cached = cacheService.get<{
      documents: BackendDocument[];
      total: number;
      page: number;
      limit: number;
    }>(cacheKey);
    
    if (cached) {
      return {
        ...cached,
        documents: cached.documents.map(adaptBackendDocument),
      };
    }

    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.tag) searchParams.append("tag", params.tag);

    const url = `${this.baseUrl}/documents${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<{
      documents: BackendDocument[];
      total: number;
      page: number;
      limit: number;
    }>(response);
    
    // Mettre en cache le résultat brut (avant adaptation)
    cacheService.set(cacheKey, result, cacheService.TTL.documents);
    
    return {
      ...result,
      documents: result.documents.map(adaptBackendDocument),
    };
  }

  async getDocument(id: string) {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getDocument', { id });
    
    // Vérifier le cache
    const cached = cacheService.get<BackendDocument>(cacheKey);
    
    if (cached) {
      return adaptBackendDocument(cached);
    }

    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<BackendDocument>(response);
    
    // Mettre en cache le résultat brut
    cacheService.set(cacheKey, result, cacheService.TTL.document);
    
    return adaptBackendDocument(result);
  }

  async createDocument(data: {
    name: string;
    type: string;
    category: string;
    description?: string;
    tags?: string[];
  }) {
    const response = await fetch(`${this.baseUrl}/documents`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<BackendDocument>(response);
    
    // Invalider le cache des documents
    cacheService.invalidate('getDocuments');
    cacheService.invalidate('getStats');
    cacheService.invalidate('getUserStats');
    
    return adaptBackendDocument(result);
  }

  async uploadDocument(
    file: File,
    data: {
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      tags?: string[];
    }
  ) {
    const formData = new FormData();
    formData.append("file", file);

    if (data.name) formData.append("name", data.name);
    if (data.type) formData.append("type", data.type);
    if (data.category) formData.append("category", data.category);
    if (data.description) formData.append("description", data.description);
    if (data.tags) formData.append("tags", JSON.stringify(data.tags));

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: "POST",
      headers: this.getFormHeaders(),
      body: formData,
    });

    const result = await this.handleResponse<BackendDocument>(response);
    
    // Invalider le cache des documents
    cacheService.invalidate('getDocuments');
    cacheService.invalidate('getStats');
    cacheService.invalidate('getUserStats');
    
    return adaptBackendDocument(result);
  }

  async updateDocument(
    id: string,
    data: {
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      tags?: string[];
      isFavorite?: boolean; // Ajout du champ favorite
    }
  ) {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<BackendDocument>(response);
    
    // Invalider le cache des documents et du document spécifique
    cacheService.invalidate('getDocuments');
    cacheService.invalidateKey(cacheService.generateKey('getDocument', { id }));
    cacheService.invalidate('getStats');
    cacheService.invalidate('getUserStats');
    
    return adaptBackendDocument(result);
  }

  async deleteDocument(id: string) {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<{ message: string }>(response);
    
    // Invalider le cache des documents et du document spécifique
    cacheService.invalidate('getDocuments');
    cacheService.invalidateKey(cacheService.generateKey('getDocument', { id }));
    cacheService.invalidateKey(cacheService.generateKey('downloadFile', { documentId: id }));
    cacheService.invalidate('getStats');
    cacheService.invalidate('getUserStats');
    
    return result;
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/documents/${id}/download`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur lors du téléchargement' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  async syncMegaFiles(folderId?: string) {
    const response = await fetch(`${this.baseUrl}/documents/sync-mega`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ folderId }),
    });

    const result = await this.handleResponse<{
      message: string;
      syncedCount: number;
      updatedCount: number;
      newDocuments: Array<{
        id: string;
        name: string;
        category: string;
        size: number;
      }>;
      updatedDocuments: Array<{
        id: string;
        name: string;
        category: string;
        size: number;
      }>;
    }>(response);
    
    // Invalider tout le cache des documents car ils ont potentiellement changé
    cacheService.invalidate('getDocuments');
    cacheService.invalidate('getStats');
    cacheService.invalidate('getUserStats');
    cacheService.invalidate('getTags');
    
    return result;
  }
}
