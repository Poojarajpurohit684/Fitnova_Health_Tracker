import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

const authService = new AuthService();

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = authService.verifyToken(token);

      req.userId = decoded.userId;
      req.email = decoded.email;

      next();
    } catch (verifyError: any) {
      throw verifyError;
    }
  } catch (error: any) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      },
    });
  }
};
