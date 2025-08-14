import {
  CreateDocumentInput,
  Document,
  ListDocumentsResponse,
  UpdateDocumentInput,
} from "@/types";
import { getAuthToken } from "./authService";

const API_ROOT = "/api";

// =================== SYSTÈME DE CACHE ===================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

type CacheParams = Record<string, string | number | boolean | undefined | null>;

class DocumentCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut

  // Générer une clé de cache basée sur les paramètres
  private generateCacheKey(endpoint: string, params?: CacheParams): string {
    const sortedParams = params ? 
      Object.keys(params)
        .sort()
        .reduce((result, key) => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            result[key] = params[key];
          }
          return result;
        }, {} as CacheParams) : {};
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  // Vérifier si une entrée de cache est valide
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Récupérer une valeur du cache
  get<T>(endpoint: string, params?: CacheParams): T | null {
    const key = this.generateCacheKey(endpoint, params);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      console.log(`Cache MISS pour: ${key}`);
      return null;
    }
    
    if (!this.isValid(entry)) {
      console.log(`Cache EXPIRED pour: ${key}`);
      this.cache.delete(key);
      return null;
    }
    
    console.log(`Cache HIT pour: ${key}`);
    return entry.data;
  }

  // Stocker une valeur dans le cache
  set<T>(endpoint: string, data: T, params?: CacheParams, customTTL?: number): void {
    const key = this.generateCacheKey(endpoint, params);
    const ttl = customTTL || this.defaultTTL;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`Cache SET pour: ${key} (TTL: ${ttl}ms)`);
  }

  // Invalider le cache pour un endpoint spécifique
  invalidate(endpoint: string, params?: CacheParams): void {
    if (params) {
      const key = this.generateCacheKey(endpoint, params);
      this.cache.delete(key);
      console.log(`Cache INVALIDATED pour: ${key}`);
    } else {
      // Invalider toutes les clés qui commencent par l'endpoint
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(endpoint));
      keysToDelete.forEach(key => {
        this.cache.delete(key);
        console.log(`Cache INVALIDATED pour: ${key}`);
      });
    }
  }

  // Invalider tout le cache (utile après login/logout)
  invalidateAll(): void {
    this.cache.clear();
    console.log('Cache CLEARED (tous les éléments supprimés)');
  }

  // Nettoyer les entrées expirées
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
        console.log(`Cache CLEANED (expiré): ${key}`);
      }
    }
  }

  // Obtenir des statistiques du cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance globale du cache
const documentCache = new DocumentCache();

// Nettoyer le cache automatiquement toutes les 10 minutes
setInterval(() => {
  documentCache.cleanup();
}, 10 * 60 * 1000);

// =================== FONCTIONS UTILITAIRES ===================

// Fonction utilitaire pour gérer les réponses API
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Erreur inconnue';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || 'Erreur inconnue';
    } catch {
      // Si on ne peut pas parser le JSON, utiliser le status text
      errorMessage = response.statusText || 'Erreur inconnue';
    }
    
    const error = {
      status: response.status,
      error: errorMessage,
      message: errorMessage
    };
    throw error;
  }
  
  return response.json();
}

export async function serviceListDocuments(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ListDocumentsResponse> {
  const endpoint = 'document-list';
  const cacheParams: CacheParams = {
    page: params?.page || 1,
    pageSize: params?.pageSize || 10,
    search: params?.search || '',
    type: params?.type || '',
    category: params?.category || '',
    sortBy: params?.sortBy || '',
    sortOrder: params?.sortOrder || ''
  };

  // Vérifier le cache d'abord
  const cachedResult = documentCache.get<ListDocumentsResponse>(endpoint, cacheParams);
  if (cachedResult) {
    return cachedResult;
  }

  // Si pas en cache, faire l'appel API
  const token = getAuthToken();
  const queryParams = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 10),
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.type ? { type: params.type } : {}),
    ...(params?.category ? { category: params.category } : {}),
    ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
    ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
  });
  
  const response = await fetch(`${API_ROOT}/document-list?${queryParams.toString()}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  
  const result = await handleApiResponse<ListDocumentsResponse>(response);
  
  // Mettre en cache le résultat (TTL de 3 minutes pour les listes)
  documentCache.set(endpoint, result, cacheParams, 3 * 60 * 1000);
  
  return result;
}

export async function serviceGetDocument(id: string): Promise<Document> {
  const endpoint = 'document-get';
  const cacheParams: CacheParams = { id };

  // Vérifier le cache d'abord
  const cachedResult = documentCache.get<Document>(endpoint, cacheParams);
  if (cachedResult) {
    return cachedResult;
  }

  // Si pas en cache, faire l'appel API
  const token = getAuthToken();
  const response = await fetch(`${API_ROOT}/document-get?id=${id}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  
  const result = await handleApiResponse<Document>(response);
  
  // Mettre en cache le résultat (TTL de 10 minutes pour un document spécifique)
  documentCache.set(endpoint, result, cacheParams, 10 * 60 * 1000);
  
  return result;
}

export async function serviceGetDocumentUrl(id: string, format: 'base64' | 'url' = 'url'): Promise<{ url: string }> {
  const endpoint = 'document-get-url';
  const cacheParams: CacheParams = { id, format };

  // Vérifier le cache d'abord
  const cachedResult = documentCache.get<{ url: string }>(endpoint, cacheParams);
  if (cachedResult) {
    return cachedResult;
  }

  // Si pas en cache, faire l'appel API
  const token = getAuthToken();
  const response = await fetch(`${API_ROOT}/document-get-url?id=${id}&format=${format}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });

  // Définir un type clair pour la forme potentielle de la réponse
  type UrlResponse = { data?: { url?: string } | string; url?: string };

  const result = await handleApiResponse<UrlResponse>(response);

  // Extraire l'URL en gérant les différentes formes
  let url: string | undefined;
  if (result) {
    if (typeof result.url === 'string') {
      url = result.url;
    } else if (result.data) {
      if (typeof result.data === 'string') {
        url = result.data;
      } else if (typeof result.data === 'object' && typeof result.data.url === 'string') {
        url = result.data.url;
      }
    }
  }

  if (!url) {
    const err = { status: 502, error: 'Aucune URL retournée par le serveur', message: 'Aucune URL retournée par le serveur' };
    throw err;
  }

  const urlData = { url };
  documentCache.set(endpoint, urlData, cacheParams, 15 * 60 * 1000);
  return urlData;
}

export async function serviceCreateDocument(
  data: CreateDocumentInput
): Promise<Document> {
  const token = getAuthToken();
  const response = await fetch(`${API_ROOT}/document-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });
  
  const result = await handleApiResponse<Document>(response);
  
  // Invalider le cache des listes après création
  documentCache.invalidate('document-list');
  
  return result;
}

export async function serviceUpdateDocument(
  data: UpdateDocumentInput
): Promise<Document> {
  const token = getAuthToken();
  const response = await fetch(`${API_ROOT}/document-update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });
  
  const result = await handleApiResponse<Document>(response);
  
  // Invalider le cache des listes ET du document spécifique ET des URLs après mise à jour
  documentCache.invalidate('document-list');
  if (data.id) {
    documentCache.invalidate('document-get', { id: data.id });
    documentCache.invalidate('document-get-url'); // Invalider toutes les URLs
  }
  
  return result;
}

export async function serviceDeleteDocument(id: string): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_ROOT}/document-delete?id=${id}`, {
    method: "DELETE",
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  
  await handleApiResponse<void>(response);
  
  // Invalider le cache des listes ET du document spécifique ET des URLs après suppression
  documentCache.invalidate('document-list');
  documentCache.invalidate('document-get', { id });
  documentCache.invalidate('document-get-url'); // Invalider toutes les URLs
}

// =================== FONCTIONS UTILITAIRES DU CACHE ===================

// Fonction pour invalider manuellement le cache (utile pour debug ou refresh forcé)
export function invalidateDocumentCache(): void {
  documentCache.invalidateAll();
}

// Fonction pour obtenir les statistiques du cache
export function getDocumentCacheStats(): { size: number; keys: string[] } {
  return documentCache.getStats();
}

// Fonction pour invalider spécifiquement le cache des listes
export function invalidateDocumentListCache(): void {
  documentCache.invalidate('document-list');
}
