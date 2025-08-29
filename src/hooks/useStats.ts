import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

export interface StatsData {
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

interface UseStatsOptions {
  autoLoad?: boolean;
  refreshInterval?: number; // en millisecondes
}

interface UseStatsResult {
  stats: StatsData | null;
  loading: boolean;
  error: string | null;
  loadStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

export const useStats = (options: UseStatsOptions = {}): UseStatsResult => {
  const { autoLoad = true, refreshInterval } = options;

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getStats();
      setStats(response);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    // Forcer le rechargement en invalidant le cache
    await apiService.clearCache();
    await loadStats();
  }, [loadStats]);

  // Chargement automatique
  useEffect(() => {
    if (autoLoad) {
      loadStats();
    }
  }, [autoLoad, loadStats]);

  // Rafraîchissement automatique
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
    refreshStats,
    clearError,
  };
};
