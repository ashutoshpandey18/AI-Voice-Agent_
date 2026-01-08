import jwt from 'jsonwebtoken';
import { IAdmin } from '../models/Admin';

/**
 * JWT Payload interface
 */
export interface IJWTPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token for admin
 */
export const generateToken = (admin: IAdmin): string => {
  const payload: IJWTPayload = {
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role
  };

  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, secret, { expiresIn } as any);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): IJWTPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, secret) as IJWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
