import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { validateRequest, registerSchema, loginSchema, refreshTokenSchema, ValidationError } from '../utils/validation';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authService = new AuthService();

type RegisterRequest = z.infer<typeof registerSchema>;
type LoginRequest = z.infer<typeof loginSchema>;
type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(registerSchema, req.body);

    const result = await authService.register(validated as RegisterRequest);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
      return;
    }

    res.status(400).json({
      error: {
        code: 'REGISTRATION_ERROR',
        message: error.message,
      },
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(loginSchema, req.body) as LoginRequest;

    const result = await authService.login(validated);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
      return;
    }

    const statusCode = error.message.includes('locked') ? 429 : 401;
    res.status(statusCode).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: error.message,
      },
    });
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(refreshTokenSchema, req.body) as RefreshTokenRequest;

    const result = authService.refreshAccessToken(validated.refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
      return;
    }

    res.status(401).json({
      error: {
        code: 'TOKEN_ERROR',
        message: error.message,
      },
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Token is cleared on client side
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      error: {
        code: 'LOGOUT_ERROR',
        message: error.message,
      },
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await authService.getUserById(userId);
    
    if (!user) {
      res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        height: user.height,
        currentWeight: user.currentWeight,
        activityLevel: user.activityLevel,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
