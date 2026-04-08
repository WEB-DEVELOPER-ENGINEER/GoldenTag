import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { AppError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, 'NO_TOKEN', 'Authentication token is required');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError(401, 'INVALID_TOKEN_FORMAT', 'Token format must be: Bearer <token>');
    }

    const token = parts[1];

    try {
      const payload = verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new AppError(401, 'TOKEN_EXPIRED', 'Authentication token has expired');
      }
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid authentication token');
    }
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new AppError(403, 'FORBIDDEN', 'Admin access required'));
  }

  next();
};
