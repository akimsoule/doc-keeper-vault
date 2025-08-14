import 'dotenv/config';
import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const ownerId = (context as AuthContext).userId as string;
  const id = event.queryStringParameters?.id;

  if (!id) {
    return errorResponse(400, 'Paramètre id manquant');
  }

  try {
    const result = await documentService.deleteUserDocument(id, ownerId);
    return successResponse(result);
  } catch (err: unknown) {
    console.error('Erreur lors de la suppression du document:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    
    if (errorMessage.includes('non trouvé')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
});

export { handler };
