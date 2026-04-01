import request from 'supertest';
import express from 'express';
import analyticsRoutes from './analytics';
import { AnalyticsService } from '../services/AnalyticsService';
import mongoose from 'mongoose';

jest.mock('../services/AnalyticsService');

const mockUserId = new mongoose.Types.ObjectId().toString();

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = mockUserId;
    next();
  },
}));

describe('Analytics Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/analytics', analyticsRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/v1/analytics/dashboard', () => {
    it('should return dashboard data', async () => {
      const mockDashboard = {
        totalWorkouts: 5,
        totalCalories: 2500,
        averageDuration: 35,
        weeklyTrends: [
          { date: '2024-01-01', workouts: 1, calories: 300 },
          { date: '2024-01-02', workouts: 1, calories: 400 },
        ],
        macroBreakdown: {
          protein: 150,
          carbohydrates: 300,
          fats: 80,
        },
        goals: [
          { name: 'weight_loss', progress: 75, target: 70 },
        ],
      };

      (AnalyticsService.prototype.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);

      const response = await request(app).get('/api/v1/analytics/dashboard');

      expect(response.status).toBe(200);
      expect(response.body.totalWorkouts).toBe(5);
      expect(response.body.totalCalories).toBe(2500);
      expect(response.body.weeklyTrends).toHaveLength(2);
      expect(response.body.macroBreakdown.protein).toBe(150);
    });

    it('should accept date range parameters', async () => {
      const mockDashboard = {
        totalWorkouts: 2,
        totalCalories: 800,
        averageDuration: 40,
        weeklyTrends: [],
        macroBreakdown: { protein: 50, carbohydrates: 100, fats: 30 },
        goals: [],
      };

      (AnalyticsService.prototype.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);

      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .query({ startDate, endDate });

      expect(response.status).toBe(200);
      expect(AnalyticsService.prototype.getDashboard).toHaveBeenCalledWith(
        mockUserId,
        expect.any(Date),
        expect.any(Date)
      );
    });

    it('should handle service errors', async () => {
      (AnalyticsService.prototype.getDashboard as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/v1/analytics/dashboard');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('SERVER_ERROR');
    });

    it('should return empty data for new users', async () => {
      const mockDashboard = {
        totalWorkouts: 0,
        totalCalories: 0,
        averageDuration: 0,
        weeklyTrends: [],
        macroBreakdown: { protein: 0, carbohydrates: 0, fats: 0 },
        goals: [],
      };

      (AnalyticsService.prototype.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);

      const response = await request(app).get('/api/v1/analytics/dashboard');

      expect(response.status).toBe(200);
      expect(response.body.totalWorkouts).toBe(0);
      expect(response.body.totalCalories).toBe(0);
    });
  });
});
