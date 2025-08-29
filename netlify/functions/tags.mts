import { Context } from '@netlify/functions';
import { TagService } from '../files.core/src/services/tagService';
import { LogService } from '../files.core/src/services/logService';
import {
  handleCorsOptions,
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
  validateHttpMethod,
  extractResourceId,
  handleErrors
} from './middleware.mjs';

// Initialisation des services
const logService = new LogService();
const tagService = new TagService(logService);

export default handleErrors(async (request: Request, context: Context) => {
  // Gestion CORS
  if (request.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  // Validation de la méthode HTTP
  const methodValidation = validateHttpMethod(request, ['GET', 'DELETE']);
  if (!methodValidation.success) {
    return methodValidation.response!;
  }

  // Authentification
  const authResult = requireAuth(request);
  if (!authResult.success) {
    return authResult.response!;
  }

  const user = authResult.context!.user!;
  const url = new URL(request.url);
  const tagName = extractResourceId(url, 'tags');

  switch (request.method) {
    case 'GET':
      if (tagName) {
        return await handleTagStats(tagName);
      } else {
        return await handleListTags();
      }

    case 'DELETE':
      if (tagName) {
        return await handleDeleteTag(tagName, user);
      } else {
        return createErrorResponse('Nom du tag requis pour la suppression', 400);
      }

    default:
      return createErrorResponse('Méthode non autorisée', 405);
  }
});

// Fonctions helper

async function handleListTags() {
  try {
    const allTags = await tagService.getAllTags();
    return createSuccessResponse(allTags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    return createErrorResponse('Erreur lors de la récupération des tags', 500);
  }
}

async function handleTagStats(tagName: string) {
  try {
    const tagStats = await tagService.getTagStats();
    const specificTag = tagStats.find(t => t.tag === tagName);
    
    if (!specificTag) {
      return createErrorResponse('Tag non trouvé', 404);
    }
    
    return createSuccessResponse(specificTag);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du tag:', error);
    return createErrorResponse('Erreur lors de la récupération des statistiques du tag', 500);
  }
}

async function handleDeleteTag(tagName: string, user: any) {
  try {
    // Note: Cette fonctionnalité nécessiterait d'étendre le TagService
    // pour supprimer complètement un tag du système
    return createErrorResponse('Suppression complète de tags non implémentée', 501);
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    return createErrorResponse('Erreur lors de la suppression du tag', 500);
  }
}
