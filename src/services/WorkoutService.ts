import { Workout, IWorkout } from '../models/Workout';
import { ActivityFeed } from '../models/ActivityFeed';
import { BaseService } from './BaseService';

interface CreateWorkoutRequest {
  userId: string;
  exerciseType: string;
  duration: number;
  intensity: number;
  notes?: string;
  startTime: Date;
  endTime: Date;
  distance?: number;
  sets?: number;
  reps?: number;
  weight?: number;
}

export class WorkoutService extends BaseService<IWorkout> {
  constructor() {
    super(Workout);
  }

  async createWorkout(data: CreateWorkoutRequest): Promise<IWorkout> {
    const caloriesBurned = this.calculateCalories(data.exerciseType, data.duration, data.intensity);
    const savedWorkout = await this.create({ ...data, caloriesBurned });

    await ActivityFeed.create({
      userId: data.userId,
      activityType: 'workout',
      relatedEntityId: savedWorkout._id,
      relatedEntityType: 'Workout',
      description: `Logged a ${data.exerciseType} workout for ${data.duration} minutes`,
      visibility: 'connections',
    });

    return savedWorkout;
  }

  async getWorkouts(userId: string, limit: number = 10, offset: number = 0) {
    const result = await this.getList({ userId }, limit, offset);
    return { workouts: result.items, total: result.total };
  }

  async getWorkoutById(id: string, userId: string): Promise<IWorkout | null> {
    return await this.getById(id, { userId });
  }

  async updateWorkout(id: string, userId: string, data: Partial<CreateWorkoutRequest>): Promise<IWorkout | null> {
    const updateData: any = { ...data };
    if (data.exerciseType || data.duration || data.intensity) {
      updateData.caloriesBurned = this.calculateCalories(
        data.exerciseType || '',
        data.duration || 0,
        data.intensity || 0
      );
    }
    return await this.update(id, { userId }, updateData);
  }

  async deleteWorkout(id: string, userId: string): Promise<boolean> {
    return await this.delete(id, { userId });
  }

  private calculateCalories(exerciseType: string, duration: number, intensity: number): number {
    const baseCalories: Record<string, number> = {
      running: 10,
      cycling: 8,
      swimming: 11,
      weightlifting: 6,
      yoga: 3,
      walking: 4,
      hiit: 12,
    };
    const base = baseCalories[exerciseType.toLowerCase()] || 5;
    return Math.round(base * duration * (intensity / 5));
  }
}
