import { NutritionEntry, INutritionEntry } from '../models/NutritionEntry';
import { BaseService } from './BaseService';

interface CreateNutritionRequest {
  userId: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: Date;
}

export class NutritionService extends BaseService<INutritionEntry> {
  constructor() {
    super(NutritionEntry);
  }

  async createEntry(data: CreateNutritionRequest): Promise<INutritionEntry> {
    return await this.create(data);
  }

  // async getEntries(userId: string, limit: number = 10, offset: number = 0) {
  //   const result = await this.getList({ userId }, limit, offset, { loggedAt: -1 });
  //   return { entries: result.items, total: result.total };
  // }

async getEntries(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  date?: Date
) {

  const filter: any = { userId };

  if (date) {

    const start = new Date(date);
    start.setHours(0,0,0,0);

    const end = new Date(date);
    end.setHours(23,59,59,999);

    filter.loggedAt = {
      $gte: start,
      $lte: end
    };

  }

  const result = await this.getList(
    filter,
    limit,
    offset,
    { loggedAt: -1 }
  );

  return {
    entries: result.items,
    total: result.total
  };

}

  async getEntryById(id: string, userId: string): Promise<INutritionEntry | null> {
    return await this.getById(id, { userId });
  }

  async updateEntry(id: string, userId: string, data: Partial<CreateNutritionRequest>): Promise<INutritionEntry | null> {
    return await this.update(id, { userId }, data);
  }

  async deleteEntry(id: string, userId: string): Promise<boolean> {
    return await this.delete(id, { userId });
  }

  async getDailyTotals(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await this.model.find({
      userId,
      loggedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    return {
      calories: entries.reduce((sum, e) => sum + e.calories, 0),
      protein: entries.reduce((sum, e) => sum + e.protein, 0),
      carbohydrates: entries.reduce((sum, e) => sum + e.carbohydrates, 0),
      fats: entries.reduce((sum, e) => sum + e.fats, 0),
    };
  }

  async searchFoods(userId: string, query: string, limit: number = 20) {
    const q = query.trim();
    if (!q) return [];

    const entries = await this.model
      .find(
        {
          userId,
          foodName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        },
        {
          foodName: 1,
          unit: 1,
          calories: 1,
          protein: 1,
          carbohydrates: 1,
          fats: 1,
          createdAt: 1,
          loggedAt: 1,
        }
      )
      .sort({ loggedAt: -1 })
      .limit(limit)
      .lean();

    const seen = new Set<string>();
    const results: any[] = [];
    for (const e of entries) {
      const key = (e.foodName || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      results.push(e);
    }

    return results;
  }

  async getSummary(userId: string, startDate?: Date, endDate?: Date) {
    const match: any = { userId };
    if (startDate || endDate) {
      match.loggedAt = {};
      if (startDate) match.loggedAt.$gte = startDate;
      if (endDate) match.loggedAt.$lte = endDate;
    }

    const entries = await this.model.find(match).lean();
    const totals = entries.reduce(
      (acc, e) => {
        acc.calories += e.calories || 0;
        acc.protein += e.protein || 0;
        acc.carbohydrates += e.carbohydrates || 0;
        acc.fats += e.fats || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fats: 0 }
    );

    return {
      totalEntries: entries.length,
      totals,
    };
  }

  async getEntriesByDate(userId: string, date: Date) {

  const startOfDay = new Date(date);
  startOfDay.setHours(0,0,0,0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23,59,59,999);

  return await NutritionEntry.find({
    userId,
    loggedAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ loggedAt: -1 });

}
}
