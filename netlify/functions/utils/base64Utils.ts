/**
 * Utilitaires pour l'encodage/décodage Base64
 */

/**
 * Décode une chaîne Base64
 * @param str Chaîne encodée en Base64
 * @returns Chaîne décodée
 */
export function decodeBase64(str: string): string {
  try {
    if (!str || typeof str !== 'string') {
      throw new Error('Données Base64 invalides');
    }
    
    // Nettoyer la chaîne Base64 si nécessaire
    const cleanBase64 = str.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // Utiliser Buffer qui est plus robuste que atob
    try {
      return Buffer.from(cleanBase64, 'base64').toString('utf-8');
    } catch (bufferError) {
      console.warn('Échec avec Buffer, tentative avec atob:', bufferError);
      
      // Méthode de secours avec atob si Buffer échoue
      return decodeURIComponent(
        Array.prototype.map.call(
          atob(cleanBase64),
          (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    }
  } catch (e) {
    // En cas d'erreur de décodage, retourner la chaîne originale et logger l'erreur
    console.warn('Erreur de décodage Base64:', e);
    return str;
  }
}

/**
 * Encode une chaîne en Base64
 * @param str Chaîne à encoder
 * @returns Chaîne encodée en Base64
 */
export function encodeBase64(str: string): string {
  return Buffer.from(str).toString('base64');
}
