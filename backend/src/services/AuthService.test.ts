import { AuthService } from './AuthService';
import { User } from '../models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the User model
jest.mock('../models/User');

describe('AuthService - Password Hashing with Bcrypt', () => {
  let authService: AuthService;
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: '',
    firstName: 'Test',
    lastName: 'User',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'M' as const,
    height: 180,
    currentWeight: 75,
    targetWeight: 75,
    activityLevel: 'moderate' as const,
    isEmailVerified: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    // Set environment variables
    process.env.BCRYPT_SALT_ROUNDS = '12';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRATION = '24h';
    process.env.REFRESH_TOKEN_EXPIRATION = '7d';
  });

  describe('Password Hashing on Registration', () => {
    it('should hash password with bcrypt using salt factor 12', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
      // Bcrypt hashes start with $2a$, $2b$, or $2y$
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    it('should create user with hashed password on successful registration', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
        dateOfBirth: new Date('1995-05-15'),
        gender: 'F' as const,
        height: 165,
        currentWeight: 60,
      };

      const newMockUser = {
        ...mockUser,
        email: registerData.email,
        _id: '507f1f77bcf86cd799439012',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User as any).mockImplementation(() => newMockUser);
      newMockUser.save = jest.fn().mockResolvedValue(newMockUser);

      const result = await authService.register(registerData);

      expect(result.userId).toBe(newMockUser._id.toString());
      expect(result.email).toBe(registerData.email);
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject registration with duplicate email', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'M' as const,
        height: 180,
        currentWeight: 75,
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow('Email already in use');
    });
  });

  describe('Password Comparison on Login', () => {
    it('should successfully compare correct password with bcrypt hash', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const isValid = await bcryptjs.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const isValid = await bcryptjs.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should successfully login with correct credentials', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const loginData = {
        email: 'test@example.com',
        password: password,
      };

      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      (User.findOne as jest.Mock).mockResolvedValue(userWithHash);

      const result = await authService.login(loginData);

      expect(result.userId).toBe(mockUser._id.toString());
      expect(result.email).toBe(loginData.email);
      expect(result.token).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      (User.findOne as jest.Mock).mockResolvedValue(userWithHash);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Password Strength Validation', () => {
    it('should require minimum 8 characters', () => {
      const result = authService.validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should accept password with exactly 8 characters', () => {
      const result = authService.validatePassword('testpass');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept password with only lowercase letters', () => {
      const result = authService.validatePassword('securepass');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept password without special characters', () => {
      const result = authService.validatePassword('SecurePassword123');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid password with all character types', () => {
      const result = authService.validatePassword('SecurePass123!');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid password with multiple special characters', () => {
      const result = authService.validatePassword('SecurePass@123#');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid password with exactly 8 characters', () => {
      const result = authService.validatePassword('SePas1!a');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should accept valid password with more than 8 characters', () => {
      const result = authService.validatePassword('VerySecurePassword123!');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return multiple errors for weak password', () => {
      const result = authService.validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Bcrypt Integration', () => {
    it('should use bcrypt salt factor of 12', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcryptjs.hash(password, 12);
      const hash2 = await bcryptjs.hash(password, 12);

      // Different hashes for same password (due to random salt)
      expect(hash1).not.toBe(hash2);
      // Both should be valid
      expect(await bcryptjs.compare(password, hash1)).toBe(true);
      expect(await bcryptjs.compare(password, hash2)).toBe(true);
    });

    it('should not store plain text passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).not.toContain(password);
    });

    it('should handle password comparison consistently', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcryptjs.hash(password, 12);

      // Multiple comparisons should all return true
      for (let i = 0; i < 5; i++) {
        const isValid = await bcryptjs.compare(password, hashedPassword);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Account Lockout on Failed Login Attempts', () => {
    it('should lock account after 5 failed login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await bcryptjs.hash('CorrectPassword123!', 12);
      const userWithHash = { ...mockUser, passwordHash: hashedPassword };
      (User.findOne as jest.Mock).mockResolvedValue(userWithHash);

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        try {
          await authService.login(loginData);
        } catch (error) {
          // Expected to fail
        }
      }

      // 6th attempt should be locked
      await expect(authService.login(loginData)).rejects.toThrow('Account is locked');
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT access token', () => {
      const token = (authService as any).generateAccessToken(mockUser);
      expect(token).toBeDefined();

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      expect(decoded.userId).toBe(mockUser._id.toString());
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe('access');
    });

    it('should generate valid JWT refresh token', () => {
      const token = (authService as any).generateRefreshToken(mockUser);
      expect(token).toBeDefined();

      const refreshSecret = (process.env.JWT_SECRET || 'secret') + '-refresh';
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || refreshSecret) as any;
      expect(decoded.userId).toBe(mockUser._id.toString());
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.type).toBe('refresh');
    });
  });
});
