import { Handler } from '@netlify/functions';
import { errorResponse, successResponse } from '../utils/middleware';
import { withRateLimit } from '../utils/rateLimiter';
import { getOrCreateKeyPairForSession } from '../utils/rsaEncryption';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handler pour la génération et la récupération de clés publiques RSA
 * Utilisé pour le chiffrement côté client
 */
const baseHandler: Handler = async (event) => {
  try {
    const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    
    // Générer ou récupérer un ID de session depuis le cookie
    let sessionId = '';
    const cookies = event.headers.cookie || '';
    const sessionMatch = cookies.match(/secure_session_id=([^;]+)/);
    
    if (sessionMatch && sessionMatch[1]) {
      sessionId = sessionMatch[1];
    } else {
      // Générer un nouvel ID de session si aucun n'existe
      sessionId = uuidv4();
    }
    
    // Récupérer ou générer une paire de clés pour cette session
    const { publicKey } = getOrCreateKeyPairForSession(sessionId);
    
    // Définir un cookie pour maintenir la session (non HttpOnly pour permettre l'accès JS)
    const cookieOptions = [
      `secure_session_id=${sessionId}`,
      'Path=/',
      'SameSite=Strict',
      'Secure',
      'Max-Age=86400' // 24 heures
    ];
    
    // Retourner la clé publique avec le cookie de session
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions.join('; ')
      },
      body: JSON.stringify({
        publicKey,
        sessionId
      })
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    return errorResponse(500, errorMessage);
  }
};

// Appliquer le rate limiting: max 20 requêtes par minute par IP
export const handler = withRateLimit({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (ip: string) => `public-key:${ip}`
})(baseHandler);
