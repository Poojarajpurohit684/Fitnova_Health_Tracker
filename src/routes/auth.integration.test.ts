import request from 'supertest';
import express, { Express } from 'express';
import authRouter from './auth';
import { User } from '../models/User';
import { connectDB, disconnectDB } from '../config/database';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Endpoints - Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  afterAll(async () => {
    // Disconnect from test database
    await disconnectDB();
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user with valid credentials', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email', registerData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify user was created in database
      const user = await User.findOne({ email: registerData.email });
      expect(user).toBeDefined();
      expect(user?.email).toBe(registerData.email);
      expect(user?.firstName).toBe(registerData.firstName);
      expect(user?.lastName).toBe(registerData.lastName);
    });

    it('should reject registration with duplicate email', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      // Create first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('Email already in use');
    });

    it('should reject registration with weak password (less than 12 chars)', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'Weak1!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with missing required fields', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        // Missing firstName, lastName, etc.
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with invalid email format', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should hash password with bcrypt before storing', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      const user = await User.findOne({ email: registerData.email });
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(registerData.password);
      
      // Verify password hash is valid
      const isPasswordValid = await bcryptjs.compare(registerData.password, user!.passwordHash);
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);
      
      await User.create({
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
    });

    it('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('email', 'testuser@example.com');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify JWT token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!);
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email', 'testuser@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject login with disabled account', async () => {
      // Create disabled user
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);
      
      await User.create({
        email: 'disabled@example.com',
        username: 'disabled',
        passwordHash: hashedPassword,
        firstName: 'Disabled',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M',
        height: 180,
        currentWeight: 75,
        targetWeight: 75,
        activityLevel: 'moderate',
        isEmailVerified: true,
        isActive: false,
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'disabled@example.com',
          password: password,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should update lastLoginAt on successful login', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePass123!',
        });

      const user = await User.findOne({ email: 'testuser@example.com' });
      expect(user?.lastLoginAt).toBeDefined();
      expect(user?.lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user and get refresh token
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);
      
      await User.create({
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

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePass123!',
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should successfully refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresIn');

      // Verify new token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!);
      expect(decoded).toHaveProperty('userId');
    });

    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('TOKEN_ERROR');
    });

    it('should reject refresh with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should successfully logout', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('Authorization checks', () => {
    it('should return 401 when accessing protected route without token', async () => {
      // This test assumes workouts route is protected
      const response = await request(app)
        .get('/api/v1/workouts');

      expect(response.status).toBe(401);
    });
  });
});
