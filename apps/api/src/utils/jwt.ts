 
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import config from '../config/config.js';

const privateKey = readFileSync(config.jwtPrivateKeyPath, 'utf8');
const publicKey = readFileSync(config.jwtPublicKeyPath, 'utf8');

export const signToken = (id: string) => {
  return jwt.sign({ id }, privateKey, {
    expiresIn: '90d',
    algorithm: 'RS256',
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });
  } catch (error) {
    return null; // Or throw a specific error
  }
};
 