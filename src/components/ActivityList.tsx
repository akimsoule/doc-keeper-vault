import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Heart, 
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { activityService } from '../services/api';
import type { ActivityLog } from '../types';
import toast from 'react-hot-toast';

const ActivityList: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await activityService.getActivityLogs(20, 0);
      setLogs(response.logs);
      setHasMore(response.hasMore);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'activité');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DOCUMENT_CREATE':
      case 'DOCUMENT_UPLOAD':
        return <Upload className="w-4 h-4 text-success" />;
      case 'DOCUMENT_UPDATE':
        return <Edit className="w-4 h-4 text-warning" />;
      case 'DOCUMENT_DELETE':
        return <Trash2 className="w-4 h-4 text-error" />;
      case 'DOCUMENT_DOWNLOAD':
        return <Download className="w-4 h-4 text-info" />;
      case 'DOCUMENT_FAVORITE':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case 'DOCUMENT_UNFAVORITE':
        return <Heart className="w-4 h-4 text-base-content/40" />;
      case 'USER_LOGIN':
        return <User className="w-4 h-4 text-primary" />;
      default:
        return <FileText className="w-4 h-4 text-base-content/60" />;
    }
  };

  const getActionText = (log: ActivityLog) => {
    const documentName = log.document?.name || 'Document inconnu';
    
    switch (log.action) {
      case 'DOCUMENT_CREATE':
      case 'DOCUMENT_UPLOAD':
        return `Nouveau document téléchargé : ${documentName}`;
      case 'DOCUMENT_UPDATE':
        return `Document modifié : ${documentName}`;
      case 'DOCUMENT_DELETE':
        return `Document supprimé : ${documentName}`;
      case 'DOCUMENT_DOWNLOAD':
        return `Document téléchargé : ${documentName}`;
      case 'DOCUMENT_FAVORITE':
        return `Document ajouté aux favoris : ${documentName}`;
      case 'DOCUMENT_UNFAVORITE':
        return `Document retiré des favoris : ${documentName}`;
      case 'USER_LOGIN':
        return 'Connexion à l\'application';
      default:
        return log.details || `Action : ${log.action}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-base-100 rounded-lg animate-pulse">
            <div className="w-8 h-8 bg-base-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-base-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec bouton refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Activité récente
        </h3>
        <button
          onClick={loadLogs}
          className="btn btn-ghost btn-sm"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Liste des activités */}
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
          <p className="text-base-content/60">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-4 bg-base-100 rounded-lg hover:bg-base-200 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content">
                  {getActionText(log)}
                </p>
                <p className="text-xs text-base-content/60 mt-1">
                  {formatDate(log.createdAt)}
                </p>
                {log.details && log.details !== getActionText(log) && (
                  <p className="text-xs text-base-content/50 mt-1 italic">
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bouton "Voir plus" si il y a plus d'éléments */}
      {hasMore && (
        <div className="text-center pt-4">
          <button className="btn btn-ghost btn-sm">
            Voir plus d'activités
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
