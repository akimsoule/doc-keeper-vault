import { useCallback } from 'react';
import { cacheService } from '../services/cacheService';

/**
 * Hook React pour interagir avec le service de cache
 */
export const useCache = () => {
  const clearCache = useCallback((pattern?: string) => {
    cacheService.invalidate(pattern);
  }, []);

  const getCacheInfo = useCallback(() => {
    return cacheService.getInfo();
  }, []);

  const clearAllCache = useCallback(() => {
    cacheService.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cacheService.size;
  }, []);

  const cleanupExpiredEntries = useCallback(() => {
    return cacheService.cleanup();
  }, []);

  return {
    clearCache,
    getCacheInfo,
    clearAllCache,
    getCacheSize,
    cleanupExpiredEntries,
  };
};

export default useCache;
