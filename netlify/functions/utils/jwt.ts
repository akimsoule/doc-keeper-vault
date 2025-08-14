import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export function signJwt(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

interface JwtPayload {
  id: string;
  exp: number;
}
export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
