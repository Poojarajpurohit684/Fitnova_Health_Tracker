import { Goal, IGoal } from '../models/Goal';
import { BaseService } from './BaseService';

interface CreateGoalRequest {
  userId: string;
  goalType: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility';
  targetValue: number;
  initialValue?: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  description?: string;
}

export class GoalService extends BaseService<IGoal> {
  constructor() {
    super(Goal);
  }

  async createGoal(data: CreateGoalRequest): Promise<IGoal> {
    const initialValue = data.initialValue || data.currentValue;
    return await this.create({ 
      ...data, 
      initialValue,
      startDate: new Date(), 
      status: 'active' 
    });
  }

  async getGoals(userId: string, status?: string) {
    const filter: any = { userId };
    if (status) filter.status = status;
    const result = await this.getList(filter, 100, 0, { targetDate: 1 });
    return result.items;
  }

  async getGoalById(id: string, userId: string): Promise<IGoal | null> {
    return await this.getById(id, { userId });
  }

  async updateGoal(id: string, userId: string, data: Partial<CreateGoalRequest>): Promise<IGoal | null> {
    return await this.update(id, { userId }, data);
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    return await this.delete(id, { userId });
  }

  async getProgress(id: string, userId: string) {
    const goal = await this.getById(id, { userId });
    if (!goal) return null;

    const progress = Math.min(
      100,
      Math.round(((goal.currentValue - goal.targetValue) / Math.abs(goal.targetValue)) * 100)
    );

    const now = new Date();
    const daysRemaining = Math.ceil((goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return { progress: Math.max(0, progress), daysRemaining };
  }
}
