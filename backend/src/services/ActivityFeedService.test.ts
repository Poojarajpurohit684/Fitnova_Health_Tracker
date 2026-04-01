import { ActivityFeedService } from './ActivityFeedService';
import { ActivityFeed } from '../models/ActivityFeed';
import { Connection } from '../models/Connection';
import mongoose from 'mongoose';

jest.mock('../models/ActivityFeed');
jest.mock('../models/Connection');

describe('ActivityFeedService', () => {
  let service: ActivityFeedService;
  const userId = new mongoose.Types.ObjectId().toString();
  const connectedUserId = new mongoose.Types.ObjectId().toString();
  const activityId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    service = new ActivityFeedService();
    jest.clearAllMocks();
  });

  describe('createActivity', () => {
    it('should create an activity with default visibility', async () => {
      const activityData = {
        userId,
        activityType: 'workout' as const,
        relatedEntityId: new mongoose.Types.ObjectId().toString(),
        relatedEntityType: 'Workout',
        description: 'Logged a running workout',
      };

      const mockActivity = {
        ...activityData,
        visibility: 'connections',
        save: jest.fn().mockResolvedValue({ ...activityData, visibility: 'connections' }),
      };

      (ActivityFeed as unknown as jest.Mock).mockImplementation(() => mockActivity);

      const result = await service.createActivity(activityData);

      expect(result.visibility).toBe('connections');
      expect(mockActivity.save).toHaveBeenCalled();
    });

    it('should create an activity with custom visibility', async () => {
      const activityData = {
        userId,
        activityType: 'goal_achieved' as const,
        relatedEntityId: new mongoose.Types.ObjectId().toString(),
        relatedEntityType: 'Goal',
        description: 'Achieved weight loss goal',
        visibility: 'public' as const,
      };

      const mockActivity = {
        ...activityData,
        save: jest.fn().mockResolvedValue(activityData),
      };

      (ActivityFeed as unknown as jest.Mock).mockImplementation(() => mockActivity);

      const result = await service.createActivity(activityData);

      expect(result.visibility).toBe('public');
    });
  });

  describe('getActivityFeed', () => {
    it('should return activities from connections', async () => {
      const mockConnections = [
        {
          userId,
          connectedUserId,
          status: 'accepted',
        },
      ];

      const mockActivities = [
        {
          _id: activityId,
          userId: connectedUserId,
          description: 'Logged a workout',
          visibility: 'connections',
          createdAt: new Date(),
        },
      ];

      (Connection.find as jest.Mock).mockResolvedValue(mockConnections);
      (ActivityFeed.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockActivities),
      });
      (ActivityFeed.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await service.getActivityFeed(userId, 20, 0);

      expect(result.activities).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should include user own activities', async () => {
      const mockConnections: any[] = [];

      const mockActivities = [
        {
          _id: activityId,
          userId,
          description: 'My workout',
          visibility: 'public',
          createdAt: new Date(),
        },
      ];

      (Connection.find as jest.Mock).mockResolvedValue(mockConnections);
      (ActivityFeed.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockActivities),
      });
      (ActivityFeed.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await service.getActivityFeed(userId, 20, 0);

      expect(result.activities).toHaveLength(1);
    });
  });

  describe('deleteActivity', () => {
    it('should delete an activity', async () => {
      (ActivityFeed.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteActivity(activityId, userId);

      expect(result).toBe(true);
      expect(ActivityFeed.deleteOne).toHaveBeenCalledWith({ _id: activityId, userId });
    });

    it('should return false if activity not found', async () => {
      (ActivityFeed.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await service.deleteActivity(activityId, userId);

      expect(result).toBe(false);
    });
  });
});
