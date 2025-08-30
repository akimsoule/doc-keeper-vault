import React from 'react';
import { CheckCircle, AlertCircle, Cloud, FileText } from 'lucide-react';

interface SyncResultNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  result: {
    syncedCount: number;
    updatedCount: number;
    newDocuments: Array<{
      id: string;
      name: string;
      category: string;
      size: number;
    }>;
    updatedDocuments: Array<{
      id: string;
      name: string;
      category: string;
      size: number;
    }>;
  } | null;
  error?: string | null;
}

export const SyncResultNotification: React.FC<SyncResultNotificationProps> = ({
  isVisible,
  onClose,
  result,
  error
}) => {
  if (!isVisible) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>

        {error ? (
          // Affichage d'erreur
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-4 text-error">Erreur de synchronisation</h3>
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          </div>
        ) : result ? (
          // Affichage de succès
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Cloud className="w-8 h-8 text-success mr-2" />
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            
            <h3 className="font-bold text-lg mb-4 text-success">
              Synchronisation terminée !
            </h3>

            {/* Statistiques */}
            <div className="stats stats-vertical lg:stats-horizontal shadow mb-6">
              <div className="stat">
                <div className="stat-title">Nouveaux fichiers</div>
                <div className="stat-value text-primary">{result.syncedCount}</div>
                <div className="stat-desc">Ajoutés à votre bibliothèque</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Fichiers mis à jour</div>
                <div className="stat-value text-secondary">{result.updatedCount}</div>
                <div className="stat-desc">Informations actualisées</div>
              </div>
            </div>

            {/* Détails des nouveaux documents */}
            {result.newDocuments.length > 0 && (
              <div className="card bg-base-200 mb-4">
                <div className="card-body">
                  <h4 className="card-title text-primary">
                    <FileText className="w-5 h-5" />
                    Nouveaux documents ({result.newDocuments.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {result.newDocuments.slice(0, 10).map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center py-2 border-b border-base-300 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-base-content/60">
                            {doc.category} • {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {result.newDocuments.length > 10 && (
                      <div className="text-center py-2 text-sm text-base-content/60">
                        ... et {result.newDocuments.length - 10} autres fichiers
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Détails des documents mis à jour */}
            {result.updatedDocuments.length > 0 && (
              <div className="card bg-base-200 mb-4">
                <div className="card-body">
                  <h4 className="card-title text-secondary">
                    <FileText className="w-5 h-5" />
                    Documents mis à jour ({result.updatedDocuments.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {result.updatedDocuments.slice(0, 10).map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center py-2 border-b border-base-300 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-base-content/60">
                            {doc.category} • {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {result.updatedDocuments.length > 10 && (
                      <div className="text-center py-2 text-sm text-base-content/60">
                        ... et {result.updatedDocuments.length - 10} autres fichiers
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result.syncedCount === 0 && result.updatedCount === 0 && (
              <div className="alert alert-info">
                <span>Aucun nouveau fichier trouvé. Vos documents sont déjà à jour !</span>
              </div>
            )}
          </div>
        ) : null}

        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
