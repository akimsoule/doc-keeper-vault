import { useLocalStorage } from './useLocalStorage';
import { ViewMode } from '../types';

/**
 * Interface pour toutes les préférences utilisateur
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto' | string;
  viewMode: ViewMode;
  itemsPerPage: number;
  defaultCategory: string;
  showFilters: boolean;
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // en secondes
}

/**
 * Valeurs par défaut des préférences
 */
const defaultPreferences: UserPreferences = {
  theme: 'auto',
  viewMode: 'grid',
  itemsPerPage: 20,
  defaultCategory: '',
  showFilters: false,
  sortBy: 'name',
  sortOrder: 'asc',
  compactMode: false,
  autoRefresh: false,
  refreshInterval: 30,
};

/**
 * Hook pour gérer toutes les préférences utilisateur
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'doc-keeper-user-preferences',
    defaultPreferences
  );

  // Fonctions pour mettre à jour des préférences individuelles
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return {
    preferences,
    setPreferences,
    updatePreference,
    resetPreferences,
  };
};

export default useUserPreferences;
