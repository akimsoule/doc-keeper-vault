/**
 * Utilitaires de chiffrement RSA pour le client
 */

/**
 * Stockage du cache pour la clé publique
 */
let publicKeyCache: { key: string, expiry: number } | null = null;
const PUBLIC_KEY_CACHE_DURATION = 60 * 60 * 1000; // 1 heure

/**
 * Récupère la clé publique du serveur
 */
export async function getPublicKey(): Promise<string> {
  // Si une clé valide est en cache, la retourner
  if (publicKeyCache && publicKeyCache.expiry > Date.now()) {
    return publicKeyCache.key;
  }

  try {
    // Sinon, récupérer une nouvelle clé du serveur
    const response = await fetch('/api/get-public-key');
    if (!response.ok) {
      throw new Error('Impossible de récupérer la clé publique');
    }
    
    const data = await response.json();
    
    // Mettre en cache la clé avec un temps d'expiration
    publicKeyCache = {
      key: data.publicKey,
      expiry: Date.now() + PUBLIC_KEY_CACHE_DURATION
    };
    
    return data.publicKey;
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé publique:', error);
    throw error;
  }
}

/**
 * Importe une clé publique PEM pour l'utilisation avec l'API WebCrypto
 */
export async function importRsaPublicKey(pemKey: string): Promise<CryptoKey> {
  // Convertir la clé PEM en format compatible WebCrypto
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  
  // Extraire la partie Base64 de la clé PEM
  const pemContents = pemKey.substring(
    pemHeader.length,
    pemKey.length - pemFooter.length
  ).replace(/\s/g, '');
  
  // Décoder le Base64 en ArrayBuffer
  const binaryDer = window.atob(pemContents);
  const binaryDerArray = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    binaryDerArray[i] = binaryDer.charCodeAt(i);
  }
  
  // Importer la clé pour une utilisation avec WebCrypto
  return window.crypto.subtle.importKey(
    'spki',
    binaryDerArray.buffer,
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' },
    },
    false, // extractable
    ['encrypt'] // Utiliser uniquement pour le chiffrement
  );
}

/**
 * Chiffre des données avec la clé publique RSA
 */
export async function encryptWithPublicKey(data: string): Promise<string> {
  try {
    // Récupérer la clé publique du serveur
    const pemKey = await getPublicKey();
    
    // Importer la clé pour l'utilisation avec WebCrypto
    const publicKey = await importRsaPublicKey(pemKey);
    
    // Convertir les données en ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Chiffrer les données
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      dataBuffer
    );
    
    // Convertir en Base64 pour la transmission
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  } catch (error) {
    console.error('Erreur lors du chiffrement RSA:', error);
    throw error;
  }
}
