import React, { useEffect } from 'react';
import { 
  FileText, 
  HardDrive, 
  Bell,
  Settings,
  Activity,
  Calendar,
  BarChart3,
  Cloud,
  Loader2
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useNotifications } from '../hooks/useNotifications';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useMegaSync } from '../hooks/useMegaSync';
import { NotificationCenter } from './NotificationCenter';
import { useNavigate } from 'react-router-dom';

interface QuickStatsProps {
  className?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { preferences } = useUserPreferences();
  const { stats, loading, error, loadStats } = useStats({
    autoLoad: true,
    refreshInterval: preferences.autoRefresh ? preferences.refreshInterval * 1000 : undefined,
  });
  const { notifications, addNotification } = useNotifications();
  const { isSyncing, syncMegaFiles } = useMegaSync();

  // Fonction de synchronisation MEGA
  const handleSyncMega = async () => {
    const result = await syncMegaFiles();
    
    if (result) {
      // Recharger les stats après la synchronisation réussie
      await loadStats();
    }
  };

  // Notifier les nouvelles activités
  useEffect(() => {
    if (stats?.recentActivity && Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0) {
      const latestActivity = stats.recentActivity[0];
      const lastNotificationTime = localStorage.getItem('last-activity-notification');
      const currentTime = new Date().toISOString();
      
      if (!lastNotificationTime || new Date(lastNotificationTime) < new Date(latestActivity.date)) {
        addNotification({
          type: 'info',
          title: 'Nouvelle activité',
          message: `${latestActivity.type}: ${latestActivity.document}`,
          persistent: false,
        });
        localStorage.setItem('last-activity-notification', currentTime);
      }
    }
  }, [stats?.recentActivity, addNotification]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTopCategories = () => {
    if (!stats?.categoriesStats) return [];
    return stats.categoriesStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(cat => [cat.name, cat.count] as [string, number]);
  };

  const getTopTypes = () => {
    if (!stats?.typeStats) return [];
    return stats.typeStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(type => [type.name, type.count] as [string, number]);
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card bg-base-200 animate-pulse">
            <div className="card-body">
              <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-base-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`alert alert-error ${className}`}>
        <span>Erreur lors du chargement des statistiques: {error}</span>
        <button onClick={loadStats} className="btn btn-ghost btn-sm">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {/* Header avec actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tableau de bord</h2>
          <div className="flex gap-2">
            {/* Synchronisation MEGA */}
            <button 
              onClick={handleSyncMega}
              disabled={isSyncing}
              className="btn btn-ghost btn-circle btn-sm"
              title={isSyncing ? "Synchronisation en cours..." : "Synchroniser avec MEGA"}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
            </button>
            
            {/* Notifications */}
            <NotificationCenter />
            
            {/* Préférences */}
            <button 
              onClick={() => {
                navigate('/dashboard/profile');
                // Déclencher l'événement pour basculer vers l'onglet préférences
                setTimeout(() => {
                  const event = new CustomEvent('openPreferences');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="btn btn-ghost btn-circle"
              title="Préférences"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Total Documents</p>
                  <p className="text-2xl font-bold">{stats?.totalDocuments || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Espace utilisé</p>
                  <p className="text-2xl font-bold">{formatFileSize(stats?.totalSize || 0)}</p>
                </div>
                <HardDrive className="w-8 h-8 text-secondary" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Activités récentes</p>
                  <p className="text-2xl font-bold">
                    {Array.isArray(stats?.recentActivity) ? stats.recentActivity.length : (stats?.recentActivity || 0)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-accent" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-info/10 to-info/5 border border-info/20">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-70">Notifications</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-info" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et détails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top catégories */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Top Catégories
              </h3>
              <div className="space-y-3">
                {getTopCategories().map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category || 'Sans catégorie'}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-base-300 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ 
                            width: `${stats?.totalDocuments ? (count / stats.totalDocuments) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Activités récentes
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(stats?.recentActivity) && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.slice(0, 10).map((activity: { type: string; document: string; date: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-base-100 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.document}</p>
                        <p className="text-xs opacity-70">{activity.type}</p>
                      </div>
                      <span className="text-xs opacity-70 ml-2">
                        {activity.date && activity.date !== 'Invalid Date' ? 
                          new Date(activity.date).toLocaleDateString('fr-FR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'Date non disponible'
                        }
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-70 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Types de fichiers */}
        <div className="card bg-base-200 mt-6">
          <div className="card-body">
            <h3 className="card-title">Répartition par type</h3>
            <div className="flex flex-wrap gap-4">
              {getTopTypes().map(([type, count]) => (
                <div key={type} className="badge badge-outline badge-lg">
                  {type}: {count}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
