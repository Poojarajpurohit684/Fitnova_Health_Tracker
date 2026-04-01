import request from 'supertest';
import express, { Express } from 'express';
import authRouter from './auth';
import { User } from '../models/User';
import bcryptjs from 'bcryptjs';

// Mock the User model
jest.mock('../models/User');

describe('Auth Routes - Bcrypt Integration', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register with valid credentials', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: registerData.email,
        username: 'newuser',
        passwordHash: await bcryptjs.hash(registerData.password, 12),
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        dateOfBirth: new Date(registerData.dateOfBirth),
        gender: registerData.gender,
        height: registerData.height,
        currentWeight: registerData.currentWeight,
        targetWeight: registerData.currentWeight,
        activityLevel: 'moderate',
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body.userId).toBe(mockUser._id.toString());
      expect(response.body.email).toBe(registerData.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should reject registration with weak password (less than 12 chars)', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'Weak1!',
        firstName: 'Test',
        lastName: 'User',
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
      // Check if the error details contain the password validation error
      expect(response.body.error.details).toBeDefined();
      expect(JSON.stringify(response.body.error.details)).toContain('12 characters');
    });

    it('should reject registration with password missing uppercase', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'securepass123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('uppercase');
    });

    it('should reject registration with password missing lowercase', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SECUREPASS123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('lowercase');
    });

    it('should reject registration with password missing number', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePassword!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('number');
    });

    it('should reject registration with password missing special character', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('special character');
    });

    it('should reject registration with duplicate email', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const existingUser = {
        _id: '507f1f77bcf86cd799439010',
        email: registerData.email,
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REGISTRATION_ERROR');
      expect(response.body.error.message).toContain('Email already in use');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should successfully login with correct credentials', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
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
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: password,
        });

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(mockUser._id.toString());
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
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
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should reject login with disabled account', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
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
        isActive: false,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: password,
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toContain('Account is disabled');
    });
  });

  describe('Password Strength Validation', () => {
    it('should accept password with exactly 12 characters', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass1!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: registerData.email,
        username: 'newuser',
        passwordHash: await bcryptjs.hash(registerData.password, 12),
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        dateOfBirth: new Date(registerData.dateOfBirth),
        gender: registerData.gender,
        height: registerData.height,
        currentWeight: registerData.currentWeight,
        targetWeight: registerData.currentWeight,
        activityLevel: 'moderate',
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });

    it('should accept password with more than 12 characters', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'VerySecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01T00:00:00Z',
        gender: 'M',
        height: 180,
        currentWeight: 75,
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: registerData.email,
        username: 'newuser',
        passwordHash: await bcryptjs.hash(registerData.password, 12),
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        dateOfBirth: new Date(registerData.dateOfBirth),
        gender: registerData.gender,
        height: registerData.height,
        currentWeight: registerData.currentWeight,
        targetWeight: registerData.currentWeight,
        activityLevel: 'moderate',
        isEmailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
    });
  });
});

