import { useState, useCallback } from 'react';
import { Folder } from '../types';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les dossiers (racine ou sous-dossiers)
  const loadFolders = useCallback(async (parentId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getFolders(parentId);
      setFolders(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des dossiers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger un dossier spécifique avec ses détails
  const loadFolder = useCallback(async (folderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const folder = await apiService.getFolder(folderId);
      setCurrentFolder(folder);
      return folder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du dossier';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouveau dossier
  const createFolder = useCallback(async (data: {
    name: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newFolder = await apiService.createFolder(data);
      
      // Recharger la liste des dossiers du même niveau
      await loadFolders(data.parentId);
      
      toast.success(`Dossier "${newFolder.name}" créé avec succès`);
      return newFolder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du dossier';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadFolders]);

  // Mettre à jour un dossier
  const updateFolder = useCallback(async (folderId: string, data: {
    name?: string;
    description?: string;
    color?: string;
    parentId?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFolder = await apiService.updateFolder(folderId, data);
      
      // Mettre à jour le dossier courant s'il s'agit du même
      if (currentFolder?.id === folderId) {
        setCurrentFolder(updatedFolder);
      }
      
      // Recharger la liste des dossiers
      await loadFolders(updatedFolder.parentId);
      
      toast.success(`Dossier "${updatedFolder.name}" mis à jour avec succès`);
      return updatedFolder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du dossier';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFolder, loadFolders]);

  // Supprimer un dossier
  const deleteFolder = useCallback(async (folderId: string, folderName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteFolder(folderId);
      
      // Si c'était le dossier courant, le déselectionner
      if (currentFolder?.id === folderId) {
        setCurrentFolder(null);
      }
      
      // Recharger la liste des dossiers
      const folderToDelete = folders.find(f => f.id === folderId);
      await loadFolders(folderToDelete?.parentId);
      
      toast.success(`Dossier "${folderName}" supprimé avec succès`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du dossier';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFolder, folders, loadFolders]);

  // Déplacer un document vers un dossier
  const moveDocumentToFolder = useCallback(async (documentId: string, folderId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedDocument = await apiService.moveDocumentToFolder(documentId, folderId);
      
      // Recharger les dossiers pour mettre à jour les compteurs
      if (currentFolder) {
        await loadFolder(currentFolder.id);
      }
      
      const targetName = folderId ? 'le dossier sélectionné' : 'la racine';
      toast.success(`Document déplacé vers ${targetName}`);
      
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du déplacement du document';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFolder, loadFolder]);

  // Obtenir le chemin complet d'un dossier
  const getFolderPath = useCallback(async (folderId: string) => {
    try {
      const result = await apiService.getFolderPath(folderId);
      return result.path;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du chemin';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Naviguer vers un dossier (mettre à jour currentFolder et charger ses sous-dossiers)
  const navigateToFolder = useCallback(async (folderId: string | null) => {
    if (folderId) {
      await loadFolder(folderId);
      await loadFolders(folderId);
    } else {
      // Naviguer vers la racine
      setCurrentFolder(null);
      await loadFolders();
    }
  }, [loadFolder, loadFolders]);

  return {
    // État
    folders,
    currentFolder,
    loading,
    error,
    
    // Actions
    loadFolders,
    loadFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    moveDocumentToFolder,
    getFolderPath,
    navigateToFolder,
    
    // Utilitaires
    setCurrentFolder,
    setError,
  };
};
