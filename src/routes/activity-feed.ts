import { Router } from 'express';
import { ActivityFeedService } from '../services/ActivityFeedService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const activityFeedService = new ActivityFeedService();

router.use(authMiddleware);

// GET /api/v1/activity-feed
router.get('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await activityFeedService.getActivityFeed(req.userId!, limit, offset);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// DELETE /api/v1/activity-feed/:id
router.delete('/:id', async (req: AuthRequest, res): Promise<void> => {
  try {
    const deleted = await activityFeedService.deleteActivity(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Activity not found' } });
      return;
    }
    res.status(200).json({ message: 'Activity deleted' });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
