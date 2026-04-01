import { NutritionService } from './NutritionService';
import { NutritionEntry } from '../models/NutritionEntry';
import mongoose from 'mongoose';

// Mock the model
jest.mock('../models/NutritionEntry');

describe('NutritionService', () => {
  let nutritionService: NutritionService;
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockEntryId = new mongoose.Types.ObjectId().toString();

  const mockEntry = {
    _id: mockEntryId,
    userId: mockUserId,
    foodName: 'Chicken Breast',
    quantity: 100,
    unit: 'g',
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fats: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    mealType: 'lunch' as const,
    loggedAt: new Date('2024-01-15T12:00:00'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    nutritionService = new NutritionService();
    jest.clearAllMocks();
  });

  describe('createEntry', () => {
    it('should create a nutrition entry', async () => {
      const createData = {
        userId: mockUserId,
        foodName: 'Chicken Breast',
        quantity: 100,
        unit: 'g',
        calories: 165,
        protein: 31,
        carbohydrates: 0,
        fats: 3.6,
        mealType: 'lunch' as const,
        loggedAt: new Date('2024-01-15T12:00:00'),
      };

      (NutritionEntry as any).mockImplementation(() => ({
        ...mockEntry,
        save: jest.fn().mockResolvedValue(mockEntry),
      }));

      const result = await nutritionService.createEntry(createData);

      expect(result.foodName).toBe('Chicken Breast');
      expect(result.calories).toBe(165);
      expect(result.protein).toBe(31);
      expect(result.mealType).toBe('lunch');
    });

    it('should save entry with all nutritional information', async () => {
      const createData = {
        userId: mockUserId,
        foodName: 'Salmon',
        quantity: 150,
        unit: 'g',
        calories: 280,
        protein: 25,
        carbohydrates: 0,
        fats: 20,
        fiber: 0,
        sugar: 0,
        sodium: 75,
        mealType: 'dinner' as const,
        loggedAt: new Date(),
      };

      (NutritionEntry as any).mockImplementation(() => ({
        ...mockEntry,
        ...createData,
        save: jest.fn().mockResolvedValue({ ...mockEntry, ...createData }),
      }));

      const result = await nutritionService.createEntry(createData);

      expect(result.foodName).toBe('Salmon');
      expect(result.calories).toBe(280);
      expect(result.protein).toBe(25);
      expect(result.fats).toBe(20);
    });
  });

  describe('getEntries', () => {
    it('should retrieve nutrition entries for a user with pagination', async () => {
      const mockEntries = [mockEntry, { ...mockEntry, _id: new mongoose.Types.ObjectId() }];

      (NutritionEntry.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockEntries),
          }),
        }),
      });

      (NutritionEntry.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await nutritionService.getEntries(mockUserId, 10, 0);

      expect(result.entries).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(NutritionEntry.find).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('should sort entries by logged date descending', async () => {
      const sortMock = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue([]),
        }),
      });

      (NutritionEntry.find as jest.Mock).mockReturnValue({
        sort: sortMock,
      });

      (NutritionEntry.countDocuments as jest.Mock).mockResolvedValue(0);

      await nutritionService.getEntries(mockUserId);

      expect(sortMock).toHaveBeenCalledWith({ loggedAt: -1 });
    });

    it('should apply limit and offset for pagination', async () => {
      const limitMock = jest.fn().mockReturnValue({
        skip: jest.fn().mockResolvedValue([]),
      });

      const skipMock = jest.fn().mockResolvedValue([]);

      (NutritionEntry.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: limitMock,
        }),
      });

      limitMock.mockReturnValue({
        skip: skipMock,
      });

      (NutritionEntry.countDocuments as jest.Mock).mockResolvedValue(0);

      await nutritionService.getEntries(mockUserId, 20, 40);

      expect(limitMock).toHaveBeenCalledWith(20);
      expect(skipMock).toHaveBeenCalledWith(40);
    });

    it('should return total count of user entries', async () => {
      (NutritionEntry.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      (NutritionEntry.countDocuments as jest.Mock).mockResolvedValue(156);

      const result = await nutritionService.getEntries(mockUserId);

      expect(result.total).toBe(156);
    });
  });

  describe('getEntryById', () => {
    it('should retrieve a specific nutrition entry by id and userId', async () => {
      (NutritionEntry.findOne as jest.Mock).mockResolvedValue(mockEntry);

      const result = await nutritionService.getEntryById(mockEntryId, mockUserId);

      expect(result).toEqual(mockEntry);
      expect(NutritionEntry.findOne).toHaveBeenCalledWith({ _id: mockEntryId, userId: mockUserId });
    });

    it('should return null if entry not found', async () => {
      (NutritionEntry.findOne as jest.Mock).mockResolvedValue(null);

      const result = await nutritionService.getEntryById(mockEntryId, mockUserId);

      expect(result).toBeNull();
    });

    it('should not retrieve entry if userId does not match', async () => {
      (NutritionEntry.findOne as jest.Mock).mockResolvedValue(null);

      const differentUserId = new mongoose.Types.ObjectId().toString();
      const result = await nutritionService.getEntryById(mockEntryId, differentUserId);

      expect(result).toBeNull();
    });
  });

  describe('updateEntry', () => {
    it('should update nutrition entry with new values', async () => {
      const updateData = {
        quantity: 150,
        calories: 248,
        protein: 46.5,
      };

      const updatedEntry = {
        ...mockEntry,
        ...updateData,
      };

      (NutritionEntry.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedEntry);

      const result = await nutritionService.updateEntry(mockEntryId, mockUserId, updateData);

      expect(result?.quantity).toBe(150);
      expect(result?.calories).toBe(248);
      expect(result?.protein).toBe(46.5);
      expect(NutritionEntry.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockEntryId, userId: mockUserId },
        updateData,
        { new: true }
      );
    });

    it('should update only provided fields', async () => {
      const updateData: Partial<any> = {
        quantity: 120,
      };

      const updatedEntry = {
        ...mockEntry,
        ...updateData,
      };

      (NutritionEntry.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedEntry);

      const result = await nutritionService.updateEntry(mockEntryId, mockUserId, updateData);

      expect(result).toBeDefined();
    });

    it('should return null if entry not found for update', async () => {
      (NutritionEntry.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await nutritionService.updateEntry(mockEntryId, mockUserId, { quantity: 200 });

      expect(result).toBeNull();
    });
  });

  describe('deleteEntry', () => {
    it('should delete a nutrition entry and return true on success', async () => {
      (NutritionEntry.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await nutritionService.deleteEntry(mockEntryId, mockUserId);

      expect(result).toBe(true);
      expect(NutritionEntry.deleteOne).toHaveBeenCalledWith({ _id: mockEntryId, userId: mockUserId });
    });

    it('should return false if entry not found for deletion', async () => {
      (NutritionEntry.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const result = await nutritionService.deleteEntry(mockEntryId, mockUserId);

      expect(result).toBe(false);
    });

    it('should only delete entries belonging to the user', async () => {
      (NutritionEntry.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const differentUserId = new mongoose.Types.ObjectId().toString();
      await nutritionService.deleteEntry(mockEntryId, differentUserId);

      expect(NutritionEntry.deleteOne).toHaveBeenCalledWith({ _id: mockEntryId, userId: differentUserId });
    });
  });

  describe('getDailyTotals', () => {
    it('should calculate daily totals for calories and macros', async () => {
      const date = new Date('2024-01-15');
      const entries = [
        {
          ...mockEntry,
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fats: 3.6,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          calories: 200,
          protein: 25,
          carbohydrates: 15,
          fats: 8,
        },
      ];

      (NutritionEntry.find as jest.Mock).mockResolvedValue(entries);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(365);
      expect(result.protein).toBe(56);
      expect(result.carbohydrates).toBe(15);
      expect(result.fats).toBe(11.6);
    });

    it('should return zero totals when no entries for the day', async () => {
      const date = new Date('2024-01-15');

      (NutritionEntry.find as jest.Mock).mockResolvedValue([]);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(0);
      expect(result.protein).toBe(0);
      expect(result.carbohydrates).toBe(0);
      expect(result.fats).toBe(0);
    });

    it('should query entries for the entire day (00:00 to 23:59)', async () => {
      const date = new Date('2024-01-15T14:30:00');

      (NutritionEntry.find as jest.Mock).mockResolvedValue([]);

      await nutritionService.getDailyTotals(mockUserId, date);

      const callArgs = (NutritionEntry.find as jest.Mock).mock.calls[0][0];
      expect(callArgs.userId).toBe(mockUserId);
      expect(callArgs.loggedAt.$gte.getHours()).toBe(0);
      expect(callArgs.loggedAt.$gte.getMinutes()).toBe(0);
      expect(callArgs.loggedAt.$lte.getHours()).toBe(23);
      expect(callArgs.loggedAt.$lte.getMinutes()).toBe(59);
    });

    it('should sum macros correctly across multiple entries', async () => {
      const date = new Date('2024-01-15');
      const entries = [
        {
          ...mockEntry,
          calories: 300,
          protein: 30,
          carbohydrates: 40,
          fats: 10,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          calories: 400,
          protein: 20,
          carbohydrates: 50,
          fats: 15,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          calories: 200,
          protein: 15,
          carbohydrates: 25,
          fats: 8,
        },
      ];

      (NutritionEntry.find as jest.Mock).mockResolvedValue(entries);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(900);
      expect(result.protein).toBe(65);
      expect(result.carbohydrates).toBe(115);
      expect(result.fats).toBe(33);
    });

    it('should handle decimal macro values correctly', async () => {
      const date = new Date('2024-01-15');
      const entries = [
        {
          ...mockEntry,
          calories: 165,
          protein: 31.5,
          carbohydrates: 0.2,
          fats: 3.6,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          calories: 200,
          protein: 25.3,
          carbohydrates: 15.8,
          fats: 8.4,
        },
      ];

      (NutritionEntry.find as jest.Mock).mockResolvedValue(entries);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(365);
      expect(result.protein).toBe(56.8);
      expect(result.carbohydrates).toBe(16);
      expect(result.fats).toBe(12);
    });

    it('should handle different meal types in daily totals', async () => {
      const date = new Date('2024-01-15');
      const entries = [
        {
          ...mockEntry,
          mealType: 'breakfast' as const,
          calories: 300,
          protein: 15,
          carbohydrates: 40,
          fats: 10,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          mealType: 'lunch' as const,
          calories: 500,
          protein: 35,
          carbohydrates: 60,
          fats: 15,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          mealType: 'dinner' as const,
          calories: 400,
          protein: 30,
          carbohydrates: 50,
          fats: 12,
        },
        {
          ...mockEntry,
          _id: new mongoose.Types.ObjectId(),
          mealType: 'snack' as const,
          calories: 150,
          protein: 5,
          carbohydrates: 20,
          fats: 5,
        },
      ];

      (NutritionEntry.find as jest.Mock).mockResolvedValue(entries);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(1350);
      expect(result.protein).toBe(85);
      expect(result.carbohydrates).toBe(170);
      expect(result.fats).toBe(42);
    });
  });

  describe('Macro Calculation Edge Cases', () => {
    it('should handle entries with zero macros', async () => {
      const date = new Date('2024-01-15');
      const entries = [
        {
          ...mockEntry,
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
        },
      ];

      (NutritionEntry.find as jest.Mock).mockResolvedValue(entries);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(0);
      expect(result.protein).toBe(0);
      expect(result.carbohydrates).toBe(0);
      expect(result.fats).toBe(0);
    });

    it('should handle very large macro values', async () => {
      const date = new Date('2024-01-15');
      const entries = [
        {
          ...mockEntry,
          calories: 5000,
          protein: 200,
          carbohydrates: 500,
          fats: 150,
        },
      ];

      (NutritionEntry.find as jest.Mock).mockResolvedValue(entries);

      const result = await nutritionService.getDailyTotals(mockUserId, date);

      expect(result.calories).toBe(5000);
      expect(result.protein).toBe(200);
      expect(result.carbohydrates).toBe(500);
      expect(result.fats).toBe(150);
    });
  });
});
