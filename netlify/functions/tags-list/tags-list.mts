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
    // Récupérer tous les documents de l'utilisateur
    const documents = await documentService.getUserDocuments(ownerId);
    
    // Extraire tous les tags et les dédupliquer
    const allTags = documents.flatMap((doc: any) => doc.tags || []);
    const uniqueTags = [...new Set(allTags)].filter((tag: string) => tag.trim() !== '').sort();

    return successResponse({ tags: uniqueTags });

  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    return errorResponse(500, 'Erreur serveur');
  }
});

export { handler };
