import { NutritionService } from '../services/NutritionService';
import { AuthRequest } from '../middleware/auth';
import { createCrudRouter } from '../utils/crudHandler';
import { Response } from 'express';

const nutritionService = new NutritionService();

const router = createCrudRouter(
  {
    create: (userId, data) => {
      const now = new Date();
      if (new Date(data.loggedAt) > now) {
        throw new Error("Future date not allowed");
      }
      return nutritionService.createEntry({ ...data, userId });
    },
    getList: (userId, limit, offset) => {
      return nutritionService
        .getEntries(userId, limit, offset)
        .then(r => ({
          items: r.entries,
          total: r.total
        }));
    },
    getById: (id, userId) => nutritionService.getEntryById(id, userId),
    update: (id, userId, data) => nutritionService.updateEntry(id, userId, data),
    delete: (id, userId) => nutritionService.deleteEntry(id, userId),
  },
  { create: ['foodName', 'quantity', 'unit', 'calories', 'protein', 'carbohydrates', 'fats', 'mealType', 'loggedAt'] }
);

// GET /api/v1/nutrition/search
router.get('/search', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = (req.query.query as string | undefined)?.trim() || '';
    if (!query) {
      res.status(200).json({ items: [] });
      return;
    }

    const items = await nutritionService.searchFoods(req.userId!, query);
    res.status(200).json({ items });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /api/v1/nutrition/stats/summary
router.get('/stats/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const summary = await nutritionService.getSummary(req.userId!, startDate, endDate);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET daily totals
router.get('/daily/totals', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const totals = await nutritionService.getDailyTotals(req.userId!, date);
    res.status(200).json(totals);
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /api/v1/nutrition/daily/entries
router.get('/daily/entries', async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const date = req.query.date ? new Date(req.query.date as string) : new Date();

    const entries = await nutritionService.getEntriesByDate(
      req.userId!,
      date
    );

    res.status(200).json({
      items: entries,
      total: entries.length
    });

  } catch (error: any) {
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
