import { Workout } from '../models/Workout';
import { NutritionEntry } from '../models/NutritionEntry';
import { Goal } from '../models/Goal';
import mongoose from 'mongoose';

interface AnalyticsDashboard {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;
  averageDuration: number;
  weeklyTrends: Array<{ date: string; workouts: number; calories: number }>;
  macroBreakdown: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  goals: Array<{ name: string; progress: number; target: number }>;
}

export class AnalyticsService {
  async getDashboard(userId: string, startDate?: Date, endDate?: Date): Promise<AnalyticsDashboard> {
    try {
      // Convert userId string to ObjectId if needed
      let userObjectId: any = userId;
      if (typeof userId === 'string') {
        try {
          userObjectId = new mongoose.Types.ObjectId(userId);
        } catch (conversionError: any) {
          throw new Error(`Invalid userId format: ${userId}`);
        }
      }

      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate || new Date();

      // Get workouts
      const workouts = await Workout.find({
        userId: userObjectId,
        createdAt: { $gte: start, $lte: end },
      });

      // Get nutrition entries
      const nutritionEntries = await NutritionEntry.find({
        userId: userObjectId,
        loggedAt: { $gte: start, $lte: end },
      });

      // Get goals
      const goals = await Goal.find({
        userId: userObjectId,
        status: 'active',
      });

      // Calculate metrics
      const totalWorkouts = workouts.length;
      const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
      const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
      const averageDuration = totalWorkouts > 0 ? workouts.reduce((sum, w) => sum + w.duration, 0) / totalWorkouts : 0;

      // Calculate weekly trends
      const weeklyTrends = this.calculateWeeklyTrends(workouts, start, end);

      // Calculate macro breakdown
      const macroBreakdown = this.calculateMacroBreakdown(nutritionEntries);

      // Calculate goal progress
      const goalsData = goals.map((goal) => ({
        name: goal.goalType,
        progress: goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0,
        target: goal.targetValue,
      }));

      const result = {
        totalWorkouts,
        totalCalories,
        totalDuration,
        averageDuration: Math.round(averageDuration * 10) / 10,
        weeklyTrends,
        macroBreakdown,
        goals: goalsData,
      };
      return result;
    } catch (error: any) {
      throw error;
    }
  }

  private calculateWeeklyTrends(
    workouts: any[],
    startDate: Date,
    endDate: Date
  ): Array<{ date: string; workouts: number; calories: number }> {
    const trends: Record<string, { workouts: number; calories: number }> = {};

    // Initialize all days in range
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      trends[dateStr] = { workouts: 0, calories: 0 };
      current.setDate(current.getDate() + 1);
    }

    // Aggregate workouts by date
    workouts.forEach((workout) => {
      const dateStr = workout.createdAt.toISOString().split('T')[0];
      if (trends[dateStr]) {
        trends[dateStr].workouts += 1;
        trends[dateStr].calories += workout.caloriesBurned;
      }
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  private calculateMacroBreakdown(nutritionEntries: any[]): {
    protein: number;
    carbohydrates: number;
    fats: number;
  } {
    return {
      protein: Math.round(nutritionEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0)),
      carbohydrates: Math.round(nutritionEntries.reduce((sum, entry) => sum + (entry.carbohydrates || 0), 0)),
      fats: Math.round(nutritionEntries.reduce((sum, entry) => sum + (entry.fats || 0), 0)),
    };
  }
}
