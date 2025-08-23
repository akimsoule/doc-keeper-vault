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
    
    // Debug: examiner la forme exacte de la clé publique
    if (data.publicKey) {
      const keyStr = data.publicKey.toString();
      console.log('Structure de la clé: longueur=', keyStr.length);
      console.log('Contient BEGIN PUBLIC KEY?', keyStr.includes('-----BEGIN PUBLIC KEY-----'));
      console.log('Contient END PUBLIC KEY?', keyStr.includes('-----END PUBLIC KEY-----'));
      console.log('Premier caractères:', keyStr.substring(0, 20));
      console.log('Derniers caractères:', keyStr.substring(keyStr.length - 20));
    }
    
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
    if (!pemKey || typeof pemKey !== 'string') {
      console.error('Format de clé PEM invalide ou manquant:', pemKey);
      throw new Error('Format de clé PEM invalide ou manquant');
    }
    
    console.log('Format de la clé brute:', pemKey.length > 50 ? 
      pemKey.substring(0, 25) + '...' + pemKey.substring(pemKey.length - 25) : pemKey);

    // Convertir la clé PEM en format compatible WebCrypto
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    
    // Vérifier si les marqueurs existent dans la chaîne
    const hasHeader = pemKey.includes(pemHeader);
    const hasFooter = pemKey.includes(pemFooter);
    console.log('Contient en-tête:', hasHeader, 'Contient pied de page:', hasFooter);
    
    // Normaliser la chaîne PEM avant extraction
    // Certains serveurs peuvent fournir des formats légèrement différents
    let normalizedPem = pemKey;
    if (!hasHeader && !hasFooter) {
      // Si les marqueurs sont absents, il s'agit peut-être déjà du contenu Base64 seul
      console.log('La clé ne contient pas de marqueurs PEM - supposons que c\'est déjà du Base64');
    } else {
      // Si certains marqueurs manquent, assurons-nous que la chaîne est bien formatée
      if (!hasHeader) normalizedPem = pemHeader + '\n' + normalizedPem;
      if (!hasFooter) normalizedPem += '\n' + pemFooter;
    }
    
    // Extraire la partie Base64 de la clé PEM avec une méthode robuste
    let pemContents: string;
    
    if (hasHeader && hasFooter) {
      // Extraction précise avec indices
      const startPos = normalizedPem.indexOf(pemHeader) + pemHeader.length;
      const endPos = normalizedPem.indexOf(pemFooter);
      
      if (startPos <= 0 || endPos <= 0 || endPos <= startPos) {
        console.error('Positions de marqueurs incorrectes:', startPos, endPos);
        throw new Error('Format de clé PEM malformé - marqueurs positionnés incorrectement');
      }
      
      pemContents = normalizedPem.substring(startPos, endPos);
    } else {
      // Si pas de marqueurs, utiliser la chaîne telle quelle (supposée être déjà Base64)
      pemContents = normalizedPem;
    }
    
    // Nettoyer la chaîne Base64 (retirer espaces, sauts de ligne, etc.)
    pemContents = pemContents.replace(/[\r\n\t ]+/g, '');
    console.log('Contenu PEM extrait et nettoyé, longueur:', pemContents.length);
    
    // Valider que c'est un Base64 valide avant décodage
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(pemContents)) {
      console.error('La clé PEM contient des caractères non valides pour Base64');
      console.log('Caractères problématiques:', pemContents.replace(/[A-Za-z0-9+/=]/g, ''));
      console.log('Nettoyage des caractères non-Base64...');
      pemContents = pemContents.replace(/[^A-Za-z0-9+/=]/g, '');
      
      // Vérification supplémentaire
      if (!base64Regex.test(pemContents)) {
        console.error('Toujours des problèmes après nettoyage, caractères restants:', 
          pemContents.replace(/[A-Za-z0-9+/=]/g, ''));
      }
    }
    
    // S'assurer que la longueur est un multiple de 4 pour Base64 valide
    if (pemContents.length % 4 !== 0) {
      console.warn('La longueur du Base64 n\'est pas un multiple de 4:', pemContents.length);
      // Compléter avec des = si nécessaire
      while (pemContents.length % 4 !== 0) {
        pemContents += '=';
      }
      console.log('Longueur après ajustement:', pemContents.length);
    }
    
    // Décoder le Base64 en ArrayBuffer avec gestion d'erreur
    console.log('Décodage du contenu PEM en binaire');
    let binaryDer: string;
    try {
      binaryDer = window.atob(pemContents);
      console.log('Décodage Base64 réussi, longueur binaire:', binaryDer.length);
    } catch (atobError) {
      console.error('Échec du décodage Base64:', atobError);
      console.log('Premiers caractères du Base64 problématique:', 
        pemContents.substring(0, Math.min(50, pemContents.length)));
      throw new Error('La clé PEM n\'est pas un Base64 valide: ' + 
        (atobError instanceof Error ? atobError.message : 'erreur inconnue'));
    }
    
    // Convertir le binaire en Uint8Array
    const binaryDerArray = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      binaryDerArray[i] = binaryDer.charCodeAt(i);
    }
  
    console.log('Importation de la clé dans WebCrypto');
    // Importer la clé pour une utilisation avec WebCrypto
    const key = await window.crypto.subtle.importKey(
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
 * Utilise plusieurs méthodes pour assurer la compatibilité maximum
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  try {
    console.log('Conversion ArrayBuffer -> Base64');
    // Vérification de la validité du buffer
    if (!buffer || !(buffer instanceof ArrayBuffer)) {
      throw new Error('Buffer invalide');
    }
    
    // Méthode principale utilisant l'API moderne si disponible
    if (typeof window !== 'undefined' && window.btoa && TextDecoder) {
      try {
        console.log('Tentative avec TextDecoder et btoa');
        const decoder = new TextDecoder('latin1');
        const text = decoder.decode(buffer);
        return window.btoa(text);
      } catch (error) {
        console.log('Méthode TextDecoder a échoué:', error);
        // Continuer avec la méthode de secours
      }
    }
    
    // Méthode de secours octet par octet
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    
    console.log(`Taille du buffer: ${len} octets`);
    
    // Conversion octet par octet pour éviter les problèmes avec les caractères spéciaux
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    try {
      // Tentative avec btoa standard
      console.log('Tentative de conversion avec btoa standard');
      const base64 = window.btoa(binary);
      console.log('Conversion btoa réussie, longueur:', base64.length);
      return base64;
    } catch (btoaError) {
      console.error('Erreur lors de la conversion en Base64 standard:', btoaError);
      
      // Méthode de dernier recours: utiliser notre encodeur manuel
      console.log('Utilisation de l\'encodeur Base64 manuel');
      const manualBase64 = fallbackBase64Encode(bytes);
      console.log('Conversion manuelle réussie, longueur:', manualBase64.length);
      return manualBase64;
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
    let pemKey;
    try {
      pemKey = await getPublicKey();
      
      // Vérifier que la clé est au bon format
      if (!pemKey) {
        console.error('Clé publique vide ou null');
        throw new Error('Clé publique RSA manquante');
      }
      
      // Log détaillé pour débogage
      console.log('Format de la clé publique reçue:');
      console.log('- Longueur:', pemKey.length);
      console.log('- Début avec en-tête PEM:', pemKey.includes('-----BEGIN PUBLIC KEY-----'));
      console.log('- Fin avec pied de page PEM:', pemKey.includes('-----END PUBLIC KEY-----'));
      
      // Si la clé n'a pas le format PEM attendu, essayer de l'ajuster
      if (!pemKey.includes('-----BEGIN PUBLIC KEY-----')) {
        console.log('Ajout de l\'en-tête PEM manquant');
        pemKey = '-----BEGIN PUBLIC KEY-----\n' + pemKey;
      }
      
      if (!pemKey.includes('-----END PUBLIC KEY-----')) {
        console.log('Ajout du pied de page PEM manquant');
        pemKey = pemKey + '\n-----END PUBLIC KEY-----';
      }
      
    } catch (keyError) {
      console.error('Erreur lors de la récupération de la clé publique:', keyError);
      throw new Error('Impossible de récupérer la clé publique RSA');
    }
    
    // Importer la clé pour l'utilisation avec WebCrypto
    console.log('Importation de la clé pour WebCrypto...');
    let publicKey;
    try {
      publicKey = await importRsaPublicKey(pemKey);
      console.log('Clé importée avec succès');
    } catch (importError) {
      console.error('Erreur lors de l\'importation de la clé RSA:', importError);
      // En cas d'erreur, afficher des détails précis sur la clé problématique
      console.log('Détails de la clé problématique:');
      if (typeof pemKey === 'string') {
        const lines = pemKey.split('\n');
        console.log(`- ${lines.length} lignes`);
        console.log(`- Première ligne: ${lines[0]}`);
        console.log(`- Dernière ligne: ${lines[lines.length - 1]}`);
      }
      throw new Error('Échec de l\'importation de la clé RSA');
    }
    
    // Convertir les données en ArrayBuffer
    console.log('Conversion des données en ArrayBuffer...');
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    console.log('Données converties, longueur:', dataBuffer.byteLength);
    
    // Chiffrer les données
    console.log('Chiffrement des données avec RSA-OAEP...');
    let encryptedBuffer;
    try {
      encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        dataBuffer
      );
      console.log('Données chiffrées, longueur buffer:', encryptedBuffer.byteLength);
    } catch (encryptError) {
      console.error('Erreur lors du chiffrement:', encryptError);
      throw new Error('Échec du chiffrement RSA-OAEP: ' + 
        (encryptError instanceof Error ? encryptError.message : 'erreur inconnue'));
    }
    
    // Convertir en Base64 pour la transmission de manière robuste
    console.log('Conversion du buffer chiffré en Base64...');
    let base64Result;
    try {
      base64Result = arrayBufferToBase64(encryptedBuffer);
      console.log('Conversion Base64 réussie, longueur:', base64Result.length);
    } catch (base64Error) {
      console.error('Erreur lors de la conversion en Base64:', base64Error);
      throw new Error('Échec de la conversion en Base64');
    }
    
    return base64Result;
  } catch (error) {
    console.error('Erreur lors du chiffrement RSA:', error);
    // Retourner un message d'erreur explicite
    throw new Error('Erreur de chiffrement RSA: ' + 
      (error instanceof Error ? error.message : 'erreur inconnue'));
  }
}
