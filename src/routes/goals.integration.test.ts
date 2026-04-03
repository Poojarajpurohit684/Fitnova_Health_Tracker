import request from 'supertest';
import express, { Express } from 'express';
import goalsRouter from './goals';
import authRouter from './auth';
import { User } from '../models/User';
import { Goal } from '../models/Goal';
import { connectDB, disconnectDB } from '../config/database';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Goal Endpoints - Integration Tests', () => {
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
    app.use('/api/v1/goals', goalsRouter);

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
    await Goal.deleteMany({});
  });

  describe('POST /api/v1/goals', () => {
    it('should successfully create a new goal', async () => {
      const goalData = {
        goalType: 'weight_loss',
        targetValue: 70,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Lose 5kg in 3 months',
        currentValue: 75,
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('goalType', goalData.goalType);
      expect(response.body).toHaveProperty('targetValue', goalData.targetValue);
      expect(response.body).toHaveProperty('status', 'active');

      // Verify goal was persisted
      const goal = await Goal.findById(response.body._id);
      expect(goal).toBeDefined();
      expect(goal?.userId.toString()).toBe(userId);
    });

    it('should reject goal creation without auth token', async () => {
      const goalData = {
        goalType: 'weight_loss',
        targetValue: 70,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .send(goalData);

      expect(response.status).toBe(401);
    });

    it('should reject goal creation with missing required fields', async () => {
      const goalData = {
        goalType: 'weight_loss',
        targetValue: 70,
        // Missing unit and targetDate
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should support all goal types', async () => {
      const goalTypes = ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility'];

      for (const goalType of goalTypes) {
        const goalData = {
          goalType,
          targetValue: 100,
          unit: 'kg',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const response = await request(app)
          .post('/api/v1/goals')
          .set('Authorization', `Bearer ${authToken}`)
          .send(goalData);

        expect(response.status).toBe(201);
        expect(response.body.goalType).toBe(goalType);
      }
    });

    it('should set initial status to active', async () => {
      const goalData = {
        goalType: 'weight_loss',
        targetValue: 70,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('active');
    });

    it('should set currentValue to 0 if not provided', async () => {
      const goalData = {
        goalType: 'weight_loss',
        targetValue: 70,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      expect(response.status).toBe(201);
      expect(response.body.currentValue).toBe(0);
    });
  });

  describe('GET /api/v1/goals', () => {
    beforeEach(async () => {
      // Create test goals with different statuses
      const targetDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < 5; i++) {
        await Goal.create({
          userId,
          goalType: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility'][i],
          targetValue: 100 + i * 10,
          currentValue: 50 + i * 5,
          unit: 'kg',
          targetDate,
          status: i < 3 ? 'active' : 'completed',
          startDate: new Date(),
        });
      }
    });

    it('should retrieve user goals', async () => {
      const response = await request(app)
        .get('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('goals');
      expect(response.body).toHaveProperty('total', 5);
      expect(response.body.goals.length).toBe(5);
    });

    it('should filter goals by status', async () => {
      const response = await request(app)
        .get('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.goals.length).toBe(3);
      expect(response.body.goals.every((g: any) => g.status === 'active')).toBe(true);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/goals');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/goals/:id', () => {
    let goalId: string;

    beforeEach(async () => {
      const goal = await Goal.create({
        userId,
        goalType: 'weight_loss',
        targetValue: 70,
        currentValue: 75,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        startDate: new Date(),
      });
      goalId = goal._id.toString();
    });

    it('should retrieve a specific goal by id with progress', async () => {
      const response = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('goal');
      expect(response.body).toHaveProperty('progress');
      expect(response.body.goal._id).toBe(goalId);
    });

    it('should calculate progress percentage', async () => {
      const response = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.progress).toBeGreaterThanOrEqual(0);
      expect(response.body.progress).toBeLessThanOrEqual(100);
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .get(`/api/v1/goals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent access to other users goals', async () => {
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
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/goals/:id', () => {
    let goalId: string;

    beforeEach(async () => {
      const goal = await Goal.create({
        userId,
        goalType: 'weight_loss',
        targetValue: 70,
        currentValue: 75,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        startDate: new Date(),
      });
      goalId = goal._id.toString();
    });

    it('should successfully update a goal', async () => {
      const updateData = {
        targetValue: 68,
        currentValue: 73,
        description: 'Updated goal',
      };

      const response = await request(app)
        .put(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('targetValue', 68);
      expect(response.body).toHaveProperty('currentValue', 73);

      // Verify update persisted
      const goal = await Goal.findById(goalId);
      expect(goal?.targetValue).toBe(68);
    });

    it('should update goal status', async () => {
      const updateData = {
        status: 'completed',
      };

      const response = await request(app)
        .put(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should recalculate progress when currentValue changes', async () => {
      // Get initial progress
      const initialResponse = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const initialProgress = initialResponse.body.progress;

      // Update currentValue
      await request(app)
        .put(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentValue: 72 });

      // Get updated progress
      const updatedResponse = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const updatedProgress = updatedResponse.body.progress;
      expect(updatedProgress).not.toBe(initialProgress);
    });

    it('should return 404 for non-existent goal', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .put(`/api/v1/goals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ targetValue: 68 });

      expect(response.status).toBe(404);
    });

    it('should prevent updating other users goals', async () => {
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
        .put(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ targetValue: 68 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/goals/:id', () => {
    let goalId: string;

    beforeEach(async () => {
      const goal = await Goal.create({
        userId,
        goalType: 'weight_loss',
        targetValue: 70,
        currentValue: 75,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        startDate: new Date(),
      });
      goalId = goal._id.toString();
    });

    it('should successfully delete a goal', async () => {
      const response = await request(app)
        .delete(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Goal deleted');

      // Verify deletion persisted
      const goal = await Goal.findById(goalId);
      expect(goal).toBeNull();
    });

    it('should return 404 when deleting non-existent goal', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .delete(`/api/v1/goals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should prevent deleting other users goals', async () => {
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
        .delete(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);

      // Verify goal still exists
      const goal = await Goal.findById(goalId);
      expect(goal).toBeDefined();
    });
  });

  describe('Data persistence and consistency', () => {
    it('should maintain data consistency across CRUD operations', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          goalType: 'weight_loss',
          targetValue: 70,
          unit: 'kg',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          currentValue: 75,
        });

      const goalId = createResponse.body._id;

      // Read
      const readResponse = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.body.goal.goalType).toBe('weight_loss');

      // Update
      const updateResponse = await request(app)
        .put(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentValue: 72 });

      expect(updateResponse.body.currentValue).toBe(72);

      // Verify update
      const verifyResponse = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.body.goal.currentValue).toBe(72);

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const finalResponse = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalResponse.status).toBe(404);
    });
  });

  describe('Goal deadline and progress tracking', () => {
    it('should track progress toward goal completion', async () => {
      const goalData = {
        goalType: 'weight_loss',
        targetValue: 70,
        currentValue: 75,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/v1/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      const goalId = createResponse.body._id;

      // Update progress
      await request(app)
        .put(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentValue: 72 });

      const response = await request(app)
        .get(`/api/v1/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.progress).toBeGreaterThan(0);
    });
  });
});
