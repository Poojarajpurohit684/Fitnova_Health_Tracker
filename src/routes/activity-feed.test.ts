import request from 'supertest';
import express from 'express';
import activityFeedRoutes from './activity-feed';
import { ActivityFeedService } from '../services/ActivityFeedService';
import mongoose from 'mongoose';

jest.mock('../services/ActivityFeedService');

const mockUserId = new mongoose.Types.ObjectId().toString();

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = mockUserId;
    next();
  },
}));

describe('Activity Feed Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/activity-feed', activityFeedRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/v1/activity-feed', () => {
    it('should return activity feed with pagination', async () => {
      const mockActivities = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId: mockUserId,
          description: 'Logged a workout',
          visibility: 'connections',
          createdAt: new Date(),
        },
      ];

      (ActivityFeedService.prototype.getActivityFeed as jest.Mock).mockResolvedValue({
        activities: mockActivities,
        total: 1,
      });

      const response = await request(app)
        .get('/api/v1/activity-feed')
        .query({ limit: 20, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.activities).toHaveLength(1);
      expect(response.body.total).toBe(1);
    });

    it('should use default pagination values', async () => {
      (ActivityFeedService.prototype.getActivityFeed as jest.Mock).mockResolvedValue({
        activities: [],
        total: 0,
      });

      const response = await request(app).get('/api/v1/activity-feed');

      expect(response.status).toBe(200);
      expect(ActivityFeedService.prototype.getActivityFeed).toHaveBeenCalledWith(mockUserId, 20, 0);
    });

    it('should handle service errors', async () => {
      (ActivityFeedService.prototype.getActivityFeed as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).get('/api/v1/activity-feed');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('DELETE /api/v1/activity-feed/:id', () => {
    it('should delete an activity', async () => {
      const activityId = new mongoose.Types.ObjectId().toString();

      (ActivityFeedService.prototype.deleteActivity as jest.Mock).mockResolvedValue(true);

      const response = await request(app).delete(`/api/v1/activity-feed/${activityId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Activity deleted');
    });

    it('should return 404 if activity not found', async () => {
      const activityId = new mongoose.Types.ObjectId().toString();

      (ActivityFeedService.prototype.deleteActivity as jest.Mock).mockResolvedValue(false);

      const response = await request(app).delete(`/api/v1/activity-feed/${activityId}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle service errors', async () => {
      const activityId = new mongoose.Types.ObjectId().toString();

      (ActivityFeedService.prototype.deleteActivity as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app).delete(`/api/v1/activity-feed/${activityId}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('SERVER_ERROR');
    });
  });
});
