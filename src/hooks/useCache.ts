import { useState, useEffect, useCallback } from 'react';
import { cacheUtils } from '../services/api';

interface CacheStats {
  size: number;
  maxSize: number;
  defaultTTL: number;
  entries: Array<{ key: string; age: number; ttl: number; valid: boolean }>;
}

export const useCache = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = useCallback(() => {
    const currentStats = cacheUtils.getCacheStats();
    setStats(currentStats);
  }, []);

  const clearCache = useCallback(async () => {
    setIsLoading(true);
    try {
      cacheUtils.clearCache();
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  const invalidateDocuments = useCallback(() => {
    const deleted = cacheUtils.invalidateDocuments();
    refreshStats();
    return deleted;
  }, [refreshStats]);

  const invalidateTags = useCallback(() => {
    const deleted = cacheUtils.invalidateTags();
    refreshStats();
    return deleted;
  }, [refreshStats]);

  const invalidateActivityLogs = useCallback(() => {
    const deleted = cacheUtils.invalidateActivityLogs();
    refreshStats();
    return deleted;
  }, [refreshStats]);

  const invalidateDocument = useCallback((id: string) => {
    const deleted = cacheUtils.invalidateDocument(id);
    refreshStats();
    return deleted;
  }, [refreshStats]);

  const refreshEssentialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await cacheUtils.refreshEssentialData();
      refreshStats();
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  // Actualiser les stats au montage du composant
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Actualiser les stats toutes les 30 secondes si le composant est monté
  useEffect(() => {
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    isLoading,
    clearCache,
    invalidateDocuments,
    invalidateTags,
    invalidateActivityLogs,
    invalidateDocument,
    refreshEssentialData,
    refreshStats,
  };
};

export default useCache;
