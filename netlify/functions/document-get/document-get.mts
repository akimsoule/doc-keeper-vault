import 'dotenv/config';
import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService, megaStorageService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const ownerId = (context as AuthContext).userId as string;
  const id = event.queryStringParameters?.id;
  const includeContent = event.queryStringParameters?.content === 'true';
  
  if (!id) {
    return errorResponse(400, 'Paramètre id manquant');
  }
  
  try {
    // Récupération du document avec vérification propriétaire
    const document = await documentService.getUserDocumentById(id, ownerId);

    if (!document) {
      return errorResponse(404, 'Document non trouvé');
    }

    if (includeContent) {
      try {
        const fileContent = await megaStorageService.downloadFile(document.fileId);
        return successResponse({
          document,
          content: fileContent.toString('base64')
        });
      } catch (downloadError) {
        console.error('Erreur lors du téléchargement du contenu:', downloadError);
        return errorResponse(500, 'Erreur lors de la récupération du contenu du fichier');
      }
    }

    return successResponse({ document });
  } catch (err: unknown) {
    console.error('Erreur lors de la récupération du document:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    return errorResponse(500, errorMessage);
  }
});

export { handler };
