import { GoalService } from './GoalService';
import { Goal } from '../models/Goal';
import mongoose from 'mongoose';

// Mock the model
jest.mock('../models/Goal');

describe('GoalService', () => {
  let goalService: GoalService;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockGoalId = new mongoose.Types.ObjectId().toString();

  const mockGoal = {
    _id: mockGoalId,
    userId: mockUserId,
    goalType: 'weight_loss' as const,
    targetValue: 75,
    currentValue: 85,
    unit: 'kg',
    targetDate: new Date('2024-06-15'),
    startDate: new Date('2024-01-15'),
    status: 'active' as const,
    description: 'Lose 10kg by summer',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    goalService = new GoalService();
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('should create a goal with active status', async () => {
      const createData = {
        userId: mockUserId,
        goalType: 'weight_loss' as const,
        targetValue: 75,
        currentValue: 85,
        unit: 'kg',
        targetDate: new Date('2024-06-15'),
        description: 'Lose 10kg by summer',
      };

      (Goal as any).mockImplementation(() => ({
        ...mockGoal,
        save: jest.fn().mockResolvedValue(mockGoal),
      }));

      const result = await goalService.createGoal(createData);

      expect(result.goalType).toBe('weight_loss');
      expect(result.status).toBe('active');
      expect(result.targetValue).toBe(75);
      expect(result.currentValue).toBe(85);
    });

    it('should set start date to current date on creation', async () => {
      const createData = {
        userId: mockUserId,
        goalType: 'muscle_gain' as const,
        targetValue: 90,
        currentValue: 80,
        unit: 'kg',
        targetDate: new Date('2024-12-31'),
      };

      const goalWithStartDate = {
        ...mockGoal,
        goalType: 'muscle_gain',
        targetValue: 90,
        currentValue: 80,
        startDate: expect.any(Date),
      };

      (Goal as any).mockImplementation(() => ({
        ...goalWithStartDate,
        save: jest.fn().mockResolvedValue(goalWithStartDate),
      }));

      const result = await goalService.createGoal(createData);

      expect(result.startDate).toBeDefined();
    });

    it('should support different goal types', async () => {
      const goalTypes: Array<'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility'> = [
        'weight_loss',
        'muscle_gain',
        'endurance',
        'strength',
        'flexibility',
      ];

      for (const goalType of goalTypes) {
        const createData = {
          userId: mockUserId,
          goalType,
          targetValue: 100,
          currentValue: 50,
          unit: 'units',
          targetDate: new Date('2024-12-31'),
        };

        (Goal as any).mockImplementation(() => ({
          ...mockGoal,
          goalType,
          save: jest.fn().mockResolvedValue({ ...mockGoal, goalType }),
        }));

        const result = await goalService.createGoal(createData);
        expect(result.goalType).toBe(goalType);
      }
    });
  });

  describe('getGoals', () => {
    it('should retrieve all goals for a user', async () => {
      const mockGoals = [mockGoal, { ...mockGoal, _id: new mongoose.Types.ObjectId() }];

      (Goal.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockGoals),
      });

      const result = await goalService.getGoals(mockUserId);

      expect(result).toHaveLength(2);
      expect(Goal.find).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should filter goals by status', async () => {
      const activeGoals = [mockGoal];

      (Goal.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(activeGoals),
      });

      const result = await goalService.getGoals(mockUserId, 'active');

      expect(result).toHaveLength(1);
      expect(Goal.find).toHaveBeenCalledWith({ userId: mockUserId, status: 'active' });
    });

    it('should sort goals by target date ascending', async () => {
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockResolvedValue([]);

      (Goal.find as jest.Mock).mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        skip: skipMock,
      });

      await goalService.getGoals(mockUserId);

      expect(sortMock).toHaveBeenCalledWith({ targetDate: 1 });
    });

    it('should return empty array when no goals exist', async () => {
      (Goal.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([]),
      });

      const result = await goalService.getGoals(mockUserId);

      expect(result).toEqual([]);
    });

    it('should filter by different status values', async () => {
      const statuses = ['active', 'completed', 'abandoned'];

      for (const status of statuses) {
        (Goal.find as jest.Mock).mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockResolvedValue([]),
        });

        await goalService.getGoals(mockUserId, status);

        expect(Goal.find).toHaveBeenCalledWith({ userId: mockUserId, status });
      }
    });
  });

  describe('getGoalById', () => {
    it('should retrieve a specific goal by id and userId', async () => {
      (Goal.findOne as jest.Mock).mockResolvedValue(mockGoal);

      const result = await goalService.getGoalById(mockGoalId, mockUserId);

      expect(result).toEqual(mockGoal);
      expect(Goal.findOne).toHaveBeenCalledWith({ _id: mockGoalId, userId: mockUserId });
    });

    it('should return null if goal not found', async () => {
      (Goal.findOne as jest.Mock).mockResolvedValue(null);

      const result = await goalService.getGoalById(mockGoalId, mockUserId);

      expect(result).toBeNull();
    });

    it('should not retrieve goal if userId does not match', async () => {
      (Goal.findOne as jest.Mock).mockResolvedValue(null);

      const differentUserId = new mongoose.Types.ObjectId().toString();
      const result = await goalService.getGoalById(mockGoalId, differentUserId);

      expect(result).toBeNull();
    });
  });

  describe('updateGoal', () => {
    it('should update goal with new values', async () => {
      const updateData = {
        targetValue: 70,
        description: 'Updated goal',
      };

      const updatedGoal = {
        ...mockGoal,
        ...updateData,
      };

      (Goal.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedGoal);

      const result = await goalService.updateGoal(mockGoalId, mockUserId, updateData);

      expect(result?.targetValue).toBe(70);
      expect(result?.description).toBe('Updated goal');
    });

    it('should update goal status', async () => {
      const updateData: Partial<any> = {
        status: 'completed' as const,
      };

      const updatedGoal = {
        ...mockGoal,
        status: 'completed',
      };

      (Goal.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedGoal);

      const result = await goalService.updateGoal(mockGoalId, mockUserId, updateData);

      expect(result?.status).toBe('completed');
    });

    it('should return null if goal not found for update', async () => {
      (Goal.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await goalService.updateGoal(mockGoalId, mockUserId, { targetValue: 70 });

      expect(result).toBeNull();
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal and return true on success', async () => {
      (Goal.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await goalService.deleteGoal(mockGoalId, mockUserId);

      expect(result).toBe(true);
      expect(Goal.deleteOne).toHaveBeenCalledWith({ _id: mockGoalId, userId: mockUserId });
    });

    it('should return false if goal not found for deletion', async () => {
      (Goal.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await goalService.deleteGoal(mockGoalId, mockUserId);

      expect(result).toBe(false);
    });

    it('should only delete goals belonging to the user', async () => {
      (Goal.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const differentUserId = new mongoose.Types.ObjectId().toString();
      await goalService.deleteGoal(mockGoalId, differentUserId);

      expect(Goal.deleteOne).toHaveBeenCalledWith({ _id: mockGoalId, userId: differentUserId });
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage correctly', async () => {
      const goal = {
        ...mockGoal,
        targetValue: 75,
        currentValue: 85,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Progress = ((85 - 75) / |75|) * 100 = (10 / 75) * 100 = 13.33%
      expect(result?.progress).toBe(13);
    });

    it('should cap progress at 100%', async () => {
      const goal = {
        ...mockGoal,
        targetValue: 75,
        currentValue: 100,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result?.progress).toBeLessThanOrEqual(100);
    });

    it('should ensure progress is not negative', async () => {
      const goal = {
        ...mockGoal,
        targetValue: 75,
        currentValue: 50,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result?.progress).toBeGreaterThanOrEqual(0);
    });

    it('should calculate days remaining until target date', async () => {
      const now = new Date();
      const targetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const goal = {
        ...mockGoal,
        targetDate,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result?.daysRemaining).toBeGreaterThanOrEqual(6);
      expect(result?.daysRemaining).toBeLessThanOrEqual(7);
    });

    it('should return negative days remaining if deadline has passed', async () => {
      const now = new Date();
      const targetDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const goal = {
        ...mockGoal,
        targetDate,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result?.daysRemaining).toBeLessThan(0);
    });

    it('should return null if goal not found', async () => {
      (Goal.findOne as jest.Mock).mockResolvedValue(null);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result).toBeNull();
    });

    it('should handle weight loss goal progress calculation', async () => {
      const goal = {
        ...mockGoal,
        goalType: 'weight_loss' as const,
        targetValue: 75,
        currentValue: 80,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Progress = ((80 - 75) / |75|) * 100 = (5 / 75) * 100 = 6.67%, rounded = 7
      expect(result?.progress).toBe(7);
    });

    it('should handle muscle gain goal progress calculation', async () => {
      const goal = {
        ...mockGoal,
        goalType: 'muscle_gain' as const,
        targetValue: 90,
        currentValue: 80,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Progress = ((80 - 90) / |90|) * 100 = (-10 / 90) * 100 = -11.11%, capped at 0
      expect(result?.progress).toBe(0);
    });

    it('should handle endurance goal progress calculation', async () => {
      const goal = {
        ...mockGoal,
        goalType: 'endurance' as const,
        targetValue: 100,
        currentValue: 75,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Progress = ((75 - 100) / |100|) * 100 = (-25 / 100) * 100 = -25%, capped at 0
      expect(result?.progress).toBe(0);
    });
  });

  describe('Progress Calculation Edge Cases', () => {
    it('should handle zero target value', async () => {
      const goal = {
        ...mockGoal,
        targetValue: 0,
        currentValue: 10,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Should handle division by zero gracefully
      expect(result).toBeDefined();
    });

    it('should handle very large progress values', async () => {
      const goal = {
        ...mockGoal,
        targetValue: 1,
        currentValue: 1000,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Progress should be capped at 100
      expect(result?.progress).toBeLessThanOrEqual(100);
    });

    it('should handle negative target values', async () => {
      const goal = {
        ...mockGoal,
        targetValue: -50,
        currentValue: -30,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result?.progress).toBeGreaterThanOrEqual(0);
      expect(result?.progress).toBeLessThanOrEqual(100);
    });

    it('should handle same current and target values', async () => {
      const goal = {
        ...mockGoal,
        targetValue: 75,
        currentValue: 75,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      // Progress = ((75 - 75) / |75|) * 100 = 0
      expect(result?.progress).toBe(0);
    });

    it('should calculate days remaining accurately', async () => {
      const now = new Date();
      const targetDate = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000); // 3.5 days

      const goal = {
        ...mockGoal,
        targetDate,
      };

      (Goal.findOne as jest.Mock).mockResolvedValue(goal);

      const result = await goalService.getProgress(mockGoalId, mockUserId);

      expect(result?.daysRemaining).toBe(4);
    });
  });
});
