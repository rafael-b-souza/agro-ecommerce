import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Gera um JWT assinado com HS256.
 */
export function signJwt(payload, expiresIn = '1h' // já usa o tipo correto
) {
    const options = {
        algorithm: 'HS256',
        expiresIn,
    };
    return jwt.sign(payload, JWT_SECRET, options);
}
/**
 * Verifica e decodifica um JWT.
 */
export function verifyJwt(token) {
    return jwt.verify(token, JWT_SECRET);
}
