import request from 'supertest';
import express, { Express } from 'express';
import workoutRouter from './workouts';
import authRouter from './auth';
import { User } from '../models/User';
import { Workout } from '../models/Workout';
import { connectDB, disconnectDB } from '../config/database';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Workout Endpoints - Integration Tests', () => {
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
    app.use('/api/v1/workouts', workoutRouter);

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
    await Workout.deleteMany({});
  });

  describe('POST /api/v1/workouts', () => {
    it('should successfully create a new workout', async () => {
      const workoutData = {
        exerciseType: 'running',
        duration: 30,
        intensity: 7,
        notes: 'Morning run',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
        distance: 5,
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('exerciseType', workoutData.exerciseType);
      expect(response.body).toHaveProperty('duration', workoutData.duration);
      expect(response.body).toHaveProperty('intensity', workoutData.intensity);
      expect(response.body).toHaveProperty('caloriesBurned');

      // Verify workout was persisted
      const workout = await Workout.findById(response.body._id);
      expect(workout).toBeDefined();
      expect(workout?.userId.toString()).toBe(userId);
    });

    it('should reject workout creation without auth token', async () => {
      const workoutData = {
        exerciseType: 'running',
        duration: 30,
        intensity: 7,
        notes: 'Morning run',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .send(workoutData);

      expect(response.status).toBe(401);
    });

    it('should reject workout creation with missing required fields', async () => {
      const workoutData = {
        exerciseType: 'running',
        duration: 30,
        // Missing intensity, startTime, endTime
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should calculate calories burned based on exercise type and duration', async () => {
      const workoutData = {
        exerciseType: 'running',
        duration: 60,
        intensity: 8,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60000).toISOString(),
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData);

      expect(response.status).toBe(201);
      expect(response.body.caloriesBurned).toBeGreaterThan(0);
    });

    it('should accept optional fields like distance, sets, reps, weight', async () => {
      const workoutData = {
        exerciseType: 'weightlifting',
        duration: 45,
        intensity: 8,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 45 * 60000).toISOString(),
        sets: 4,
        reps: 10,
        weight: 50,
      };

      const response = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workoutData);

      expect(response.status).toBe(201);
      expect(response.body.sets).toBe(4);
      expect(response.body.reps).toBe(10);
      expect(response.body.weight).toBe(50);
    });
  });

  describe('GET /api/v1/workouts', () => {
    beforeEach(async () => {
      // Create test workouts
      for (let i = 0; i < 15; i++) {
        await Workout.create({
          userId,
          exerciseType: i % 2 === 0 ? 'running' : 'weightlifting',
          duration: 30 + i * 5,
          intensity: 5 + (i % 5),
          caloriesBurned: 200 + i * 10,
          startTime: new Date(Date.now() - i * 86400000),
          endTime: new Date(Date.now() - i * 86400000 + 30 * 60000),
        });
      }
    });

    it('should retrieve user workouts with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('workouts');
      expect(response.body).toHaveProperty('total');
      expect(response.body.workouts.length).toBeLessThanOrEqual(10);
      expect(response.body.total).toBe(15);
    });

    it('should return workouts ordered by date (newest first)', async () => {
      const response = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      const workouts = response.body.workouts;
      
      for (let i = 0; i < workouts.length - 1; i++) {
        const current = new Date(workouts[i].createdAt).getTime();
        const next = new Date(workouts[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should support pagination with offset', async () => {
      const response1 = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5, offset: 0 });

      const response2 = await request(app)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5, offset: 5 });

      expect(response1.body.workouts[0]._id).not.toBe(response2.body.workouts[0]._id);
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/workouts');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/workouts/:id', () => {
    let workoutId: string;

    beforeEach(async () => {
      const workout = await Workout.create({
        userId,
        exerciseType: 'running',
        duration: 30,
        intensity: 7,
        caloriesBurned: 250,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
      });
      workoutId = workout._id.toString();
    });

    it('should retrieve a specific workout by id', async () => {
      const response = await request(app)
        .get(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', workoutId);
      expect(response.body).toHaveProperty('exerciseType', 'running');
    });

    it('should return 404 for non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .get(`/api/v1/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should prevent access to other users workouts', async () => {
      // Create another user
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
        .get(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/workouts/:id', () => {
    let workoutId: string;

    beforeEach(async () => {
      const workout = await Workout.create({
        userId,
        exerciseType: 'running',
        duration: 30,
        intensity: 7,
        caloriesBurned: 250,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
      });
      workoutId = workout._id.toString();
    });

    it('should successfully update a workout', async () => {
      const updateData = {
        duration: 45,
        intensity: 8,
        notes: 'Updated notes',
      };

      const response = await request(app)
        .put(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('duration', 45);
      expect(response.body).toHaveProperty('intensity', 8);
      expect(response.body).toHaveProperty('notes', 'Updated notes');

      // Verify update persisted
      const workout = await Workout.findById(workoutId);
      expect(workout?.duration).toBe(45);
    });

    it('should recalculate calories when duration or intensity changes', async () => {
      const updateData = {
        duration: 60,
        intensity: 9,
      };

      const response = await request(app)
        .put(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.caloriesBurned).toBeGreaterThan(250);
    });

    it('should return 404 for non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .put(`/api/v1/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ duration: 45 });

      expect(response.status).toBe(404);
    });

    it('should prevent updating other users workouts', async () => {
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
        .put(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ duration: 45 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/workouts/:id', () => {
    let workoutId: string;

    beforeEach(async () => {
      const workout = await Workout.create({
        userId,
        exerciseType: 'running',
        duration: 30,
        intensity: 7,
        caloriesBurned: 250,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 60000),
      });
      workoutId = workout._id.toString();
    });

    it('should successfully delete a workout', async () => {
      const response = await request(app)
        .delete(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Workout deleted');

      // Verify deletion persisted
      const workout = await Workout.findById(workoutId);
      expect(workout).toBeNull();
    });

    it('should return 404 when deleting non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const response = await request(app)
        .delete(`/api/v1/workouts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should prevent deleting other users workouts', async () => {
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
        .delete(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);

      // Verify workout still exists
      const workout = await Workout.findById(workoutId);
      expect(workout).toBeDefined();
    });
  });

  describe('Data persistence and consistency', () => {
    it('should maintain data consistency across CRUD operations', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          exerciseType: 'running',
          duration: 30,
          intensity: 7,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30 * 60000).toISOString(),
        });

      const workoutId = createResponse.body._id;

      // Read
      const readResponse = await request(app)
        .get(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.body.exerciseType).toBe('running');

      // Update
      const updateResponse = await request(app)
        .put(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ duration: 45 });

      expect(updateResponse.body.duration).toBe(45);

      // Verify update
      const verifyResponse = await request(app)
        .get(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.body.duration).toBe(45);

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const finalResponse = await request(app)
        .get(`/api/v1/workouts/${workoutId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(finalResponse.status).toBe(404);
    });
  });
});
