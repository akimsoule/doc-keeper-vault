import { Handler } from '@netlify/functions';
import { userService } from '../../doc.core/beans';
import { signJwt } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/middleware';
import { withRateLimit } from '../utils/rateLimiter';
import { validateData, signupSchema } from '../utils/validation';
import { securityLogger } from '../utils/securityLogger';

const baseHandler: Handler = async (event) => {
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
  const userAgent = event.headers['user-agent'];

  try {
    // Validation des données d'entrée
    const { error, value } = validateData(signupSchema, JSON.parse(event.body || '{}'));
    if (error) {
      return errorResponse(400, error);
    }

    const { email, password, name } = value!;

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
