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

// Headers JSON standards
const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
} as const;

// Fonctions utilitaires pour les réponses JSON
export function jsonResponse(statusCode: number, body: JsonResponse): HandlerResponse {
  return {
    statusCode,
    headers: { ...jsonHeaders },
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
        headers: { ...jsonHeaders },
        body: ''
      };
    }

    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

      // Assurer que toutes les réponses ont les headers JSON
      return {
        ...response,
        headers: {
          ...jsonHeaders,
          ...(response.headers || {})
        }
      };
    } catch (err) {
      return errorResponse(401, 'Token invalide');
    }
  };
}
