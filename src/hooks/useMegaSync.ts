import { useState, useCallback } from 'react';
import { DocumentService } from '../services/api';
import { tokenManager } from '../services/tokenManager';
import toast from 'react-hot-toast';

const documentService = new DocumentService();
// Enregistrer le service auprès du gestionnaire de tokens
tokenManager.registerService(documentService);

export interface SyncResult {
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
}

export interface UseMegaSyncResult {
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  syncMegaFiles: (folderId?: string, showDetailedNotification?: boolean) => Promise<SyncResult | null>;
  error: string | null;
  clearError: () => void;
}

export const useMegaSync = (): UseMegaSyncResult => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const syncMegaFiles = useCallback(async (
    folderId?: string, 
    showDetailedNotification = false
  ): Promise<SyncResult | null> => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const result = await documentService.syncMegaFiles(folderId);
      
      setLastSyncResult(result);
      
      // Afficher un toast de succès
      if (showDetailedNotification) {
        // Pour les notifications détaillées, on peut utiliser un toast plus simple
        // et laisser le composant appelant afficher le modal détaillé
        toast.success('Synchronisation terminée - Voir les détails');
      } else {
        // Toast standard avec résumé
        toast.success(`Synchronisation terminée: ${result.syncedCount} nouveaux documents, ${result.updatedCount} mis à jour`);
      }

      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la synchronisation MEGA';
      console.error('Erreur lors de la synchronisation MEGA:', err);
      
      setError(errorMessage);
      
      // Afficher un toast d'erreur
      toast.error(errorMessage);
      
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    lastSyncResult,
    syncMegaFiles,
    error,
    clearError,
  };
};
