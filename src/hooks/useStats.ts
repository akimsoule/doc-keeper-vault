import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { Activity } from '../types';

export interface StatsData {
  totalDocuments: number;
  totalSize: number;
  totalUsers: number;
  favoriteDocuments: number;
  documentsWithTags: number;
  categoriesStats: Array<{ name: string; count: number }>;
  typeStats: Array<{ name: string; count: number }>;
  recentActivity: number | Array<{
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
  recentActivities: Activity[] | null;
  loadingActivities: boolean;
  loadStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
  loadRecentActivities: (limit?: number) => Promise<void>;
  clearError: () => void;
}

export const useStats = (options: UseStatsOptions = {}): UseStatsResult => {
  const { autoLoad = true, refreshInterval } = options;

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[] | null>(null);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Fonction pour convertir les données API vers notre format interne
  const convertApiStatsToStatsData = (apiStats: {
    totalDocuments: number;
    totalSize: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    recentActivity: Array<{ type: string; document: string; date: string; }>;
  }): StatsData => {
    return {
      totalDocuments: apiStats.totalDocuments || 0,
      totalSize: apiStats.totalSize || 0,
      totalUsers: 1, // Valeur par défaut (utilisateur connecté)
      favoriteDocuments: 0, // Valeur par défaut
      documentsWithTags: 0, // Valeur par défaut
      categoriesStats: apiStats.byCategory ? 
        Object.entries(apiStats.byCategory).map(([name, count]) => ({ name, count: count as number })) : 
        [],
      typeStats: apiStats.byType ? 
        Object.entries(apiStats.byType).map(([name, count]) => ({ name, count: count as number })) : 
        [],
      recentActivity: apiStats.recentActivity || []
    };
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getStats();
      const convertedStats = convertApiStatsToStatsData(response);
      setStats(convertedStats);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await loadStats();
  }, [loadStats]);

  const loadRecentActivities = useCallback(async (limit: number = 10) => {
    setLoadingActivities(true);
    setError(null);
    
    try {
      const activities = await apiService.getRecentActivities(limit);
      setRecentActivities(activities);
    } catch (err) {
      console.error('Erreur lors du chargement des activités récentes:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des activités récentes');
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  // Auto-load des statistiques
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
    recentActivities,
    loadingActivities,
    loadStats,
    refreshStats,
    loadRecentActivities,
    clearError,
  };
};
