import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Générer un secret fort si aucun n'est défini
const generateSecureSecret = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

const JWT_SECRET = process.env.JWT_SECRET || generateSecureSecret();

// Vérifier la force du secret
if (JWT_SECRET.length < 32) {
  console.warn('⚠️ AVERTISSEMENT: JWT_SECRET est trop court. Utilisez au moins 32 caractères.');
}

export function signJwt(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'doc-keeper-vault',
    audience: 'doc-keeper-app'
  });
}

interface JwtPayload {
  id: string;
  exp: number;
  iss: string;
  aud: string;
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'doc-keeper-vault',
    audience: 'doc-keeper-app'
  }) as JwtPayload;
}
