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
  console.log('Tentative de récupération de la clé publique RSA');
  // Si une clé valide est en cache, la retourner
  if (publicKeyCache && publicKeyCache.expiry > Date.now()) {
    console.log('Clé publique RSA récupérée depuis le cache');
    return publicKeyCache.key;
  }

  try {
    console.log('Récupération de la clé publique RSA depuis le serveur...');
    // Sinon, récupérer une nouvelle clé du serveur
    const response = await fetch('/api/get-public-key');
    if (!response.ok) {
      throw new Error('Impossible de récupérer la clé publique');
    }
    
    const data = await response.json();
    
    console.log('Clé publique RSA récupérée avec succès:', data.publicKey ? 'OK' : 'Manquante');
    
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
  try {
    console.log('Début importation clé RSA');
    if (!pemKey || typeof pemKey !== 'string' || !pemKey.includes('-----BEGIN PUBLIC KEY-----')) {
      console.error('Format de clé PEM invalide:', pemKey);
      throw new Error('Format de clé PEM invalide');
    }
    
    // Convertir la clé PEM en format compatible WebCrypto
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    
    // Extraire la partie Base64 de la clé PEM
    const pemContents = pemKey.substring(
      pemHeader.length,
      pemKey.length - pemFooter.length
    ).replace(/\s/g, '');
  
    // Décoder le Base64 en ArrayBuffer
    console.log('Décodage du contenu PEM en binaire');
    const binaryDer = atob(pemContents);
    const binaryDerArray = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerArray[i] = binaryDer.charCodeAt(i);
    }
  
    console.log('Importation de la clé dans WebCrypto');
    // Importer la clé pour une utilisation avec WebCrypto
    const key = await crypto.subtle.importKey(
      'spki',
      binaryDerArray.buffer,
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' },
      },
      false, // extractable
      ['encrypt'] // Utiliser uniquement pour le chiffrement
    );
    
    console.log('Clé RSA importée avec succès');
    return key;
  } catch (error) {
    console.error('Erreur lors de l\'importation de la clé RSA:', error);
    throw new Error('Impossible d\'importer la clé publique RSA: ' + (error instanceof Error ? error.message : 'erreur inconnue'));
  }
}

/**
 * Table d'encodage Base64
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Encodage Base64 manuel (solution de dernier recours)
 */
function fallbackBase64Encode(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;
    
    const triplet = (b1 << 16) | (b2 << 8) | b3;
    
    result += BASE64_CHARS[(triplet >> 18) & 0x3F];
    result += BASE64_CHARS[(triplet >> 12) & 0x3F];
    result += i + 1 < len ? BASE64_CHARS[(triplet >> 6) & 0x3F] : '=';
    result += i + 2 < len ? BASE64_CHARS[triplet & 0x3F] : '=';
  }
  return result;
}

/**
 * Convertit un ArrayBuffer en chaîne Base64 de manière robuste
 * Utilise plusieurs méthodes pour assurer la compatibilité
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  try {
    console.log('Conversion ArrayBuffer -> Base64');
    // Vérification de la validité du buffer
    if (!buffer || !(buffer instanceof ArrayBuffer)) {
      throw new Error('Buffer invalide');
    }
    
    // Méthode simplifiée mais plus sûre
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    
    console.log(`Taille du buffer: ${len} octets`);
    
    // Conversion octet par octet pour éviter les problèmes avec les caractères spéciaux
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    try {
      // Première tentative avec btoa standard
      console.log('Tentative de conversion avec btoa standard');
      return btoa(binary);
    } catch (btoaError) {
      console.error('Erreur lors de la conversion en Base64 standard:', btoaError);
      
      // Méthode de secours: utiliser notre encodeur manuel
      console.log('Utilisation de l\'encodeur Base64 manuel');
      return fallbackBase64Encode(bytes);
    }
  } catch (error) {
    console.error('Erreur critique dans arrayBufferToBase64:', error);
    throw new Error('Échec de la conversion en Base64: ' + (error instanceof Error ? error.message : 'erreur inconnue'));
  }
}

/**
 * Chiffre des données avec la clé publique RSA
 */
export async function encryptWithPublicKey(data: string): Promise<string> {
  try {
    console.log('Début du chiffrement RSA pour:', data ? '***données***' : 'données vides');
    
    // Récupérer la clé publique du serveur
    console.log('Récupération de la clé publique...');
    const pemKey = await getPublicKey();
    console.log('Clé publique récupérée:', pemKey ? 'OK' : 'Manquante');
    
    // Importer la clé pour l'utilisation avec WebCrypto
    console.log('Importation de la clé pour WebCrypto...');
    const publicKey = await importRsaPublicKey(pemKey);
    console.log('Clé importée avec succès');
    
    // Convertir les données en ArrayBuffer
    console.log('Conversion des données en ArrayBuffer...');
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    console.log('Données converties, longueur:', dataBuffer.byteLength);
    
    // Chiffrer les données
    console.log('Chiffrement des données avec RSA-OAEP...');
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      dataBuffer
    );
    console.log('Données chiffrées, longueur buffer:', encryptedBuffer.byteLength);
    
    // Convertir en Base64 pour la transmission de manière robuste
    console.log('Conversion du buffer chiffré en Base64...');
    const base64Result = arrayBufferToBase64(encryptedBuffer);
    console.log('Conversion Base64 réussie, longueur:', base64Result.length);
    
    return base64Result;
  } catch (error) {
    console.error('Erreur lors du chiffrement RSA:', error);
    throw error;
  }
}
