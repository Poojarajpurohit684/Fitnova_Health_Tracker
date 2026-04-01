import request from 'supertest';
import express, { Express } from 'express';
import nutritionRouter from './nutrition';
import authRouter from './auth';
import { User } from '../models/User';
import { NutritionEntry } from '../models/NutritionEntry';
import { connectDB, disconnectDB } from '../config/database';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Nutrition Endpoints - Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/nutrition', nutritionRouter);

    // Create test user and get auth token
    const password = 'SecurePass123!';
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const user = await User.create({
      email: 'testuser@example.com',
      username: 'testuser',
      passwordHash: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'M',
      height: 180,
      currentWeight: 75,
      targetWeight: 75,
      activityLevel: 'moderate',
      isEmailVerified: true,
      isActive: true,
    });

    userId = user._id.toString();

    // Generate auth token
    authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await NutritionEntry.deleteMany({});
  });

  describe('POST /api/v1/nutrition', () => {
    it('should successfully create a nutrition entry', async () => {
      const entryData = {
        foodName: 'Chicken Breast',
        quantity: 150,
        unit: 'g',
        calories: 250,
        protein: 35,
        carbohydrates: 0,
        fats: 5,
        mealType: 'lunch',
        loggedAt: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('foodName', entryData.foodName);
      expect(response.body).toHaveProperty('calories', entryData.calories);
      expect(response.body).toHaveProperty('protein', entryData.protein);

      // Verify entry was persisted
      const entry = await NutritionEntry.findById(response.body._id);
      expect(entry).toBeDefined();
      expect(entry?.userId.toString()).toBe(userId);
    });

    it('should reject entry creation without auth token', async () => {
      const entryData = {
        foodName: 'Chicken Breast',
        quantity: 150,
        unit: 'g',
        calories: 250,
        protein: 35,
        carbohydrates: 0,
        fats: 5,
        mealType: 'lunch',
      };

      const response = await request(app)
        .post('/api/v1/nutrition')
        .send(entryData);

      expect(response.status).toBe(401);
    });

    it('should reject entry creation with missing required fields', async () => {
      const entryData = {
        foodName: 'Chicken Breast',
        quantity: 150,
        // Missing unit, calories, protein, carbohydrates, fats, mealType
      };

      const response = await request(app)
        .post('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional fields like fiber, sugar, sodium', async () => {
      const entryData = {
        foodName: 'Apple',
        quantity: 1,
        unit: 'medium',
        calories: 95,
        protein: 0.5,
        carbohydrates: 25,
        fats: 0.3,
        fiber: 4.4,
        sugar: 19,
        sodium: 2,
        mealType: 'snack',
      };

      const response = await request(app)
        .post('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(201);
      expect(response.body.fiber).toBe(4.4);
      expect(response.body.sugar).toBe(19);
      expect(response.body.sodium).toBe(2);
    });

    it('should support all meal types', async () => {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

      for (const mealType of mealTypes) {
        const entryData = {
          foodName: 'Test Food',
          quantity: 100,
          unit: 'g',
          calories: 200,
          protein: 10,
          carbohydrates: 20,
          fats: 5,
          mealType,
        };

        const response = await request(app)
          .post('/api/v1/nutrition')
          .set('Authorization', `Bearer ${authToken}`)
          .send(entryData);

        expect(response.status).toBe(201);
        expect(response.body.mealType).toBe(mealType);
      }
    });
  });

  describe('GET /api/v1/nutrition', () => {
    beforeEach(async () => {
      // Create test nutrition entries
      const today = new Date();
      for (let i = 0; i < 12; i++) {
        await NutritionEntry.create({
          userId,
          foodName: `Food ${i}`,
          quantity: 100 + i * 10,
          unit: 'g',
          calories: 200 + i * 20,
          protein: 10 + i,
          carbohydrates: 20 + i * 2,
          fats: 5 + i,
          mealType: ['breakfast', 'lunch', 'dinner', 'snack'][i % 4],
          loggedAt: new Date(today.getTime() - i * 3600000),
        });
      }
    });

    it('should retrieve user nutrition entries with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('entries');
      expect(response.body).toHaveProperty('dailyTotals');
      expect(response.body.entries.length).toBeLessThanOrEqual(10);
    });

    it('should return daily totals for macronutrients', async () => {
      const response = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 100, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.dailyTotals).toHaveProperty('calories');
      expect(response.body.dailyTotals).toHaveProperty('protein');
      expect(response.body.dailyTotals).toHaveProperty('carbohydrates');
      expect(response.body.dailyTotals).toHaveProperty('fats');
      expect(response.body.dailyTotals.calories).toBeGreaterThan(0);
    });

    it('should support pagination with offset', async () => {
      const response1 = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5, offset: 0 });

      const response2 = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5, offset: 5 });

      expect(response1.body.entries[0]._id).not.toBe(response2.body.entries[0]._id);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/nutrition');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/nutrition/:id', () => {
    let entryId: string;

    beforeEach(async () => {
      const entry = await NutritionEntry.create({
        userId,
        foodName: 'Chicken Breast',
        quantity: 150,
        unit: 'g',
        calories: 250,
        protein: 35,
        carbohydrates: 0,
        fats: 5,
        mealType: 'lunch',
      });
      entryId = entry._id.toString();
    });

    it('should retrieve a specific nutrition entry by id', async () => {
      const response = await request(app)
        .get(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', entryId);
      expect(response.body).toHaveProperty('foodName', 'Chicken Breast');
    });

    it('should return 404 for non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .get(`/api/v1/nutrition/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent access to other users entries', async () => {
      const otherUser = await User.create({
        email: 'otheruser@example.com',
        username: 'otheruser',
        passwordHash: await bcryptjs.hash('SecurePass123!', 12),
        firstName: 'Other',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        height: 180,
        currentWeight: 75,
        targetWeight: 75,
        activityLevel: 'moderate',
        isEmailVerified: true,
        isActive: true,
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id, email: otherUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/nutrition/:id', () => {
    let entryId: string;

    beforeEach(async () => {
      const entry = await NutritionEntry.create({
        userId,
        foodName: 'Chicken Breast',
        quantity: 150,
        unit: 'g',
        calories: 250,
        protein: 35,
        carbohydrates: 0,
        fats: 5,
        mealType: 'lunch',
      });
      entryId = entry._id.toString();
    });

    it('should successfully update a nutrition entry', async () => {
      const updateData = {
        quantity: 200,
        calories: 333,
        protein: 47,
      };

      const response = await request(app)
        .put(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('quantity', 200);
      expect(response.body).toHaveProperty('calories', 333);
      expect(response.body).toHaveProperty('protein', 47);

      // Verify update persisted
      const entry = await NutritionEntry.findById(entryId);
      expect(entry?.quantity).toBe(200);
    });

    it('should recalculate daily totals when entry is updated', async () => {
      // Get initial totals
      const initialResponse = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`);

      const initialCalories = initialResponse.body.dailyTotals.calories;

      // Update entry
      await request(app)
        .put(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ calories: 500 });

      // Get updated totals
      const updatedResponse = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`);

      const updatedCalories = updatedResponse.body.dailyTotals.calories;
      expect(updatedCalories).not.toBe(initialCalories);
    });

    it('should return 404 for non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .put(`/api/v1/nutrition/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 200 });

      expect(response.status).toBe(404);
    });

    it('should prevent updating other users entries', async () => {
      const otherUser = await User.create({
        email: 'otheruser@example.com',
        username: 'otheruser',
        passwordHash: await bcryptjs.hash('SecurePass123!', 12),
        firstName: 'Other',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        height: 180,
        currentWeight: 75,
        targetWeight: 75,
        activityLevel: 'moderate',
        isEmailVerified: true,
        isActive: true,
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id, email: otherUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .put(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ quantity: 200 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/nutrition/:id', () => {
    let entryId: string;

    beforeEach(async () => {
      const entry = await NutritionEntry.create({
        userId,
        foodName: 'Chicken Breast',
        quantity: 150,
        unit: 'g',
        calories: 250,
        protein: 35,
        carbohydrates: 0,
        fats: 5,
        mealType: 'lunch',
      });
      entryId = entry._id.toString();
    });

    it('should successfully delete a nutrition entry', async () => {
      const response = await request(app)
        .delete(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Entry deleted');

      // Verify deletion persisted
      const entry = await NutritionEntry.findById(entryId);
      expect(entry).toBeNull();
    });

    it('should recalculate daily totals when entry is deleted', async () => {
      // Get initial totals
      const initialResponse = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`);

      const initialCalories = initialResponse.body.dailyTotals.calories;

      // Delete entry
      await request(app)
        .delete(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Get updated totals
      const updatedResponse = await request(app)
        .get('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`);

      const updatedCalories = updatedResponse.body.dailyTotals.calories;
      expect(updatedCalories).toBeLessThan(initialCalories);
    });

    it('should return 404 when deleting non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .delete(`/api/v1/nutrition/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should prevent deleting other users entries', async () => {
      const otherUser = await User.create({
        email: 'otheruser@example.com',
        username: 'otheruser',
        passwordHash: await bcryptjs.hash('SecurePass123!', 12),
        firstName: 'Other',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        height: 180,
        currentWeight: 75,
        targetWeight: 75,
        activityLevel: 'moderate',
        isEmailVerified: true,
        isActive: true,
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id, email: otherUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .delete(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);

      // Verify entry still exists
      const entry = await NutritionEntry.findById(entryId);
      expect(entry).toBeDefined();
    });
  });

  describe('Data persistence and consistency', () => {
    it('should maintain data consistency across CRUD operations', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/v1/nutrition')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          foodName: 'Chicken Breast',
          quantity: 150,
          unit: 'g',
          calories: 250,
          protein: 35,
          carbohydrates: 0,
          fats: 5,
          mealType: 'lunch',
        });

      const entryId = createResponse.body._id;

      // Read
      const readResponse = await request(app)
        .get(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.body.foodName).toBe('Chicken Breast');

      // Update
      const updateResponse = await request(app)
        .put(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 200 });

      expect(updateResponse.body.quantity).toBe(200);

      // Verify update
      const verifyResponse = await request(app)
        .get(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.body.quantity).toBe(200);

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const finalResponse = await request(app)
        .get(`/api/v1/nutrition/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalResponse.status).toBe(404);
    });
  });
});
