import 'dotenv/config';
import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const ownerId = (context as AuthContext).userId as string;
  
  if (!ownerId) {
    return errorResponse(401, 'Non autorisé');
  }

  try {
    const documentId = event.queryStringParameters?.id;

    if (!documentId) {
      return errorResponse(400, 'ID du document requis');
    }

    const result = await documentService.getUserDocumentUrl(documentId, ownerId);
    
    return successResponse({
      url: result.url,
      type: result.type
    });

  } catch (err: unknown) {
    console.error('Erreur lors de la récupération de l\'URL du document:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    
    if (errorMessage.includes('non trouvé')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
});

export { handler };
