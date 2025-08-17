import { Handler, HandlerContext, HandlerResponse, HandlerEvent } from '@netlify/functions';
import { verifyJwt } from './jwt';

export type AuthContext = HandlerContext & { userId?: string };

export type JsonResponse = {
  data?: Record<string, unknown>;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Headers de sécurité renforcés
const securityHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
} as const;

// Fonctions utilitaires pour les réponses JSON
export function jsonResponse(statusCode: number, body: JsonResponse): HandlerResponse {
  return {
    statusCode,
    headers: { ...securityHeaders },
    body: JSON.stringify(body)
  };
}

export function errorResponse(statusCode: number, message: string): HandlerResponse {
  return jsonResponse(statusCode, { error: message });
}

export function successResponse(data: Record<string, unknown>, statusCode = 200): HandlerResponse {
  return jsonResponse(statusCode, { data });
}

export function withAuth(handler: Handler): Handler {
  return async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
    // Gérer les requêtes OPTIONS pour CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: { ...securityHeaders },
        body: ''
      };
    }

    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Path :', event.path);
      return errorResponse(401, 'Non autorisé');
    }
    
    try {
      const token = authHeader.split(' ')[1];
      const payload = verifyJwt(token) as { id: string };
      (context as AuthContext).userId = payload.id;
      
      const response = await handler(event, context);
      
      if (!response) {
        return errorResponse(500, 'Erreur serveur interne');
      }

      // Assurer que toutes les réponses ont les headers de sécurité
      return {
        ...response,
        headers: {
          ...securityHeaders,
          ...(response.headers || {})
        }
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return errorResponse(401, 'Token invalide');
    }
  };
}
