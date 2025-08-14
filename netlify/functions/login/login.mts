import { Handler } from '@netlify/functions';
import { userService } from '../../doc.core/beans';
import { signJwt } from '../utils/jwt';

const handler: Handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Paramètres manquants' }) };
    }

    const user = await userService.authenticateUser(email, password);
    const token = signJwt({ id: user.id });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } }),
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
    
    if (errorMessage.includes('non trouvé') || errorMessage.includes('incorrect')) {
      return { statusCode: 401, body: JSON.stringify({ error: errorMessage }) };
    }
    
    return { statusCode: 500, body: JSON.stringify({ error: errorMessage }) };
  }
};

export { handler };
