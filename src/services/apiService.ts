import { Document } from "../types";
import { cacheService } from "./cacheService";

// Types API
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Document du backend (avec isFavorite)
interface BackendDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  tags: string;
  ownerId: string;
  isFavorite: boolean;
  createdAt: string;
  modifiedAt: string;
  description?: string;
  hash: string;
  fileId: string;
}

// Adaptateur pour convertir les documents du backend vers l'interface frontend
const adaptBackendDocument = (backendDoc: BackendDocument): Document => ({
  id: backendDoc.id,
  name: backendDoc.name,
  type: backendDoc.type,
  size: backendDoc.size,
  category: backendDoc.category,
  tags: backendDoc.tags
    ? backendDoc.tags.split(",").filter((tag) => tag.trim())
    : [],
  uploadDate: new Date(backendDoc.createdAt),
  lastModified: new Date(backendDoc.modifiedAt),
  favorite: backendDoc.isFavorite,
  shared: false, // TODO: implémenter le partage dans le backend
  thumbnail: undefined, // TODO: implémenter les thumbnails
});

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface SearchResult {
  query: string;
  results: BackendDocument[];
  total: number;
  searchTime: number;
}

interface AdvancedSearchResult {
  query: string;
  filters: Record<string, unknown>;
  results: BackendDocument[];
  total: number;
  searchTime: number;
}

interface Tag {
  id: string;
  name: string;
  count: number;
  color?: string;
}

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

interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  viewMode: "grid" | "list";
  itemsPerPage: number;
  notifications: boolean;
}

interface Stats {
  totalDocuments: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recentActivity: Array<{
    type: string;
    document: string;
    date: string;
  }>;
}

interface BackupStatus {
  lastBackup: string;
  backupCount: number;
  nextScheduled: string;
  status: "idle" | "running" | "completed" | "error";
}

interface Backup {
  id: string;
  type: "full" | "incremental" | "documents-only";
  createdAt: string;
  size: number;
  description?: string;
  status: "completed" | "failed";
}

// Service API pour interagir avec le backend Netlify
class ApiService {
  private baseUrl = "/api";
  private token: string | null = null;

  // Configuration des headers avec authentification
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Configuration des headers pour multipart/form-data
  private getFormHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Gestion des erreurs API
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Erreur réseau" }));
      throw new Error(error.error || `Erreur HTTP ${response.status}`);
    }
    return response.json();
  }

  // Définir le token d'authentification
  setToken(token: string) {
    this.token = token;
  }

  // Supprimer le token d'authentification
  clearToken() {
    this.token = null;
  }

  // === AUTHENTIFICATION ===

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async register(email: string, name: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, name, password }),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async refreshToken() {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<LoginResponse>(response);

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async verifyToken() {
    const response = await fetch(`${this.baseUrl}/auth/verify`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{
      valid: boolean;
      user: User;
    }>(response);
  }

  // === DOCUMENTS ===

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

    console.log("Document backend:", result);
    
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

  // === RECHERCHE ===

  async search(
    query: string,
    params?: {
      limit?: number;
      type?: string;
      category?: string;
      tag?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);

    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.type) searchParams.append("type", params.type);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.tag) searchParams.append("tag", params.tag);

    const response = await fetch(
      `${this.baseUrl}/search/search?${searchParams}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<SearchResult>(response).then((result) => ({
      ...result,
      results: result.results.map(adaptBackendDocument),
    }));
  }

  async advancedSearch(criteria: {
    query?: string;
    type?: string;
    category?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    minSize?: number;
    maxSize?: number;
    limit?: number;
  }) {
    const response = await fetch(`${this.baseUrl}/search/advanced-search`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(criteria),
    });

    return this.handleResponse<AdvancedSearchResult>(response).then(
      (result) => ({
        ...result,
        results: result.results.map(adaptBackendDocument),
      })
    );
  }

  async getStats() {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getStats');
    
    // Vérifier le cache
    const cached = cacheService.get<Stats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/search/stats`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Stats>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.stats);
    
    return result;
  }

  async getUserStats() {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getUserStats');
    
    // Vérifier le cache
    const cached = cacheService.get<Stats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/search/user-stats`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Stats>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.userStats);
    
    return result;
  }

  // === TAGS ===

  async getTags() {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getTags');
    
    // Vérifier le cache
    const cached = cacheService.get<Tag[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/tags`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<Tag[]>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.tags);
    
    return result;
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

  // === UTILISATEUR ===

  async getProfile() {
    // Créer une clé de cache
    const cacheKey = cacheService.generateKey('getProfile');
    
    // Vérifier le cache
    const cached = cacheService.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<User>(response);
    
    // Mettre en cache le résultat
    cacheService.set(cacheKey, result, cacheService.TTL.profile);
    
    return result;
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/users/profile`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<User>(response);
    
    // Invalider le cache du profil
    cacheService.invalidate('getProfile');
    
    return result;
  }

  async getPreferences() {
    const response = await fetch(`${this.baseUrl}/users/preferences`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<UserPreferences>(response);
  }

  async updatePreferences(preferences: UserPreferences) {
    const response = await fetch(`${this.baseUrl}/users/preferences`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(preferences),
    });

    return this.handleResponse<UserPreferences>(response);
  }

  async deleteAccount() {
    const response = await fetch(`${this.baseUrl}/users/account`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  // === SAUVEGARDE ===

  async getBackupStatus() {
    const response = await fetch(`${this.baseUrl}/backup/status`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<BackupStatus>(response);
  }

  async createBackup(
    type: "full" | "incremental" | "documents-only" = "full",
    description?: string
  ) {
    const response = await fetch(`${this.baseUrl}/backup/create`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ type, description }),
    });

    return this.handleResponse<{
      message: string;
      backup: Backup;
    }>(response);
  }

  async restoreBackup(backupId: string, replaceExisting: boolean = false) {
    const response = await fetch(`${this.baseUrl}/backup/restore`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ backupId, replaceExisting }),
    });

    return this.handleResponse<{
      message: string;
      result: {
        documentsRestored: number;
        usersRestored: number;
        success: boolean;
      };
    }>(response);
  }

  // === GESTION DU CACHE ===

  /**
   * Vide tout le cache ou une partie selon le pattern
   * @param pattern - Pattern optionnel pour filtrer les clés à supprimer
   */
  clearCache(pattern?: string): void {
    cacheService.invalidate(pattern);
  }

  /**
   * Obtient des informations sur le cache actuel
   */
  getCacheInfo(): {
    size: number;
    keys: string[];
    totalMemoryUsage: number;
    expiredCount: number;
  } {
    return cacheService.getInfo();
  }

  /**
   * Démarre le nettoyage automatique du cache
   */
  startCacheAutoCleanup(intervalMs?: number): () => void {
    return cacheService.startAutoCleanup(intervalMs);
  }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Démarrage automatique du nettoyage du cache (toutes les 10 minutes)
apiService.startCacheAutoCleanup();

export default apiService;
