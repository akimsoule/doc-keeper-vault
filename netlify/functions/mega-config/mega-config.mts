import { Handler } from '@netlify/functions';
import { withAuth } from '../utils/middleware';
import { errorResponse, successResponse } from '../utils/middleware';
import { MegaConfigService } from '../../doc.core/services/megaConfigService';
import Joi from 'joi';

const megaConfigService = new MegaConfigService();

// Schéma de validation pour la configuration MEGA
const megaConfigSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'L\'email doit être une adresse email valide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
    'any.required': 'Le mot de passe est requis'
  }),
  isActive: Joi.boolean().optional(),
  testConnection: Joi.boolean().optional()
});

export const handler: Handler = withAuth(async (event, context) => {
  const userId = (context as any).userId!;

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getMegaConfig(userId);
        
      case 'POST':
      case 'PUT':
        return await setMegaConfig(userId, event.body);
        
      case 'DELETE':
        return await deleteMegaConfig(userId);
        
      case 'PATCH':
        return await toggleMegaConfig(userId, event.body);
        
      default:
        return errorResponse(405, 'Méthode non autorisée');
    }
  } catch (error) {
    console.error('Erreur configuration MEGA:', error);
    return errorResponse(500, 'Erreur serveur interne');
  }
});

async function getMegaConfig(userId: string) {
  const config = await megaConfigService.getMegaConfig(userId);
  return successResponse(config || {});
}

async function setMegaConfig(userId: string, body: string | null) {
  if (!body) {
    return errorResponse(400, 'Corps de requête requis');
  }

  const { error, value } = megaConfigSchema.validate(JSON.parse(body));
  if (error) {
    return errorResponse(400, error.details[0].message);
  }

  const { testConnection = false, ...configData } = value;

  // Tester la connexion si demandé
  if (testConnection) {
    const isConnectionValid = await megaConfigService.testMegaConnection(
      configData.email,
      configData.password
    );
    
    if (!isConnectionValid) {
      return errorResponse(400, 'Impossible de se connecter à MEGA avec ces identifiants');
    }
  }

  const config = await megaConfigService.setMegaConfig(userId, configData);
  return successResponse(config);
}

async function deleteMegaConfig(userId: string) {
  await megaConfigService.deleteMegaConfig(userId);
  return successResponse({ message: 'Configuration MEGA supprimée' });
}

async function toggleMegaConfig(userId: string, body: string | null) {
  if (!body) {
    return errorResponse(400, 'Corps de requête requis');
  }

  const { isActive } = JSON.parse(body);
  if (typeof isActive !== 'boolean') {
    return errorResponse(400, 'Le paramètre isActive doit être un booléen');
  }

  const config = await megaConfigService.toggleMegaConfig(userId, isActive);
  return successResponse(config);
}
