import { Context } from '@netlify/functions';
import { DocumentService } from '../files.core/src/services/documentService';
import { MegaStorageService } from '../files.core/src/services/megaStorage';
import { LogService } from '../files.core/src/services/logService';
import {
  handleCorsOptions,
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
  validateHttpMethod,
  extractResourceId,
  parseFormData,
  validatePagination,
  sanitizeString,
  handleErrors
} from './shared/middleware.mts';

// Initialisation des services
// Initialisation des services
const logService = new LogService();
const megaStorageService = new MegaStorageService();
const documentService = new DocumentService(megaStorageService, logService);

const documentsHandler = handleErrors(async (request: Request, context: Context) => {
  // Gestion CORS
  if (request.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  // Validation de la méthode HTTP
  const methodValidation = validateHttpMethod(request, ['GET', 'POST', 'PUT', 'DELETE']);
  if (!methodValidation.success) {
    return methodValidation.response!;
  }

  const url = new URL(request.url);
  const documentId = extractResourceId(url, 'documents');

  // Pour GET, l'authentification est optionnelle (pour les documents publics)
  // Pour les autres méthodes, elle est requise
  if (request.method === 'GET') {
    // GET avec authentification optionnelle
    const authResult = requireAuth(request);
    const user = authResult.success ? authResult.context!.user! : null;
    
    if (documentId) {
      return await handleGetDocument(documentId, user);
    } else {
      return await handleGetDocuments(url, user);
    }
  } else {
    // Autres méthodes - authentification requise
    const authResult = requireAuth(request);
    if (!authResult.success) {
      return authResult.response!;
    }

    const user = authResult.context!.user!;

    switch (request.method) {
      case 'POST':
        return await handleCreateDocument(request, user);

      case 'PUT':
        if (documentId) {
          return await handleUpdateDocument(documentId, request, user);
        } else {
          return createErrorResponse('ID du document requis pour la mise à jour', 400);
        }

      case 'DELETE':
        if (documentId) {
          return await handleDeleteDocument(documentId, user);
        } else {
          return createErrorResponse('ID du document requis pour la suppression', 400);
        }

      default:
        return createErrorResponse('Méthode non autorisée', 405);
    }
  }
});

// Fonctions helper

async function handleGetDocument(documentId: string, user: any) {
  try {
    const document = await documentService.getDocumentById(documentId);
    if (!document) {
      return createErrorResponse('Document non trouvé', 404);
    }
    return createSuccessResponse(document);
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return createErrorResponse('Erreur lors de la récupération du document', 500);
  }
}

async function handleGetDocuments(url: URL, user: any) {
  try {
    const category = sanitizeString(url.searchParams.get('category') || '');
    const search = sanitizeString(url.searchParams.get('search') || '');
    const tag = sanitizeString(url.searchParams.get('tag') || '');
    const userId = sanitizeString(url.searchParams.get('userId') || '');
    
    const pagination = validatePagination(url);

    const filters: any = {};
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (tag) filters.tags = [tag];
    if (userId) filters.ownerId = userId;

    const documents = await documentService.getAllDocuments(pagination.skip, pagination.limit, filters);
    return createSuccessResponse(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return createErrorResponse('Erreur lors de la récupération des documents', 500);
  }
}

async function handleCreateDocument(request: Request, user: any) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Upload de fichier
      const { data, files } = await parseFormData(request);
      
      if (files.length === 0) {
        return createErrorResponse('Aucun fichier fourni', 400);
      }

      const file = files[0];
      const createData = {
        name: sanitizeString(data.name || file.name),
        type: sanitizeString(data.type || 'document'),
        category: sanitizeString(data.category || 'general'),
        description: sanitizeString(data.description || ''),
        tags: data.tags,
        ownerId: user.userId,
        file: {
          name: file.name,
          buffer: file.buffer,
          mimeType: file.mimeType
        }
      };

      const document = await documentService.createDocument(createData);
      return createSuccessResponse(document, 201);
    } else {
      // Données JSON
      const body = await request.json();
      const createData = {
        name: sanitizeString(body.name),
        type: sanitizeString(body.type),
        category: sanitizeString(body.category),
        description: sanitizeString(body.description || ''),
        tags: body.tags,
        ownerId: user.userId
      };

      const document = await documentService.createDocument(createData);
      return createSuccessResponse(document, 201);
    }
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    return createErrorResponse('Erreur lors de la création du document', 500);
  }
}

async function handleUpdateDocument(documentId: string, request: Request, user: any) {
  try {
    const body = await request.json();
    
    // Sanitiser les données d'entrée
    const updateData: any = {};
    if (body.name) updateData.name = sanitizeString(body.name);
    if (body.type) updateData.type = sanitizeString(body.type);
    if (body.category) updateData.category = sanitizeString(body.category);
    if (body.description) updateData.description = sanitizeString(body.description);
    if (body.tags) updateData.tags = body.tags;

    const updatedDocument = await documentService.updateDocument(documentId, updateData, user.userId);
    return createSuccessResponse(updatedDocument);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return createErrorResponse('Erreur lors de la mise à jour du document', 500);
  }
}

async function handleDeleteDocument(documentId: string, user: any) {
  try {
    await documentService.deleteDocument(documentId, user.userId);
    return createSuccessResponse({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    return createErrorResponse('Erreur lors de la suppression du document', 500);
  }
}

export default documentsHandler;
