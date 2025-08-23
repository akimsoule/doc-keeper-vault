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
    return decodeURIComponent(
      Array.prototype.map.call(
        atob(str),
        (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
  } catch (e) {
    // En cas d'erreur de décodage, retourner la chaîne originale
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
