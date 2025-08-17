import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { logService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const urlParams = new URLSearchParams(event.rawQuery || '');
  const limit = parseInt(urlParams.get('limit') || '20');
  const offset = parseInt(urlParams.get('offset') || '0');
  
  try {
    const userId = (context as AuthContext).userId!;
    
    // Récupérer les logs de l'utilisateur
    const logs = await logService.getUserLogs(userId, limit);
    
    // Transformer les logs pour l'affichage
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details,
      createdAt: log.createdAt,
      document: log.document ? {
        id: log.document.id,
        name: log.document.name,
        type: log.document.type
      } : null,
      user: log.user ? {
        id: log.user.id,
        name: log.user.name,
        email: log.user.email
      } : null
    }));
    
    return successResponse({
      logs: formattedLogs,
      totalCount: formattedLogs.length,
      hasMore: formattedLogs.length === limit
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    return errorResponse(500, errorMessage);
  }
});

export { handler };
