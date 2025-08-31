import { AuthService } from './api/authService';
import { DocumentService } from './api/documentService';
import { FolderService } from './api/folderService';
import { SearchService } from './api/searchService';
import { TagFileService } from './api/tagFileService';
import { UserService } from './api/userService';
import { BackupMegaService } from './api/backupMegaService';
import { cacheService } from './cacheService';

interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  viewMode: "grid" | "list";
  itemsPerPage: number;
  notifications: boolean;
}

/**
 * Service API principal qui combine tous les services spécialisés
 * Fournit une interface unifiée pour accéder à toutes les fonctionnalités
 */
class ApiService {
  // Services spécialisés
  public readonly auth: AuthService;
  public readonly documents: DocumentService;
  public readonly folders: FolderService;
  public readonly searchService: SearchService;
  public readonly tagFile: TagFileService;
  public readonly user: UserService;
  public readonly backupMega: BackupMegaService;

  constructor() {
    // Initialisation des services
    this.auth = new AuthService();
    this.documents = new DocumentService();
    this.folders = new FolderService();
    this.searchService = new SearchService();
    this.tagFile = new TagFileService();
    this.user = new UserService();
    this.backupMega = new BackupMegaService();
  }

  // === GESTION DU TOKEN (propagée à tous les services) ===

  setToken(token: string) {
    this.auth.setToken(token);
    this.documents.setToken(token);
    this.folders.setToken(token);
    this.searchService.setToken(token);
    this.tagFile.setToken(token);
    this.user.setToken(token);
    this.backupMega.setToken(token);
  }

  clearToken() {
    this.auth.clearToken();
    this.documents.clearToken();
    this.folders.clearToken();
    this.searchService.clearToken();
    this.tagFile.clearToken();
    this.user.clearToken();
    this.backupMega.clearToken();
  }

  // === MÉTHODES DE COMPATIBILITÉ (pour une transition en douceur) ===

  // Authentification
  async login(email: string, password: string) {
    return this.auth.login(email, password);
  }

  async register(email: string, name: string, password: string) {
    return this.auth.register(email, name, password);
  }

  async refreshToken() {
    return this.auth.refreshToken();
  }

  async verifyToken() {
    return this.auth.verifyToken();
  }

  // Documents
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    tag?: string;
  }) {
    return this.documents.getDocuments(params);
  }

  async getDocument(id: string) {
    return this.documents.getDocument(id);
  }

  async createDocument(data: {
    name: string;
    type: string;
    category: string;
    description?: string;
    tags?: string[];
  }) {
    return this.documents.createDocument(data);
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
    return this.documents.uploadDocument(file, data);
  }

  async updateDocument(
    id: string,
    data: {
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      tags?: string[];
      isFavorite?: boolean;
    }
  ) {
    return this.documents.updateDocument(id, data);
  }

  async deleteDocument(id: string) {
    return this.documents.deleteDocument(id);
  }

  async downloadDocument(id: string) {
    return this.documents.downloadDocument(id);
  }

  async syncMegaFiles(folderId?: string) {
    return this.documents.syncMegaFiles(folderId);
  }

  // Recherche
  async search(
    query: string,
    params?: {
      limit?: number;
      type?: string;
      category?: string;
      tag?: string;
    }
  ) {
    return this.searchService.search(query, params);
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
    return this.searchService.advancedSearch(criteria);
  }

  async getStats() {
    return this.searchService.getStats();
  }

  async getUserStats() {
    return this.searchService.getUserStats();
  }

  async getRecentActivities(limit = 10) {
    return this.searchService.getRecentActivities(limit);
  }

  // Tags et fichiers
  async getTags() {
    return this.tagFile.getTags();
  }

  async getTagStats(tagName: string) {
    return this.tagFile.getTagStats(tagName);
  }

  async downloadFile(documentId: string) {
    return this.tagFile.downloadFile(documentId);
  }

  // Utilisateur
  async getProfile() {
    return this.user.getProfile();
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    password?: string;
  }) {
    return this.user.updateProfile(data);
  }

  async getPreferences() {
    return this.user.getPreferences();
  }

  async updatePreferences(preferences: UserPreferences) {
    return this.user.updatePreferences(preferences);
  }

  async deleteAccount() {
    return this.user.deleteAccount();
  }

  // Dossiers
  async getFolders(parentId?: string) {
    return this.folders.getFolders(parentId);
  }

  async getFolder(id: string) {
    return this.folders.getFolder(id);
  }

  async createFolder(data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) {
    return this.folders.createFolder(data);
  }

  async updateFolder(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) {
    return this.folders.updateFolder(id, data);
  }

  async deleteFolder(id: string) {
    return this.folders.deleteFolder(id);
  }

  async moveDocumentToFolder(documentId: string, folderId?: string) {
    return this.folders.moveDocumentToFolder(documentId, folderId);
  }

  async getFolderPath(id: string) {
    return this.folders.getFolderPath(id);
  }

  // Sauvegarde et MEGA
  async getBackupStatus() {
    return this.backupMega.getBackupStatus();
  }

  async createBackup(
    type: "full" | "incremental" | "documents-only" = "full",
    description?: string
  ) {
    return this.backupMega.createBackup(type, description);
  }

  async restoreBackup(backupId: string, replaceExisting: boolean = false) {
    return this.backupMega.restoreBackup(backupId, replaceExisting);
  }

  async getMegaConfig() {
    return this.backupMega.getMegaConfig();
  }

  async saveMegaConfig(config: { email: string; password: string }, isUpdate: boolean = false) {
    return this.backupMega.saveMegaConfig(config, isUpdate);
  }

  async testMegaConnection() {
    return this.backupMega.testMegaConnection();
  }

  async deleteMegaConfig() {
    return this.backupMega.deleteMegaConfig();
  }

  // === GESTION DU CACHE ===

  /**
   * Vide tout le cache ou une partie selon le pattern
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
