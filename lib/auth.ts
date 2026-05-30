import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface JwtPayload {
  userId: string;
  email: string;
  shopId: string;
  role: string;
  exp?: number;
}

export function generateToken(payload: Omit<JwtPayload, 'exp'>, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    // 1. Try to verify using jsonwebtoken (works in Node.js runtime / API routes)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (e: any) {
      // If it's a verification error (like expired or invalid signature), propagate it
      if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
        return null;
      }
      // If it's a runtime error (like crypto not found in Edge), fall back to manual decoding
    }

    // 2. Fallback for Edge Runtime (middleware)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64] = parts;
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr) as JwtPayload;

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

export function extractAuthFromRequest(request: NextRequest): JwtPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}
