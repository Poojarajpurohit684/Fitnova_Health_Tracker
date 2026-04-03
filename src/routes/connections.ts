import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { ConnectionService } from '../services/ConnectionService';
import { validateRequest, ValidationError } from '../utils/validation';
import { z } from 'zod';

const router = Router();
const connectionService = new ConnectionService();

// Validation schemas
const sendRequestSchema = z.object({
  connectedUserId: z.string().min(1, 'Connected user ID is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'blocked']),
});

const listQuerySchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'blocked']).optional(),
  limit: z.coerce.number().int().positive().default(10),
  offset: z.coerce.number().int().nonnegative().default(0),
});

type SendRequestBody = z.infer<typeof sendRequestSchema>;
type UpdateStatusBody = z.infer<typeof updateStatusSchema>;
type ListQuery = z.infer<typeof listQuerySchema>;

// POST /api/v1/connections/request - Send connection request
router.post('/request', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(sendRequestSchema, req.body) as SendRequestBody;

    const connection = await connectionService.sendConnectionRequest(req.userId!, validated.connectedUserId);
    res.status(201).json(connection);
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

    const statusCode = error.message.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({
      error: {
        code: 'CONNECTION_ERROR',
        message: error.message,
      },
    });
  }
});

// GET /api/v1/connections - List connections
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(listQuerySchema, req.query) as ListQuery;

    const result = await connectionService.listConnections(
      req.userId!,
      validated.status,
      validated.limit,
      validated.offset
    );

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

    res.status(400).json({
      error: {
        code: 'LIST_ERROR',
        message: error.message,
      },
    });
  }
});

// PUT /api/v1/connections/:id - Accept/reject connection
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(updateStatusSchema, req.body) as UpdateStatusBody;

    const connection = await connectionService.updateConnectionStatus(req.params.id, req.userId!, validated.status);
    res.status(200).json(connection);
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

    const statusCode = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      error: {
        code: 'UPDATE_ERROR',
        message: error.message,
      },
    });
  }
});

// DELETE /api/v1/connections/:id - Remove connection
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await connectionService.removeConnection(req.params.id, req.userId!);
    res.status(200).json({
      message: 'Connection removed successfully',
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      error: {
        code: 'DELETE_ERROR',
        message: error.message,
      },
    });
  }
});

export default router;
