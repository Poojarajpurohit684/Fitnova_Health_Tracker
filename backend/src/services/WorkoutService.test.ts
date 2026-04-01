import { WorkoutService } from './WorkoutService';
import { Workout } from '../models/Workout';
import { ActivityFeed } from '../models/ActivityFeed';
import mongoose from 'mongoose';

// Mock the models
jest.mock('../models/Workout');
jest.mock('../models/ActivityFeed');

describe('WorkoutService', () => {
  let workoutService: WorkoutService;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockWorkoutId = new mongoose.Types.ObjectId().toString();

  const mockWorkout = {
    _id: mockWorkoutId,
    userId: mockUserId,
    exerciseType: 'running',
    duration: 30,
    intensity: 7,
    caloriesBurned: 420,
    notes: 'Morning run',
    startTime: new Date('2024-01-15T06:00:00'),
    endTime: new Date('2024-01-15T06:30:00'),
    distance: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    workoutService = new WorkoutService();
    jest.clearAllMocks();
  });

  describe('createWorkout', () => {
    it('should create a workout with calculated calories', async () => {
      const createData = {
        userId: mockUserId,
        exerciseType: 'running',
        duration: 30,
        intensity: 7,
        notes: 'Morning run',
        startTime: new Date('2024-01-15T06:00:00'),
        endTime: new Date('2024-01-15T06:30:00'),
        distance: 5,
      };

      (Workout as any).mockImplementation(() => ({
        ...mockWorkout,
        save: jest.fn().mockResolvedValue(mockWorkout),
      }));

      (ActivityFeed.create as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
      });

      const result = await workoutService.createWorkout(createData);

      expect(result.userId).toBe(mockUserId);
      expect(result.exerciseType).toBe('running');
      expect(result.duration).toBe(30);
      expect(result.caloriesBurned).toBeGreaterThan(0);
      expect(ActivityFeed.create).toHaveBeenCalled();
    });

    it('should calculate calories based on exercise type, duration, and intensity', async () => {
      const createData = {
        userId: mockUserId,
        exerciseType: 'cycling',
        duration: 60,
        intensity: 8,
        notes: '',
        startTime: new Date(),
        endTime: new Date(),
      };

      (Workout as any).mockImplementation(() => ({
        ...mockWorkout,
        exerciseType: 'cycling',
        duration: 60,
        intensity: 8,
        save: jest.fn().mockResolvedValue({
          ...mockWorkout,
          exerciseType: 'cycling',
          duration: 60,
          intensity: 8,
          caloriesBurned: 384, // 8 * 60 * (8/5) = 384
        }),
      }));

      (ActivityFeed.create as jest.Mock).mockResolvedValue({});

      const result = await workoutService.createWorkout(createData);

      expect(result.caloriesBurned).toBe(384);
    });

    it('should create activity feed entry on workout creation', async () => {
      const createData = {
        userId: mockUserId,
        exerciseType: 'swimming',
        duration: 45,
        intensity: 6,
        notes: '',
        startTime: new Date(),
        endTime: new Date(),
      };

      (Workout as any).mockImplementation(() => ({
        ...mockWorkout,
        save: jest.fn().mockResolvedValue(mockWorkout),
      }));

      (ActivityFeed.create as jest.Mock).mockResolvedValue({});

      await workoutService.createWorkout(createData);

      expect(ActivityFeed.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          activityType: 'workout',
          relatedEntityType: 'Workout',
          visibility: 'connections',
        })
      );
    });

    it('should handle different exercise types with correct calorie calculations', async () => {
      const exerciseTypes = [
        { type: 'running', base: 10 },
        { type: 'cycling', base: 8 },
        { type: 'swimming', base: 11 },
        { type: 'weightlifting', base: 6 },
        { type: 'yoga', base: 3 },
      ];

      for (const exercise of exerciseTypes) {
        const createData = {
          userId: mockUserId,
          exerciseType: exercise.type,
          duration: 30,
          intensity: 5,
          notes: '',
          startTime: new Date(),
          endTime: new Date(),
        };

        const expectedCalories = Math.round(exercise.base * 30 * (5 / 5));

        (Workout as any).mockImplementation(() => ({
          ...mockWorkout,
          exerciseType: exercise.type,
          caloriesBurned: expectedCalories,
          save: jest.fn().mockResolvedValue({
            ...mockWorkout,
            exerciseType: exercise.type,
            caloriesBurned: expectedCalories,
          }),
        }));

        (ActivityFeed.create as jest.Mock).mockResolvedValue({});

        const result = await workoutService.createWorkout(createData);
        expect(result.caloriesBurned).toBe(expectedCalories);
      }
    });
  });

  describe('getWorkouts', () => {
    it('should retrieve workouts for a user with pagination', async () => {
      const mockWorkouts = [mockWorkout, { ...mockWorkout, _id: new mongoose.Types.ObjectId() }];

      (Workout.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockWorkouts),
          }),
        }),
      });

      (Workout.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await workoutService.getWorkouts(mockUserId, 10, 0);

      expect(result.workouts).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(Workout.find).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should sort workouts by creation date descending', async () => {
      const sortMock = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue([]),
        }),
      });

      (Workout.find as jest.Mock).mockReturnValue({
        sort: sortMock,
      });

      (Workout.countDocuments as jest.Mock).mockResolvedValue(0);

      await workoutService.getWorkouts(mockUserId);

      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should apply limit and offset for pagination', async () => {
      const limitMock = jest.fn().mockReturnValue({
        skip: jest.fn().mockResolvedValue([]),
      });

      const skipMock = jest.fn().mockResolvedValue([]);

      (Workout.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: limitMock,
        }),
      });

      limitMock.mockReturnValue({
        skip: skipMock,
      });

      (Workout.countDocuments as jest.Mock).mockResolvedValue(0);

      await workoutService.getWorkouts(mockUserId, 20, 40);

      expect(limitMock).toHaveBeenCalledWith(20);
      expect(skipMock).toHaveBeenCalledWith(40);
    });

    it('should return total count of user workouts', async () => {
      (Workout.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (Workout.countDocuments as jest.Mock).mockResolvedValue(42);

      const result = await workoutService.getWorkouts(mockUserId);

      expect(result.total).toBe(42);
    });
  });

  describe('getWorkoutById', () => {
    it('should retrieve a specific workout by id and userId', async () => {
      (Workout.findOne as jest.Mock).mockResolvedValue(mockWorkout);

      const result = await workoutService.getWorkoutById(mockWorkoutId, mockUserId);

      expect(result).toEqual(mockWorkout);
      expect(Workout.findOne).toHaveBeenCalledWith({ _id: mockWorkoutId, userId: mockUserId });
    });

    it('should return null if workout not found', async () => {
      (Workout.findOne as jest.Mock).mockResolvedValue(null);

      const result = await workoutService.getWorkoutById(mockWorkoutId, mockUserId);

      expect(result).toBeNull();
    });

    it('should not retrieve workout if userId does not match', async () => {
      (Workout.findOne as jest.Mock).mockResolvedValue(null);

      const differentUserId = new mongoose.Types.ObjectId().toString();
      const result = await workoutService.getWorkoutById(mockWorkoutId, differentUserId);

      expect(result).toBeNull();
      expect(Workout.findOne).toHaveBeenCalledWith({ _id: mockWorkoutId, userId: differentUserId });
    });
  });

  describe('updateWorkout', () => {
    it('should update workout and recalculate calories if exercise details change', async () => {
      const updateData = {
        exerciseType: 'cycling',
        duration: 45,
        intensity: 8,
      };

      const updatedWorkout = {
        ...mockWorkout,
        ...updateData,
        caloriesBurned: 288, // 8 * 45 * (8/5)
      };

      (Workout.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedWorkout);

      const result = await workoutService.updateWorkout(mockWorkoutId, mockUserId, updateData);

      expect(result?.exerciseType).toBe('cycling');
      expect(result?.duration).toBe(45);
      expect(result?.caloriesBurned).toBe(288);
      expect(Workout.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockWorkoutId, userId: mockUserId },
        expect.objectContaining({
          exerciseType: 'cycling',
          duration: 45,
          intensity: 8,
        }),
        { new: true }
      );
    });

    it('should update only provided fields', async () => {
      const updateData = {
        notes: 'Updated notes',
      };

      const updatedWorkout = {
        ...mockWorkout,
        notes: 'Updated notes',
      };

      (Workout.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedWorkout);

      const result = await workoutService.updateWorkout(mockWorkoutId, mockUserId, updateData);

      expect(result?.notes).toBe('Updated notes');
    });

    it('should return null if workout not found for update', async () => {
      (Workout.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await workoutService.updateWorkout(mockWorkoutId, mockUserId, { notes: 'test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteWorkout', () => {
    it('should delete a workout and return true on success', async () => {
      (Workout.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await workoutService.deleteWorkout(mockWorkoutId, mockUserId);

      expect(result).toBe(true);
      expect(Workout.deleteOne).toHaveBeenCalledWith({ _id: mockWorkoutId, userId: mockUserId });
    });

    it('should return false if workout not found for deletion', async () => {
      (Workout.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await workoutService.deleteWorkout(mockWorkoutId, mockUserId);

      expect(result).toBe(false);
    });

    it('should only delete workouts belonging to the user', async () => {
      (Workout.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const differentUserId = new mongoose.Types.ObjectId().toString();
      await workoutService.deleteWorkout(mockWorkoutId, differentUserId);

      expect(Workout.deleteOne).toHaveBeenCalledWith({ _id: mockWorkoutId, userId: differentUserId });
    });
  });

  describe('Calorie Calculation Edge Cases', () => {
    it('should handle unknown exercise types with default base calories', async () => {
      const createData = {
        userId: mockUserId,
        exerciseType: 'unknown_exercise',
        duration: 30,
        intensity: 5,
        notes: '',
        startTime: new Date(),
        endTime: new Date(),
      };

      const expectedCalories = Math.round(5 * 30 * (5 / 5)); // default base is 5

      (Workout as any).mockImplementation(() => ({
        ...mockWorkout,
        exerciseType: 'unknown_exercise',
        caloriesBurned: expectedCalories,
        save: jest.fn().mockResolvedValue({
          ...mockWorkout,
          exerciseType: 'unknown_exercise',
          caloriesBurned: expectedCalories,
        }),
      }));

      (ActivityFeed.create as jest.Mock).mockResolvedValue({});

      const result = await workoutService.createWorkout(createData);
      expect(result.caloriesBurned).toBe(expectedCalories);
    });

    it('should calculate calories correctly with intensity level 1', async () => {
      const createData = {
        userId: mockUserId,
        exerciseType: 'walking',
        duration: 60,
        intensity: 1,
        notes: '',
        startTime: new Date(),
        endTime: new Date(),
      };

      const expectedCalories = Math.round(4 * 60 * (1 / 5)); // 48

      (Workout as any).mockImplementation(() => ({
        ...mockWorkout,
        exerciseType: 'walking',
        duration: 60,
        intensity: 1,
        caloriesBurned: expectedCalories,
        save: jest.fn().mockResolvedValue({
          ...mockWorkout,
          exerciseType: 'walking',
          duration: 60,
          intensity: 1,
          caloriesBurned: expectedCalories,
        }),
      }));

      (ActivityFeed.create as jest.Mock).mockResolvedValue({});

      const result = await workoutService.createWorkout(createData);
      expect(result.caloriesBurned).toBe(expectedCalories);
    });

    it('should calculate calories correctly with maximum intensity level 10', async () => {
      const createData = {
        userId: mockUserId,
        exerciseType: 'hiit',
        duration: 20,
        intensity: 10,
        notes: '',
        startTime: new Date(),
        endTime: new Date(),
      };

      const expectedCalories = Math.round(12 * 20 * (10 / 5)); // 480

      (Workout as any).mockImplementation(() => ({
        ...mockWorkout,
        exerciseType: 'hiit',
        duration: 20,
        intensity: 10,
        caloriesBurned: expectedCalories,
        save: jest.fn().mockResolvedValue({
          ...mockWorkout,
          exerciseType: 'hiit',
          duration: 20,
          intensity: 10,
          caloriesBurned: expectedCalories,
        }),
      }));

      (ActivityFeed.create as jest.Mock).mockResolvedValue({});

      const result = await workoutService.createWorkout(createData);
      expect(result.caloriesBurned).toBe(expectedCalories);
    });
  });
});
