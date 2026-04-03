import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  height: number;
  currentWeight: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  userId: string;
  email: string;
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: Partial<IUser>;
}

interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export class AuthService {
  private saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  private jwtSecret = process.env.JWT_SECRET || 'secret';
  private jwtExpiration = process.env.JWT_EXPIRATION || '24h';
  private refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
  private maxLoginAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private loginAttempts = new Map<string, { count: number; timestamp: number }>();

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Check if email exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Validate password strength
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(data.password, this.saltRounds);

    // Create user
    const user = new User({
      email: data.email.toLowerCase(),
      username: data.email.split('@')[0],
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      height: data.height,
      currentWeight: data.currentWeight,
      targetWeight: data.currentWeight,
      activityLevel: 'moderate',
      isEmailVerified: false,
    });

    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      userId: user._id.toString(),
      email: user.email,
      token: accessToken,
      refreshToken,
      expiresIn: this.jwtExpiration,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        height: user.height,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        activityLevel: user.activityLevel,
      },
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    // Check for account lockout
    this.checkAccountLockout(data.email);

    // Find user
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      this.recordFailedAttempt(data.email);
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      this.recordFailedAttempt(data.email);
      throw new Error('Invalid credentials');
    }

    // Clear failed attempts on successful login
    this.loginAttempts.delete(data.email.toLowerCase());

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      userId: user._id.toString(),
      email: user.email,
      token: accessToken,
      refreshToken,
      expiresIn: this.jwtExpiration,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        height: user.height,
        currentWeight: user.currentWeight,
        targetWeight: user.targetWeight,
        activityLevel: user.activityLevel,
      },
    };
  }

  generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: 'access',
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    } as any);
  }

  private generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      type: 'refresh',
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiration,
    } as any);
  }

  private recordFailedAttempt(email: string): void {
    const emailLower = email.toLowerCase();
    const now = Date.now();
    const attempt = this.loginAttempts.get(emailLower);

    if (attempt && now - attempt.timestamp < this.lockoutDuration) {
      attempt.count++;
    } else {
      this.loginAttempts.set(emailLower, { count: 1, timestamp: now });
    }

    if (this.loginAttempts.get(emailLower)!.count >= this.maxLoginAttempts) {
      throw new Error('Account temporarily locked due to too many failed login attempts. Try again in 15 minutes.');
    }
  }

  private checkAccountLockout(email: string): void {
    const emailLower = email.toLowerCase();
    const attempt = this.loginAttempts.get(emailLower);

    if (attempt && attempt.count >= this.maxLoginAttempts) {
      const now = Date.now();
      const timePassed = now - attempt.timestamp;

      if (timePassed < this.lockoutDuration) {
        const minutesRemaining = Math.ceil((this.lockoutDuration - timePassed) / 60000);
        throw new Error(`Account is locked. Try again in ${minutesRemaining} minutes.`);
      } else {
        this.loginAttempts.delete(emailLower);
      }
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      console.log('🔐 AuthService.verifyToken - Token length:', token.length);
      console.log('🔐 AuthService.verifyToken - Token preview:', token.substring(0, 50) + '...');
      console.log('🔐 AuthService.verifyToken - JWT_SECRET:', this.jwtSecret ? '✅ Set' : '❌ Not set');
      console.log('🔐 AuthService.verifyToken - JWT_SECRET length:', this.jwtSecret.length);
      
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      console.log('🔐 AuthService.verifyToken - Token decoded successfully');
      console.log('🔐 AuthService.verifyToken - Decoded payload:', JSON.stringify(decoded, null, 2));
      
      if (decoded.type !== 'access') {
        console.error('❌ AuthService.verifyToken - Invalid token type:', decoded.type);
        throw new Error('Invalid token type');
      }
      
      console.log('✅ AuthService.verifyToken - Token is valid access token');
      return decoded;
    } catch (error: any) {
      console.error('❌ AuthService.verifyToken - Verification failed:', error.message);
      console.error('❌ AuthService.verifyToken - Error name:', error.name);
      console.error('❌ AuthService.verifyToken - Error details:', error);
      throw new Error('Invalid or expired token');
    }
  }

  refreshAccessToken(refreshToken: string): { token: string; expiresIn: string } {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as TokenPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, type: 'access' },
        this.jwtSecret,
        { expiresIn: this.jwtExpiration } as any
      );

      return {
        token: newAccessToken,
        expiresIn: this.jwtExpiration,
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Requirement: 12+ characters
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters');
    }
    // Requirement: At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    // Requirement: At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    // Requirement: At least one number
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    // Requirement: At least one special character
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }
}
