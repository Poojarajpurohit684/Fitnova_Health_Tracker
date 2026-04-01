import { AnalyticsService } from './AnalyticsService';
import { Workout } from '../models/Workout';
import { NutritionEntry } from '../models/NutritionEntry';
import { Goal } from '../models/Goal';
import mongoose from 'mongoose';

jest.mock('../models/Workout');
jest.mock('../models/NutritionEntry');
jest.mock('../models/Goal');

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const userId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    service = new AnalyticsService();
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard with calculated metrics', async () => {
      const mockWorkouts = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          exerciseType: 'running',
          duration: 30,
          intensity: 7,
          caloriesBurned: 300,
          createdAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          exerciseType: 'cycling',
          duration: 45,
          intensity: 6,
          caloriesBurned: 400,
          createdAt: new Date(),
        },
      ];

      const mockNutrition = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          foodName: 'Chicken',
          protein: 30,
          carbohydrates: 0,
          fats: 5,
          loggedAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          foodName: 'Rice',
          protein: 5,
          carbohydrates: 45,
          fats: 1,
          loggedAt: new Date(),
        },
      ];

      const mockGoals = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          goalType: 'weight_loss',
          currentValue: 75,
          targetValue: 70,
          status: 'active',
        },
      ];

      (Workout.find as jest.Mock).mockResolvedValue(mockWorkouts);
      (NutritionEntry.find as jest.Mock).mockResolvedValue(mockNutrition);
      (Goal.find as jest.Mock).mockResolvedValue(mockGoals);

      const result = await service.getDashboard(userId);

      expect(result.totalWorkouts).toBe(2);
      expect(result.totalCalories).toBe(700);
      expect(result.averageDuration).toBe(37.5);
      expect(result.macroBreakdown.protein).toBe(35);
      expect(result.macroBreakdown.carbohydrates).toBe(45);
      expect(result.macroBreakdown.fats).toBe(6);
      expect(result.goals).toHaveLength(1);
    });

    it('should calculate weekly trends correctly', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const mockWorkouts = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          exerciseType: 'running',
          duration: 30,
          intensity: 7,
          caloriesBurned: 300,
          createdAt: now,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          exerciseType: 'cycling',
          duration: 45,
          intensity: 6,
          caloriesBurned: 400,
          createdAt: yesterday,
        },
      ];

      (Workout.find as jest.Mock).mockResolvedValue(mockWorkouts);
      (NutritionEntry.find as jest.Mock).mockResolvedValue([]);
      (Goal.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboard(userId);

      expect(result.weeklyTrends).toBeDefined();
      expect(result.weeklyTrends.length).toBeGreaterThan(0);
    });

    it('should handle empty data gracefully', async () => {
      (Workout.find as jest.Mock).mockResolvedValue([]);
      (NutritionEntry.find as jest.Mock).mockResolvedValue([]);
      (Goal.find as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboard(userId);

      expect(result.totalWorkouts).toBe(0);
      expect(result.totalCalories).toBe(0);
      expect(result.averageDuration).toBe(0);
      expect(result.macroBreakdown.protein).toBe(0);
      expect(result.goals).toHaveLength(0);
    });

    it('should respect date range filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (Workout.find as jest.Mock).mockResolvedValue([]);
      (NutritionEntry.find as jest.Mock).mockResolvedValue([]);
      (Goal.find as jest.Mock).mockResolvedValue([]);

      await service.getDashboard(userId, startDate, endDate);

      expect(Workout.find).toHaveBeenCalledWith({
        userId,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      expect(NutritionEntry.find).toHaveBeenCalledWith({
        userId,
        loggedAt: { $gte: startDate, $lte: endDate },
      });
    });
  });
});
