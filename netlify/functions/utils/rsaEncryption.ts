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
 * Normalise une clé PEM pour garantir un format correct
 * @param pemKey Clé au format PEM
 * @returns Clé normalisée
 */
function normalizePEMKey(pemKey: string): string {
  if (!pemKey) return pemKey;
  
  // Vérifier si la clé contient déjà les en-têtes et pieds de page appropriés
  const hasHeader = pemKey.includes('-----BEGIN');
  const hasFooter = pemKey.includes('-----END');
  
  if (hasHeader && hasFooter) {
    // Si les marqueurs sont présents, s'assurer qu'ils sont correctement formatés
    let normalized = pemKey;
    
    // Assurer que chaque ligne a une longueur appropriée
    const lines = pemKey.split('\n');
    const formattedLines: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('-----')) {
        // Les lignes d'en-tête/pied restent inchangées
        formattedLines.push(line);
      } else if (line.trim() !== '') {
        // Formater les lignes de contenu en blocs de 64 caractères
        const trimmedLine = line.trim();
        for (let i = 0; i < trimmedLine.length; i += 64) {
          formattedLines.push(trimmedLine.substring(i, i + 64));
        }
      }
    }
    
    normalized = formattedLines.join('\n');
    
    // S'assurer qu'il y a une ligne vide avant et après le bloc PEM
    return normalized;
  } else {
    // Si les marqueurs sont manquants, considérer que c'est un contenu brut
    console.warn('La clé PEM manque de marqueurs, ajout des marqueurs appropriés');
    
    // Vérifier quel type de clé et ajouter les marqueurs appropriés
    let formatted = '';
    if (pemKey.includes('PRIVATE KEY')) {
      formatted = '-----BEGIN PRIVATE KEY-----\n';
      formatted += pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, '').trim();
      formatted += '\n-----END PRIVATE KEY-----';
    } else {
      // Par défaut, supposer que c'est une clé publique
      formatted = '-----BEGIN PUBLIC KEY-----\n';
      formatted += pemKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/g, '').trim();
      formatted += '\n-----END PUBLIC KEY-----';
    }
    
    return formatted;
  }
}

/**
 * Génère ou récupère une paire de clés pour une session
 * @param sessionId ID unique de la session
 * @returns Paire de clés RSA pour la session
 */
export function getOrCreateKeyPairForSession(sessionId: string) {
  if (!keyPairsCache.has(sessionId)) {
    const keyPair = generateRSAKeyPair();
    
    // Normaliser les clés pour garantir un format correct
    const normalizedPublicKey = normalizePEMKey(keyPair.publicKey);
    const normalizedPrivateKey = normalizePEMKey(keyPair.privateKey);
    
    keyPairsCache.set(sessionId, {
      publicKey: normalizedPublicKey,
      privateKey: normalizedPrivateKey,
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
    if (!encryptedData || typeof encryptedData !== 'string') {
      console.error('[decryptWithPrivateKey] Données de chiffrement invalides');
      throw new Error('Données de chiffrement invalides');
    }
    
    if (!privateKey || typeof privateKey !== 'string') {
      console.error('[decryptWithPrivateKey] Clé privée invalide ou manquante');
      throw new Error('Clé privée RSA invalide');
    }
    
    // Log de débogage pour examiner les données entrantes
    console.log(`[decryptWithPrivateKey] Déchiffrement de données (longueur: ${encryptedData.length})`);
    console.log(`[decryptWithPrivateKey] Format clé privée valide: ${
      privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
      privateKey.includes('-----END PRIVATE KEY-----')
    }`);
    
    // Normaliser la clé privée pour s'assurer qu'elle est bien formée
    const normalizedPrivateKey = normalizePEMKey(privateKey);
    
    // Nettoyer la chaîne Base64 si nécessaire (supprimer les caractères non-Base64)
    const cleanBase64 = encryptedData.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // S'assurer que la longueur est un multiple de 4 pour Base64 valide
    let paddedBase64 = cleanBase64;
    while (paddedBase64.length % 4 !== 0) {
      paddedBase64 += '=';
    }
    
    // Convertir les données Base64 en Buffer avec gestion des erreurs
    let buffer;
    try {
      buffer = Buffer.from(paddedBase64, 'base64');
      console.log(`[decryptWithPrivateKey] Conversion Base64 -> Buffer réussie, taille: ${buffer.length} octets`);
    } catch (base64Error) {
      console.error('[decryptWithPrivateKey] Erreur de décodage Base64:', base64Error);
      throw new Error('Format Base64 invalide');
    }
    
    // Déchiffrer avec la clé privée
    let decrypted;
    try {
      decrypted = crypto.privateDecrypt(
        {
          key: normalizedPrivateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        buffer
      );
      console.log(`[decryptWithPrivateKey] Déchiffrement réussi, longueur résultat: ${decrypted.length} octets`);
    } catch (decryptError) {
      console.error('[decryptWithPrivateKey] Erreur de déchiffrement:', decryptError);
      // Tenter avec un padding différent en cas d'échec
      try {
        console.log('[decryptWithPrivateKey] Tentative avec padding alternatif...');
        decrypted = crypto.privateDecrypt(
          {
            key: normalizedPrivateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
          },
          buffer
        );
        console.log('[decryptWithPrivateKey] Déchiffrement alternatif réussi');
      } catch (fallbackError) {
        console.error('[decryptWithPrivateKey] Échec du déchiffrement alternatif:', fallbackError);
        throw new Error('Échec du déchiffrement RSA');
      }
    }
    
    // Convertir le résultat en chaîne UTF-8
    const result = decrypted.toString('utf8');
    return result;
  } catch (error) {
    console.error('[decryptWithPrivateKey] Erreur de déchiffrement RSA:', error);
    throw new Error('Impossible de déchiffrer les données: ' + (error instanceof Error ? error.message : 'erreur inconnue'));
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
