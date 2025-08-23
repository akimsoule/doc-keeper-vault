import { useEffect, useState } from 'react';
import { getPublicKey } from '../utils/rsaEncryption';

/**
 * Composant pour précharger la clé publique RSA au démarrage de l'application
 */
export default function RSAKeyPreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPublicKey = async () => {
      try {
        await getPublicKey();
        setIsLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement de la clé RSA:', err);
        setError(err);
        setIsLoading(false);
      }
    };

    loadPublicKey();
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
