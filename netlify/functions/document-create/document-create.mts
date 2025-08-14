import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const { name, type, category, description, tags, base64File, mimeType } = JSON.parse(event.body || '{}');
  
  if (!name || !base64File || !mimeType || !type || !category) {
    return errorResponse(400, 'Paramètres manquants');
  }

  try {
    const buffer = Buffer.from(base64File, 'base64');
    const ownerId = (context as AuthContext).userId!;
    
    const document = await documentService.createDocument({
      name,
      type,
      category,
      description,
      tags,
      ownerId,
      file: {
        name,
        buffer,
        mimeType
      }
    });

    return successResponse(document as Record<string, unknown>, 201);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    return errorResponse(500, errorMessage);
  }
});

export { handler };
