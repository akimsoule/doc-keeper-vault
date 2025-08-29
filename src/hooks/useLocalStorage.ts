import { useState, useCallback } from 'react';

/**
 * Hook générique pour gérer les préférences utilisateur avec localStorage
 */
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  // Initialiser avec la valeur du localStorage si disponible
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Erreur lors du chargement de ${key} depuis localStorage:`, error);
      return defaultValue;
    }
  });

  // Fonction pour mettre à jour la valeur et la sauvegarder
  const setStoredValue = useCallback((newValue: T | ((value: T) => T)) => {
    setValue(currentValue => {
      try {
        // Permettre les fonctions de mise à jour comme useState
        const valueToStore = newValue instanceof Function ? newValue(currentValue) : newValue;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      } catch (error) {
        console.warn(`Erreur lors de la sauvegarde de ${key} dans localStorage:`, error);
        // Continuer quand même avec le changement local
        const valueToStore = newValue instanceof Function ? newValue(currentValue) : newValue;
        return valueToStore;
      }
    });
  }, [key]);

  return [value, setStoredValue] as const;
};

export default useLocalStorage;
