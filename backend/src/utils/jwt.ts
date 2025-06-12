import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms';      
const JWT_SECRET = process.env.JWT_SECRET as Secret;

type JwtPayload = string | Buffer | object;

export function signJwt(
  payload: JwtPayload,
  expiresIn: StringValue | number = '1h'   
): string {
  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn,
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
