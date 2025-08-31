// Export du service principal (compatibilité)
export { default as apiService } from '../apiService';
export { apiService as default } from '../apiService';

// Export des services individuels pour un usage avancé
export { AuthService } from './authService';
export { DocumentService } from './documentService';
export { FolderService } from './folderService';
export { SearchService } from './searchService';
export { TagFileService } from './tagFileService';
export { UserService } from './userService';
export { BackupMegaService } from './backupMegaService';
export { BaseApiService } from './baseService';

// Export du service de cache
export { cacheService } from '../cacheService';
