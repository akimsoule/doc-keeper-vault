import { useEffect } from 'react';

// Hook pour les raccourcis clavier
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore si focus sur un input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Construire la combinaison de touches
      const key = event.key.toLowerCase();
      const combo = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        key !== 'control' && key !== 'meta' && key !== 'shift' && key !== 'alt' && key,
      ]
        .filter(Boolean)
        .join('+');

      // Exécuter le raccourci correspondant
      if (shortcuts[combo]) {
        event.preventDefault();
        shortcuts[combo]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
