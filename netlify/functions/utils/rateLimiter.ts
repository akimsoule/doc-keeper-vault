import { Handler, HandlerResponse } from '@netlify/functions';

// Rate limiting en mémoire (pour la démonstration - en production utiliser Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (ip: string, path: string) => string;
}

export function withRateLimit(options: RateLimitOptions) {
  return function (handler: Handler): Handler {
    return async (event, context): Promise<HandlerResponse> => {
      const ip = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
      const path = event.path;
      const key = options.keyGenerator ? options.keyGenerator(ip, path) : `${ip}:${path}`;
      
      const now = Date.now();
      const requestData = requestCounts.get(key);
      
      if (!requestData || now > requestData.resetTime) {
        requestCounts.set(key, { count: 1, resetTime: now + options.windowMs });
        const response = await handler(event, context);
        return response || { statusCode: 500, body: 'Internal Server Error' };
      }
      
      if (requestData.count >= options.maxRequests) {
        console.warn(`Rate limit exceeded for ${ip} on ${path}`);
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((requestData.resetTime - now) / 1000).toString()
          },
          body: JSON.stringify({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' })
        };
      }
      
      requestData.count++;
      const response = await handler(event, context);
      return response || { statusCode: 500, body: 'Internal Server Error' };
    };
  };
}

// Nettoyage périodique des entrées expirées
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Nettoyer toutes les minutes
