import { ViewMode } from '../types';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook pour gérer les préférences de vue avec persistance dans localStorage
 */
export const useViewMode = (defaultMode: ViewMode = 'grid') => {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('doc-keeper-view-mode', defaultMode);

  return {
    viewMode,
    setViewMode,
  };
};

export default useViewMode;
