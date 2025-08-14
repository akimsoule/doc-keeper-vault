import 'dotenv/config';
import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const ownerId = (context as AuthContext).userId as string;
  
  try {
    const {
      id,
      name,
      type,
      category,
      description,
      tags,
      isFavorite,
      base64File,
      mimeType,
    } = JSON.parse(event.body || '{}');

    if (!id) {
      return errorResponse(400, 'Paramètre id manquant');
    }

    const updateData: {
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      tags?: string;
      isFavorite?: boolean;
      file?: {
        name: string;
        buffer: Buffer;
        mimeType: string;
      };
    } = {
      ...(name && { name }),
      ...(type && { type }),
      ...(category && { category }),
      ...(description !== undefined && { description }),
      ...(tags && { tags }),
      ...(isFavorite !== undefined && { isFavorite }),
    };

    // Ajouter le fichier si fourni
    if (base64File && mimeType) {
      const buffer = Buffer.from(base64File, 'base64');
      updateData.file = {
        name: name || 'document',
        buffer,
        mimeType
      };
    }

    const updatedDocument = await documentService.updateUserDocument(id, ownerId, updateData);

    return successResponse(updatedDocument);
  } catch (err: unknown) {
    console.error('Erreur lors de la mise à jour du document:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    
    if (errorMessage.includes('non trouvé')) {
      return errorResponse(404, errorMessage);
    }
    
    return errorResponse(500, errorMessage);
  }
});

export { handler };
