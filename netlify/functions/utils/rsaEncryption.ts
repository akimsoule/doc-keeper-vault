/**
 * Utilitaires pour le chiffrement RSA
 */
import crypto from 'crypto';

// Taille de clé RSA recommandée pour la sécurité
const RSA_KEY_SIZE = 2048;

// Cache pour stocker les paires de clés par ID de session
const keyPairsCache = new Map();

/**
 * Génère une paire de clés RSA
 * @returns Paire de clés RSA au format PEM
 */
export function generateRSAKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: RSA_KEY_SIZE,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

/**
 * Génère ou récupère une paire de clés pour une session
 * @param sessionId ID unique de la session
 * @returns Paire de clés RSA pour la session
 */
export function getOrCreateKeyPairForSession(sessionId: string) {
  if (!keyPairsCache.has(sessionId)) {
    const keyPair = generateRSAKeyPair();
    keyPairsCache.set(sessionId, {
      ...keyPair,
      createdAt: Date.now()
    });
    
    // Nettoyer les anciennes clés (plus de 24h)
    cleanupOldKeys();
  }
  
  return keyPairsCache.get(sessionId);
}

/**
 * Supprime les clés plus anciennes que 24h
 */
function cleanupOldKeys() {
  const now = Date.now();
  const expiry = 24 * 60 * 60 * 1000; // 24 heures
  
  for (const [sessionId, keyPair] of keyPairsCache.entries()) {
    if (now - keyPair.createdAt > expiry) {
      keyPairsCache.delete(sessionId);
    }
  }
}

/**
 * Déchiffre des données avec une clé privée RSA
 * @param encryptedData Données chiffrées en Base64
 * @param privateKey Clé privée RSA au format PEM
 * @returns Données déchiffrées
 */
export function decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
  try {
    // Convertir les données Base64 en Buffer
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Déchiffrer avec la clé privée
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Erreur de déchiffrement RSA:', error);
    throw new Error('Impossible de déchiffrer les données');
  }
}

/**
 * Déchiffre des données pour une session spécifique
 * @param encryptedData Données chiffrées en Base64
 * @param sessionId ID unique de la session
 * @returns Données déchiffrées
 */
export function decryptForSession(encryptedData: string, sessionId: string): string {
  const keyPair = keyPairsCache.get(sessionId);
  if (!keyPair) {
    throw new Error('Pas de clé trouvée pour cette session');
  }
  
  return decryptWithPrivateKey(encryptedData, keyPair.privateKey);
}
