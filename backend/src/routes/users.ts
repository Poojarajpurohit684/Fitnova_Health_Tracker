import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { validateRequest, ValidationError } from '../utils/validation';

const router = Router();

const searchQuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  excludeUserId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

type SearchQuery = z.infer<typeof searchQuerySchema>;

router.use(authMiddleware);

// GET /api/v1/users/search
router.get('/search', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = validateRequest(searchQuerySchema, req.query) as SearchQuery;

    const safeQuery = validated.query.trim();
    if (!safeQuery) {
      res.status(200).json({ users: [] });
      return;
    }

    const excludeId = validated.excludeUserId || req.userId!;
    const regex = new RegExp(safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const users = await User.find(
      {
        _id: { $ne: excludeId },
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        isActive: true,
        deletedAt: { $exists: false },
      },
      {
        passwordHash: 0,
      }
    )
      .limit(validated.limit)
      .lean();

    res.status(200).json({
      users: users.map((u: any) => ({
        _id: u._id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        profilePicture: u.profilePicture,
        bio: u.bio,
        currentWeight: u.currentWeight,
        targetWeight: u.targetWeight,
      })),
    });
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

    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
