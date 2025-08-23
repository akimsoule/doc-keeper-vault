import { Handler } from '@netlify/functions';
import { withAuth } from '../utils/middleware';
import { errorResponse, successResponse } from '../utils/middleware';
import { MegaConfigService } from '../../doc.core/services/megaConfigService';
import { decodeBase64 } from '../utils/base64Utils';
import { decryptForSession } from '../utils/rsaEncryption';
import Joi from 'joi';

const megaConfigService = new MegaConfigService();

// Schéma de validation pour la configuration MEGA
const megaConfigSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'L\'email doit être une adresse email valide',
    'any.required': 'L\'email est requis'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Le mot de passe est requis'
  }),
  isActive: Joi.boolean().optional(),
  testConnection: Joi.boolean().optional(),
  isEncoded: Joi.boolean().optional().default(false), // Pour compatibilité
  encryptionMethod: Joi.string().valid('rsa', 'base64').default('base64')
});

export const handler: Handler = withAuth(async (event, context) => {
  const userId = (context as any).userId!;

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getMegaConfig(userId);
        
      case 'POST':
      case 'PUT':
        return await setMegaConfig(userId, event.body, event);
        
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

async function setMegaConfig(userId: string, body: string | null, event?: any) {
  if (!body) {
    return errorResponse(400, 'Corps de requête requis');
  }

  const { error, value } = megaConfigSchema.validate(JSON.parse(body));
  if (error) {
    return errorResponse(400, error.details[0].message);
  }

  const { testConnection = false, isEncoded = false, encryptionMethod = 'base64', ...configData } = value;
  
  try {
    // Déchiffrer le mot de passe selon la méthode
    if (configData.password) {
      // Récupérer le sessionId depuis les cookies
      const cookies = event?.headers?.cookie || '';
      const sessionMatch = cookies.match(/secure_session_id=([^;]+)/);
      
      if (encryptionMethod === 'rsa' && sessionMatch && sessionMatch[1]) {
        configData.password = decryptForSession(configData.password, sessionMatch[1]);
      } else if (encryptionMethod === 'base64' || isEncoded) {
        configData.password = decodeBase64(configData.password);
      }
    }
  } catch (err) {
    console.error('Erreur lors du déchiffrement:', err);
    return errorResponse(400, 'Erreur de déchiffrement des identifiants');
  }

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
  const wasDeleted = await megaConfigService.deleteMegaConfig(userId);
  
  if (!wasDeleted) {
    return errorResponse(404, 'Aucune configuration MEGA trouvée pour cet utilisateur');
  }
  
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
  
  if (!config) {
    return errorResponse(404, 'Aucune configuration MEGA trouvée pour cet utilisateur');
  }
  
  return successResponse(config);
}
