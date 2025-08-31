import { BaseApiService } from './baseService';
import { cacheService } from '../cacheService';
import { Document } from '../../types';

interface TagStats {
  tagName: string;
  count: number;
  documents: Document[];
  lastUsed: string;
}

interface FileDownload {
  documentId: string;
  name: string;
  type: string;
  downloadUrl?: string;
  dataUrl?: string;
  size: number;
  expiresIn?: string;
}

/**
 * Service pour les tags et fichiers
 * Gestion des tags, téléchargement de fichiers
 */
export class TagFileService extends BaseApiService {

  // === TAGS ===

  async getTags(): Promise<Array<{ name: string; count: number; color?: string }>> {
    const cacheKey = 'tags-all';
    const cached = cacheService.get<Array<{ name: string; count: number; color?: string }>>(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${this.baseUrl}/tags`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des tags: ${response.statusText}`);
    }

    const data = await response.json();
    cacheService.set(cacheKey, data, 5 * 60 * 1000); // Cache 5 minutes
    return data;
  }

  async getTagStats(tagName: string) {
    const response = await fetch(`${this.baseUrl}/tags/${tagName}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<TagStats>(response);
  }

  // === FICHIERS ===

  async downloadFile(documentId: string) {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('downloadFile', { documentId });
    
    // Vérifier le cache
    const cached = cacheService.get<FileDownload>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Toujours récupérer en base64 pour éviter les redirections vers MEGA
    const response = await fetch(
      `${this.baseUrl}/files/${documentId}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    const result = await this.handleResponse<FileDownload>(response);
    
    // Mettre en cache le résultat (fichiers ont une durée de vie plus longue)
    cacheService.set(cacheKey, result, cacheService.TTL.downloadFile);
    
    return result;
  }
}
