import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Document, DocumentSearchResult, SearchParams, User, DocumentUpload, ActivityLog, MegaConfig, MegaConfigForm } from '../types';
import { cacheService, CACHE_KEYS, CACHE_TTL } from './cache';

// Configuration de base pour les requêtes API
const API_BASE_URL = "/api";

// Instance axios configurée
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

import { encryptWithPublicKey } from '../utils/rsaEncryption';

// Services d'authentification
export const authService = {
  /**
   * Encode une chaîne en Base64
   * @param str Chaîne à encoder
   * @returns Chaîne encodée en Base64
   * @deprecated Utiliser la méthode de chiffrement RSA à la place
   */
  encodeBase64(str: string): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  },
  
  /**
   * Chiffre un mot de passe avec la clé publique RSA
   * En cas d'échec, revient à l'encodage Base64 comme solution de secours
   */
  async encryptPassword(password: string): Promise<{ encryptedPassword: string; method: 'rsa' | 'base64' }> {
    try {
      // Valider que nous avons un mot de passe valide à chiffrer
      if (!password || typeof password !== 'string') {
        throw new Error('Mot de passe invalide');
      }
      
      // Essayer le chiffrement RSA
      const encrypted = await encryptWithPublicKey(password);
      
      // Vérifier que le résultat est une chaîne Base64 valide
      if (!encrypted || typeof encrypted !== 'string') {
        throw new Error('Résultat de chiffrement invalide');
      }
      
      return { encryptedPassword: encrypted, method: 'rsa' };
    } catch (error) {
      console.warn('Chiffrement RSA échoué, utilisation du Base64 comme solution de secours:', error);
      return { encryptedPassword: this.encodeBase64(password), method: 'base64' };
    }
  },
  
  /**
   * Connexion avec identifiants chiffrés
   */
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { encryptedPassword, method } = await this.encryptPassword(password);
    
    const response: AxiosResponse<{ token: string; user: User }> = await api.post('/login', {
      email,
      password: encryptedPassword,
      encryptionMethod: method,
    });
    return response.data;
  },

  /**
   * Inscription avec identifiants chiffrés
   */
  async signup(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const { encryptedPassword, method } = await this.encryptPassword(password);
    
    const response: AxiosResponse<{ token: string; user: User }> = await api.post('/signup', {
      name,
      email,
      password: encryptedPassword,
      encryptionMethod: method,
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },
};

// Services de gestion des documents
export const documentService = {
  async getDocuments(params: SearchParams = {}): Promise<DocumentSearchResult> {
    return cacheService.withCache(
      CACHE_KEYS.DOCUMENTS,
      async () => {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              // Pour les tags (array), ajouter chaque tag séparément
              value.forEach(item => {
                if (item && item.trim() !== '') {
                  searchParams.append(key, item.toString());
                }
              });
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });

        const response: AxiosResponse<DocumentSearchResult> = await api.get(
          `/document-list?${searchParams.toString()}`
        );
        return response.data;
      },
      params as Record<string, unknown>,
      CACHE_TTL.DOCUMENTS
    );
  },

  async getDocument(id: string): Promise<Document> {
    return cacheService.withCache(
      CACHE_KEYS.DOCUMENT,
      async () => {
        const response: AxiosResponse<Document> = (await api.get(`/document-get?id=${id}`));
        return response.data;
      },
      { id },
      CACHE_TTL.DOCUMENT
    );
  },

  async getDocumentUrl(id: string): Promise<{ url: string }> {
    return cacheService.withCache(
      CACHE_KEYS.DOCUMENT_URL,
      async () => {
        const response: AxiosResponse<{ url: string }> = (await api.get(`/document-get-url?id=${id}`));
        return response.data;
      },
      { id },
      CACHE_TTL.DOCUMENT_URL
    );
  },

  async uploadDocument(upload: DocumentUpload): Promise<Document> {
    // Convertir le fichier en base64
    const base64File = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Retirer le préfixe data:mime/type;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(upload.file);
    });

    const payload = {
      name: upload.name,
      type: upload.type,
      category: upload.category,
      description: upload.description,
      tags: upload.tags,
      base64File,
      mimeType: upload.file.type,
    };

    const response: AxiosResponse<Document> = (await api.post('/document-create', payload));
    
    // Invalider le cache des documents et tags
    cacheService.invalidate(CACHE_KEYS.DOCUMENTS);
    cacheService.invalidate(CACHE_KEYS.TAGS);
    
    return response.data;
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const response: AxiosResponse<Document> = (await api.put('/document-update', {
      id,
      ...updates,
    }));
    
    // Invalider le cache pour ce document spécifique et la liste des documents
    cacheService.invalidate(`${CACHE_KEYS.DOCUMENT}:${JSON.stringify({ id })}`);
    cacheService.invalidate(CACHE_KEYS.DOCUMENTS);
    cacheService.invalidate(CACHE_KEYS.TAGS);
    
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/document-delete?id=${id}`);
    
    // Invalider le cache pour ce document spécifique et la liste des documents
    cacheService.invalidate(`${CACHE_KEYS.DOCUMENT}:${JSON.stringify({ id })}`);
    cacheService.invalidate(`${CACHE_KEYS.DOCUMENT_URL}:${JSON.stringify({ id })}`);
    cacheService.invalidate(CACHE_KEYS.DOCUMENTS);
    cacheService.invalidate(CACHE_KEYS.TAGS);
  },

  async syncMegaFiles(): Promise<{message: string, syncedFiles: number}> {
    const response = await api.post('/document-sync');
    
    // Invalider le cache des documents et tags
    cacheService.invalidate(CACHE_KEYS.DOCUMENTS);
    cacheService.invalidate(CACHE_KEYS.TAGS);
    
    return response.data;
  },

  async toggleFavorite(id: string, currentFavoriteStatus: boolean): Promise<Document> {
    const response: AxiosResponse<Document> = (await api.patch('/document-update', {
      id,
      isFavorite: !currentFavoriteStatus,
    }));
    
    // Invalider le cache pour ce document spécifique et la liste des documents
    cacheService.invalidate(`${CACHE_KEYS.DOCUMENT}:${JSON.stringify({ id })}`);
    cacheService.invalidate(CACHE_KEYS.DOCUMENTS);
    
    return response.data;
  },
};

// Utilitaires pour les types de fichiers
export const fileUtils = {
  getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    
    return 'other';
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  getFileIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      case 'document':
        return '📝';
      case 'spreadsheet':
        return '📊';
      default:
        return '📎';
    }
  },

  isImageFile(type: string): boolean {
    return type === 'image';
  },

  isPdfFile(type: string): boolean {
    return type === 'pdf';
  },
};

// Service de tags
export const tagsService = {
  async getAllTags(): Promise<string[]> {
    return cacheService.withCache(
      CACHE_KEYS.TAGS,
      async () => {
        const response = await api.get('/tags-list');
        return response.data.tags || [];
      },
      undefined,
      CACHE_TTL.TAGS
    );
  },
};

// Service d'activité/logs
export const activityService = {
  async getActivityLogs(limit = 20, offset = 0): Promise<{
    logs: ActivityLog[];
    totalCount: number;
    hasMore: boolean;
  }> {
    return cacheService.withCache(
      CACHE_KEYS.ACTIVITY_LOGS,
      async () => {
        const response = await api.get(`/activity-logs?limit=${limit}&offset=${offset}`);
        return response.data;
      },
      { limit, offset },
      CACHE_TTL.ACTIVITY_LOGS
    );
  },
};

// Gestionnaire d'erreurs
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as import('axios').AxiosError;
    const data = axiosError.response?.data;
    if (data && typeof data === 'object' && 'error' in data) {
      return (data as { error: string }).error;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

// Utilitaires de cache
export const cacheUtils = {
  /**
   * Obtient les statistiques du cache
   */
  getCacheStats() {
    return cacheService.getStats();
  },

  /**
   * Vide complètement le cache
   */
  clearCache() {
    cacheService.clear();
  },

  /**
   * Invalide le cache des documents
   */
  invalidateDocuments() {
    return cacheService.invalidate(CACHE_KEYS.DOCUMENTS);
  },

  /**
   * Invalide le cache des tags
   */
  invalidateTags() {
    return cacheService.invalidate(CACHE_KEYS.TAGS);
  },

  /**
   * Invalide le cache des logs d'activité
   */
  invalidateActivityLogs() {
    return cacheService.invalidate(CACHE_KEYS.ACTIVITY_LOGS);
  },

  /**
   * Invalide le cache d'un document spécifique
   */
  invalidateDocument(id: string) {
    const deleted1 = cacheService.invalidate(`${CACHE_KEYS.DOCUMENT}:${JSON.stringify({ id })}`);
    const deleted2 = cacheService.invalidate(`${CACHE_KEYS.DOCUMENT_URL}:${JSON.stringify({ id })}`);
    return deleted1 + deleted2;
  },

  /**
   * Force le rafraîchissement du cache pour les données essentielles
   */
  async refreshEssentialData() {
    // Invalider les caches principaux
    this.invalidateDocuments();
    this.invalidateTags();
    
    // Précharger les données essentielles
    try {
      await Promise.all([
        documentService.getDocuments({}),
        tagsService.getAllTags(),
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du cache:', error);
    }
  },
};

// Service de configuration MEGA
export const megaConfigService = {
  /**
   * Récupère la configuration MEGA de l'utilisateur courant
   */
  async getMegaConfig(): Promise<MegaConfig | null> {
    try {
      const response = await api.get('/mega-config');
      return response.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration MEGA:', error);
      return null;
    }
  },

  /**
   * Crée ou met à jour la configuration MEGA
   */
  async setMegaConfig(config: MegaConfigForm): Promise<MegaConfig> {
    // Si un mot de passe est fourni, le chiffrer
    let payload = { ...config };
    
    if (config.password) {
      const { encryptedPassword, method } = await authService.encryptPassword(config.password);
      payload = { 
        ...config,
        password: encryptedPassword,
        encryptionMethod: method
      };
    }
    
    const response = await api.post('/mega-config', payload);
    return response.data;
  },

  /**
   * Supprime la configuration MEGA
   */
  async deleteMegaConfig(): Promise<void> {
    await api.delete('/mega-config');
  },

  /**
   * Active ou désactive la configuration MEGA
   */
  async toggleMegaConfig(isActive: boolean): Promise<MegaConfig> {
    const response = await api.patch('/mega-config', { isActive });
    return response.data;
  },

  /**
   * Teste la connexion MEGA avec les identifiants fournis
   */
  async testMegaConnection(email: string, password: string): Promise<boolean> {
    try {
      const { encryptedPassword, method } = await authService.encryptPassword(password);
      
      const response = await api.post('/mega-config', {
        email,
        password: encryptedPassword,
        encryptionMethod: method,
        testConnection: true,
        isActive: false
      });
      return !!response.data;
    } catch {
      return false;
    }
  },
};
