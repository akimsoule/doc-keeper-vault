import { Handler } from '@netlify/functions';
import { userService } from '../../doc.core/beans';
import { signJwt } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/middleware';
import { withRateLimit } from '../utils/rateLimiter';
import { validateData, loginSchema } from '../utils/validation';
import { securityLogger } from '../utils/securityLogger';

const baseHandler: Handler = async (event) => {
  const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
  const userAgent = event.headers['user-agent'];

  try {
    // Validation des données d'entrée
    const { error, value } = validateData(loginSchema, JSON.parse(event.body || '{}'));
    if (error) {
      securityLogger.logLoginAttempt(ip, 'invalid_data', false, userAgent);
      return errorResponse(400, error);
    }

    const { email, password } = value!;

    const user = await userService.authenticateUser(email, password);
    const token = signJwt({ id: user.id });
    
    securityLogger.logLoginAttempt(ip, email, true, userAgent);
    
    return successResponse({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    const { email } = JSON.parse(event.body || '{}');
    
    securityLogger.logLoginAttempt(ip, email || 'unknown', false, userAgent);
    
    if (errorMessage.includes('non trouvé') || errorMessage.includes('incorrect')) {
      return errorResponse(401, 'Email ou mot de passe incorrect');
    }
    
    return errorResponse(500, errorMessage);
  }
};

// Appliquer le rate limiting: max 5 tentatives par minute par IP
export const handler = withRateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (ip: string) => `login:${ip}`
})(baseHandler);
