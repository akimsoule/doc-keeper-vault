import { useEffect } from 'react';
import { getPublicKey } from '../utils/rsaEncryption';

/**
 * Composant pour précharger la clé publique RSA au démarrage de l'application
 */
export default function RSAKeyPreloader() {
  useEffect(() => {
    const loadPublicKey = async () => {
      try {
        await getPublicKey();
      } catch (err: Error | unknown) {
        console.error('Erreur lors du chargement de la clé RSA:', err);
      }
    };

    loadPublicKey();
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
