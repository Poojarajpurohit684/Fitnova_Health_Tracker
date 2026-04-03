import { GoalService } from '../services/GoalService';
import { AuthRequest } from '../middleware/auth';
import { createCrudRouter } from '../utils/crudHandler';
import { Response } from 'express';

const goalService = new GoalService();

const router = createCrudRouter(
  {
    create: (userId, data) => goalService.createGoal({ ...data, userId }),
    getList: (userId, _limit, _offset) => {
      // Note: status filter is handled in the custom GET route below
      return goalService.getGoals(userId).then(goals => ({ items: goals, total: goals.length }));
    },
    getById: (id, userId) => goalService.getGoalById(id, userId),
    update: (id, userId, data) => goalService.updateGoal(id, userId, data),
    delete: (id, userId) => goalService.deleteGoal(id, userId),
  },
  { create: ['goalType', 'targetValue', 'unit', 'targetDate'] }
);
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'User ID not found in request' } });
      return;
    }

    const status = req.query.status as string | undefined;
    const goals = await goalService.getGoals(req.userId, status);
    res.status(200).json({ items: goals, total: goals.length });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET progress
router.get('/:id/progress', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await goalService.getProgress(req.params.id, req.userId!);
    if (!progress) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Goal not found' } });
      return;
    }
    res.status(200).json(progress);
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
