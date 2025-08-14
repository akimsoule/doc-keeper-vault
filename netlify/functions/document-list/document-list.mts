import 'dotenv/config';
import { Handler } from '@netlify/functions';
import { withAuth, AuthContext, errorResponse, successResponse } from '../utils/middleware';
import { documentService, megaStorageService } from '../../doc.core/beans';

const handler: Handler = withAuth(async (event, context) => {
  const ownerId = (context as AuthContext).userId as string;
  
  if (!ownerId) {
    return errorResponse(401, 'Non autorisé');
  }

  try {
    // Pagination parameters
    const { 
      page = '1', 
      pageSize = '10',
      search = '',
      type = '',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = event.queryStringParameters || {};

    const pageNum = parseInt(page, 10) || 1;
    const sizeNum = parseInt(pageSize, 10) || 10;

    const result = await documentService.searchUserDocuments(ownerId, {
      page: pageNum,
      pageSize: sizeNum,
      search,
      type,
      category,
      sortBy,
      sortOrder: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc'
    });

    // Ajouter les URLs de prévisualisation pour chaque document
    const documentsWithUrls = await Promise.all(
      result.documents.map(async (doc) => {
        try {
          const previewUrl = await megaStorageService.getBase64FileUrl(doc.fileId);
          return { ...doc, previewUrl };
        } catch (error) {
          console.error(`Erreur lors de la récupération de l'URL pour le document ${doc.id}:`, error);
          return { ...doc, previewUrl: null };
        }
      })
    );

    return successResponse({
      ...result,
      documents: documentsWithUrls
    });

  } catch (err: unknown) {
    console.error('Erreur lors de la récupération des documents:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    return errorResponse(500, errorMessage);
  }
});

export { handler };