import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  FileText,
  HardDrive,
  Activity,
  Bell,
  Settings,
  Cloud,
  Loader2
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useNotifications } from '../hooks/useNotifications';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useMegaSync } from '../hooks/useMegaSync';
import { NotificationCenter } from '../components/NotificationCenter';
import { useNavigate } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  description?: string;
  bgGradient: string;
  iconColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  bgGradient, 
  iconColor 
}) => (
  <div className={`card ${bgGradient} border-opacity-20 hover:shadow-lg transition-all duration-300`}>
    <div className="card-body">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium opacity-70">{title}</h3>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs text-success font-medium">{trend}</span>
            </div>
          )}
          {description && (
            <p className="text-xs opacity-60 mt-1">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="p-3 rounded-xl bg-base-100/50">
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const StatsPage = () => {
  const navigate = useNavigate();
  const timeRangeOptions = [
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '3 derniers mois' },
    { value: '1y', label: 'Dernière année' },
  ];
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const { preferences } = useUserPreferences();
  const { stats, loading, error, loadStats, refreshStats, recentActivities, loadingActivities, loadRecentActivities } = useStats({
    autoLoad: true,
    refreshInterval: preferences.autoRefresh ? preferences.refreshInterval * 1000 : undefined,
  });
  
  // Données de démonstration si pas de stats
  const demoStats = {
    totalDocuments: 42,
    totalSize: 157286400, // ~150MB
    totalUsers: 1,
    favoriteDocuments: 5,
    documentsWithTags: 32,
    categoriesStats: [
      { name: 'documents', count: 15 },
      { name: 'images', count: 12 },
      { name: 'pdf', count: 8 },
      { name: 'videos', count: 5 },
      { name: 'autres', count: 2 }
    ],
    typeStats: [
      { name: 'pdf', count: 8 },
      { name: 'docx', count: 7 },
      { name: 'jpg', count: 6 },
      { name: 'png', count: 6 },
      { name: 'mp4', count: 5 },
      { name: 'txt', count: 4 },
      { name: 'xlsx', count: 3 },
      { name: 'pptx', count: 3 }
    ],
    recentActivity: [
      { type: 'upload', document: 'Rapport Q3 2025.pdf', date: new Date().toISOString() },
      { type: 'view', document: 'Présentation client.pptx', date: new Date(Date.now() - 3600000).toISOString() },
      { type: 'edit', document: 'Notes réunion.docx', date: new Date(Date.now() - 7200000).toISOString() },
    ]
  };
  
  // Utiliser les données de démo si pas de stats réelles
  const displayStats = stats || (error ? demoStats : null);

  // Charger automatiquement les activités détaillées si nécessaire
  useEffect(() => {
    if (displayStats && typeof displayStats.recentActivity === 'number' && !recentActivities && !loadingActivities) {
      loadRecentActivities(10);
    }
  }, [displayStats, recentActivities, loadingActivities, loadRecentActivities]);
  const { notifications } = useNotifications();
  const { isSyncing, syncMegaFiles } = useMegaSync();

  // Fonction de synchronisation MEGA
  const handleSyncMega = async () => {
    const result = await syncMegaFiles();
    
    if (result) {
      // Rafraîchir les statistiques après la synchronisation réussie
      await refreshStats();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTopCategories = () => {
    if (!displayStats?.categoriesStats || !Array.isArray(displayStats.categoriesStats)) return [];
    return displayStats.categoriesStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const getTopTypes = () => {
    if (!displayStats?.typeStats || !Array.isArray(displayStats.typeStats)) {
      return [];
    }
    return displayStats.typeStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Erreur lors du chargement des statistiques: {error}</span>
          <button onClick={loadStats} className="btn btn-ghost btn-sm">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Statistiques
            </h1>
            <p className="text-base-content/70 mt-1">
              Analyse détaillée de votre gestion documentaire
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Filtre de période */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-outline gap-2">
                <Calendar className="w-4 h-4" />
                {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
                {timeRangeOptions.map(option => (
                  <li key={option.value}>
                    <button 
                      onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d' | '1y')}
                      className={timeRange === option.value ? 'active' : ''}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <button 
              onClick={refreshStats}
              className="btn btn-ghost btn-circle"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <NotificationCenter />
            
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Documents"
            value={displayStats?.totalDocuments?.toString() || '0'}
            icon={FileText}
            trend="+12% ce mois"
            description="Documents stockés"
            bgGradient="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
            iconColor="text-primary"
          />
          
          <StatsCard
            title="Espace Utilisé"
            value={formatFileSize(displayStats?.totalSize || 0)}
            icon={HardDrive}
            trend="+8% ce mois"
            description="Stockage total"
            bgGradient="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border border-secondary/20"
            iconColor="text-secondary"
          />
          
          <StatsCard
            title="Activités Récentes"
            value={
              typeof displayStats?.recentActivity === 'number' 
                ? displayStats.recentActivity.toString()
                : Array.isArray(displayStats?.recentActivity) 
                  ? displayStats.recentActivity.length.toString()
                  : '0'
            }
            icon={Activity}
            description="Cette période"
            bgGradient="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20"
            iconColor="text-accent"
          />
          
          <StatsCard
            title="Notifications"
            value={notifications.length.toString()}
            icon={Bell}
            description="Non lues"
            bgGradient="bg-gradient-to-br from-info/10 via-info/5 to-transparent border border-info/20"
            iconColor="text-info"
          />
        </div>

        {/* Graphiques et analyses détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribution par catégories */}
          <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300/50">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-primary" />
                Répartition par Catégories
              </h2>
              <div className="space-y-4">
                {getTopCategories().map((categoryData, index) => {
                  const percentage = displayStats?.totalDocuments ? (categoryData.count / displayStats.totalDocuments) * 100 : 0;
                  const categoryName = categoryData.name || 'Sans catégorie';
                  const count = categoryData.count || 0;
                  
                  return (
                    <div key={`${categoryName}-${index}`} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-primary" style={{
                        backgroundColor: `hsl(${(index * 360 / 8) % 360}, 70%, 50%)`
                      }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium truncate">
                            {categoryName}
                          </span>
                          <span className="text-sm text-base-content/70">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: `hsl(${(index * 360 / 8) % 360}, 70%, 50%)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activités récentes détaillées */}
          <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300/50">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-accent" />
                Activités Récentes
                <button 
                  onClick={() => loadRecentActivities(10)}
                  disabled={loadingActivities}
                  className="btn btn-ghost btn-xs ml-auto"
                  title="Charger les détails"
                >
                  {loadingActivities ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </button>
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-base-100/50 rounded-lg hover:bg-base-100/80 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.documentName}</p>
                        <p className="text-xs text-base-content/60 capitalize">{activity.type}</p>
                      </div>
                      <span className="text-xs text-base-content/50 whitespace-nowrap">
                        {activity.timestamp && activity.timestamp !== 'Invalid Date' ? 
                          new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'Date non disponible'
                        }
                      </span>
                    </div>
                  ))
                ) : displayStats?.recentActivity && Array.isArray(displayStats.recentActivity) && displayStats.recentActivity.length > 0 ? (
                  displayStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-base-100/50 rounded-lg hover:bg-base-100/80 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.document}</p>
                        <p className="text-xs text-base-content/60">{activity.type}</p>
                      </div>
                      <span className="text-xs text-base-content/50 whitespace-nowrap">
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
                  <div className="text-center py-8 text-base-content/50">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>
                      {loadingActivities 
                        ? 'Chargement des activités...'
                        : 'Activités récentes non disponibles'
                      }
                    </p>
                    <p className="text-xs mt-1">
                      {!loadingActivities && typeof displayStats?.recentActivity === 'number' 
                        ? `${displayStats.recentActivity} activités détectées - Cliquez sur l'icône pour charger les détails` 
                        : !loadingActivities && !recentActivities
                          ? 'Cliquez sur l\'icône pour charger les détails'
                          : ''
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Types de fichiers */}
        <div className="card bg-base-200/50 backdrop-blur-sm border border-base-300/50 mb-8">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-secondary" />
              Répartition par Types de Fichiers
            </h2>
            {getTopTypes().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTopTypes().map((typeData, index) => {
                  const percentage = displayStats?.totalDocuments ? (typeData.count / displayStats.totalDocuments) * 100 : 0;
                  const typeName = typeData.name || 'unknown';
                  const count = typeData.count || 0;
                  
                  return (
                    <div key={`${typeName}-${index}`} className="stat bg-base-100/50 rounded-lg">
                      <div className="stat-figure">
                        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-secondary">
                            {typeName.toUpperCase().slice(0, 3)}
                          </span>
                        </div>
                      </div>
                      <div className="stat-title text-xs">{typeName}</div>
                      <div className="stat-value text-lg">{count}</div>
                      <div className="stat-desc text-xs">{percentage.toFixed(1)}% du total</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/50">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Aucune donnée de type de fichier disponible</p>
                <p className="text-xs mt-1">Les statistiques seront disponibles après l'ajout de documents</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques avancées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tendances */}
          <div className="card bg-gradient-to-br from-success/10 to-transparent border border-success/20">
            <div className="card-body">
              <h3 className="card-title text-success">Tendances</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Documents cette semaine</span>
                  <span className="text-sm font-bold text-success">+15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stockage utilisé</span>
                  <span className="text-sm font-bold text-success">+8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Activité utilisateur</span>
                  <span className="text-sm font-bold text-success">+22%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Efficacité */}
          <div className="card bg-gradient-to-br from-warning/10 to-transparent border border-warning/20">
            <div className="card-body">
              <h3 className="card-title text-warning">Efficacité</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taux d'organisation</span>
                  <span className="text-sm font-bold">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Documents favoris</span>
                  <span className="text-sm font-bold">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recherches réussies</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="card bg-gradient-to-br from-info/10 to-transparent border border-info/20">
            <div className="card-body">
              <h3 className="card-title text-info">Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleSyncMega}
                  disabled={isSyncing}
                  className="btn btn-outline btn-sm w-full gap-2 hover:border-primary hover:text-primary"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Synchronisation...' : 'Synchroniser MEGA'}
                </button>
                <button className="btn btn-outline btn-sm w-full gap-2">
                  <Download className="w-4 h-4" />
                  Exporter les stats
                </button>
                <button className="btn btn-outline btn-sm w-full gap-2">
                  <Filter className="w-4 h-4" />
                  Filtres avancés
                </button>
                <button className="btn btn-outline btn-sm w-full gap-2">
                  <Calendar className="w-4 h-4" />
                  Planifier rapport
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
