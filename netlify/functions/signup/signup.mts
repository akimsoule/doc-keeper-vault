import { Handler } from '@netlify/functions';
import { userService } from '../../doc.core/beans';
import { signJwt } from '../utils/jwt';

const handler: Handler = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body || '{}');
    if (!email || !password || !name) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }

    const user = await userService.createUser({ email, name, password });
    const token = signJwt({ id: user.id });
    
    return {
      statusCode: 201,
      body: JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } }),
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    
    if (errorMessage.includes('existe déjà')) {
      return { statusCode: 409, body: JSON.stringify({ error: errorMessage }) };
    }
    
    return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
  }
};

export { handler };
