import React from 'react';
import { useCache } from '../hooks/useCache';

interface CacheManagerProps {
  className?: string;
}

export const CacheManager: React.FC<CacheManagerProps> = ({ className = '' }) => {
  const {
    stats,
    isLoading,
    clearCache,
    invalidateDocuments,
    invalidateTags,
    invalidateActivityLogs,
    refreshEssentialData,
  } = useCache();

  const formatAge = (ageMs: number): string => {
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTTL = (ttlMs: number): string => {
    const minutes = Math.floor(ttlMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (!stats) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const validEntries = stats.entries.filter(entry => entry.valid);
  const expiredEntries = stats.entries.filter(entry => !entry.valid);
  const utilizationPercent = Math.round((stats.size / stats.maxSize) * 100);

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* En-tête */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Gestionnaire de Cache
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={refreshEssentialData}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              {isLoading ? 'Actualisation...' : 'Actualiser'}
            </button>
            <button
              onClick={clearCache}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 disabled:opacity-50"
            >
              Vider le cache
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Utilisation</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.size} / {stats.maxSize}
            </div>
            <div className="text-sm text-gray-600">
              {utilizationPercent}% utilisé
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600">Entrées valides</div>
            <div className="text-2xl font-bold text-green-900">
              {validEntries.length}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm font-medium text-orange-600">Entrées expirées</div>
            <div className="text-2xl font-bold text-orange-900">
              {expiredEntries.length}
            </div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Utilisation du cache</span>
            <span>{utilizationPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                utilizationPercent > 90 ? 'bg-red-500' :
                utilizationPercent > 70 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${utilizationPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Actions par catégorie */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Invalidation par catégorie
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={invalidateDocuments}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Documents
            </button>
            <button
              onClick={invalidateTags}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Tags
            </button>
            <button
              onClick={invalidateActivityLogs}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Logs d'activité
            </button>
          </div>
        </div>

        {/* Détails des entrées */}
        {validEntries.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Entrées en cache ({validEntries.length})
            </h4>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {validEntries.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {entry.key.split(':')[0]}
                      </div>
                      {entry.key.includes(':') && (
                        <div className="text-gray-500 truncate">
                          {entry.key.split(':').slice(1).join(':')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span>Âge: {formatAge(entry.age)}</span>
                      <span>•</span>
                      <span>TTL: {formatTTL(entry.ttl)}</span>
                    </div>
                  </div>
                ))}
                {validEntries.length > 10 && (
                  <div className="text-center text-sm text-gray-500 p-2">
                    ... et {validEntries.length - 10} autres entrées
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheManager;
