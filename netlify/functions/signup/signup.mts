import { Handler } from '@netlify/functions';
import { userService } from '../../doc.core/beans';
import { signJwt } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/middleware';
import { withRateLimit } from '../utils/rateLimiter';
import { validateData, signupSchema } from '../utils/validation';
import { securityLogger } from '../utils/securityLogger';
import { decodeBase64 } from '../utils/base64Utils';
import { decryptForSession } from '../utils/rsaEncryption';

const baseHandler: Handler = async (event) => {
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
  const userAgent = event.headers['user-agent'];

  try {
    // Validation des données d'entrée
    const { error, value } = validateData(signupSchema, JSON.parse(event.body || '{}'));
    if (error) {
      return errorResponse(400, error);
    }

    const { email, password: encryptedPassword, name, encryptionMethod } = value!;
    
    // Récupérer le sessionId depuis les cookies
    let password = encryptedPassword;
    const cookies = event.headers.cookie || '';
    const sessionMatch = cookies.match(/secure_session_id=([^;]+)/);
    
    try {
      // Déchiffrer le mot de passe selon la méthode utilisée
      if (encryptionMethod === 'rsa' && sessionMatch && sessionMatch[1]) {
        password = decryptForSession(encryptedPassword, sessionMatch[1]);
      } else if (encryptionMethod === 'base64') {
        password = decodeBase64(encryptedPassword);
      }
    } catch (err) {
      console.error('Erreur lors du déchiffrement:', err);
      return errorResponse(400, 'Erreur de déchiffrement des identifiants');
    }

    const user = await userService.createUser({ email, name, password });
    const token = signJwt({ id: user.id });
    
    // Logger la création de compte réussie
    securityLogger.logLoginAttempt(ip, email, true, userAgent);
    
    return successResponse({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    }, 201);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    
    if (errorMessage.includes('existe déjà')) {
      return errorResponse(409, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
};

// Appliquer le rate limiting: max 3 créations de compte par heure par IP
export const handler = withRateLimit({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 heure
  keyGenerator: (ip: string) => `signup:${ip}`
})(baseHandler);
