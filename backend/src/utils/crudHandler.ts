import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export interface CrudHandlers {
  create: (userId: string, data: any) => Promise<any>;
  getList: (userId: string, limit: number, offset: number) => Promise<{ items: any[]; total: number }>;
  getById: (id: string, userId: string) => Promise<any | null>;
  update: (id: string, userId: string, data: any) => Promise<any | null>;
  delete: (id: string, userId: string) => Promise<boolean>;
}

export interface ValidationRules {
  create?: string[];
  update?: string[];
}

/**
 * createCrudRouter - Standardized Express Router Factory
 * 
 * Generates a consistent set of CRUD endpoints (GET, POST, PUT, DELETE)
 * for any service that implements the CrudHandlers interface.
 * Handles validation, authentication, and standardized error responses.
 */
export const createCrudRouter = (handlers: CrudHandlers, validation?: ValidationRules) => {
  const router = Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  const handleError = (res: Response, error: any, statusCode: number = 500) => {
    const code = statusCode === 400 ? 'VALIDATION_ERROR' : statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR';
    res.status(statusCode).json({ error: { code, message: error.message || 'An error occurred' } });
  };

  const validateRequired = (data: any, fields: string[]): string | null => {
    for (const field of fields) {
      if (data[field] === undefined || data[field] === null) {
        return `Missing required field: ${field}`;
      }
    }
    return null;
  };

  // POST - Create
  router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('🔍 POST / - Request received');
      console.log('🔍 POST / - req.userId:', req.userId);
      console.log('🔍 POST / - req.body:', JSON.stringify(req.body, null, 2));

      if (validation?.create) {
        const error = validateRequired(req.body, validation.create);
        if (error) {
          console.error('❌ Validation error:', error, 'Body:', req.body);
          handleError(res, { message: error }, 400);
          return;
        }
      }

      if (!req.userId) {
        handleError(res, { message: 'User ID not found in request' }, 400);
        return;
      }

      const item = await handlers.create(req.userId!, req.body);
      res.status(201).json(item);
    } catch (error: any) {
      handleError(res, error);
    }
  });

  // GET - List
  router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!req.userId) {
        handleError(res, { message: 'User ID not found in request' }, 400);
        return;
      }

      const result = await handlers.getList(req.userId!, limit, offset);
      res.status(200).json(result);
    } catch (error: any) {
      handleError(res, error);
    }
  });

  // GET - By ID
  router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const item = await handlers.getById(req.params.id, req.userId!);
      if (!item) {
        handleError(res, { message: 'Resource not found' }, 404);
        return;
      }
      res.status(200).json(item);
    } catch (error: any) {
      handleError(res, error);
    }
  });

  // PUT - Update
  router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const item = await handlers.update(req.params.id, req.userId!, req.body);
      if (!item) {
        handleError(res, { message: 'Resource not found' }, 404);
        return;
      }
      res.status(200).json(item);
    } catch (error: any) {
      handleError(res, error);
    }
  });

  // DELETE
  router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deleted = await handlers.delete(req.params.id, req.userId!);
      if (!deleted) {
        handleError(res, { message: 'Resource not found' }, 404);
        return;
      }
      res.status(200).json({ message: 'Resource deleted' });
    } catch (error: any) {
      handleError(res, error);
    }
  });

  return router;
};
