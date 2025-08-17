import { useCallback } from 'react';
import { cacheUtils } from '../services/api';

/**
 * Hook pour automatiser la gestion du cache lors des opérations CRUD
 */
export const useCacheInvalidation = () => {
  const invalidateAfterDocumentChange = useCallback(() => {
    // Invalider les caches liés aux documents
    cacheUtils.invalidateDocuments();
    cacheUtils.invalidateTags();
  }, []);

  const invalidateAfterDocumentDelete = useCallback((documentId: string) => {
    // Invalider spécifiquement le document supprimé et les listes
    cacheUtils.invalidateDocument(documentId);
    cacheUtils.invalidateDocuments();
    cacheUtils.invalidateTags();
  }, []);

  const invalidateAfterActivityChange = useCallback(() => {
    // Invalider les logs d'activité
    cacheUtils.invalidateActivityLogs();
  }, []);

  const refreshAfterLogin = useCallback(async () => {
    // Vider tout le cache après une connexion
    cacheUtils.clearCache();
    // Précharger les données essentielles
    await cacheUtils.refreshEssentialData();
  }, []);

  const clearAfterLogout = useCallback(() => {
    // Vider tout le cache après une déconnexion
    cacheUtils.clearCache();
  }, []);

  return {
    invalidateAfterDocumentChange,
    invalidateAfterDocumentDelete,
    invalidateAfterActivityChange,
    refreshAfterLogin,
    clearAfterLogout,
  };
};

export default useCacheInvalidation;
