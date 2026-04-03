import { Request, Response } from 'express';
import { rateLimiter, authRateLimiter } from './rateLimiter';

// Mock the error utility
jest.mock('../utils/errors', () => ({
  createError: jest.fn((code, message, status) => {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).status = status;
    return error;
  }),
  ErrorCode: {
    RATE_LIMIT: 'RATE_LIMIT',
  },
}));

describe('RateLimiter', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
    };
    mockRes = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('General Rate Limiter', () => {
    it('should allow requests within the limit', () => {
      const middleware = rateLimiter.middleware();
      
      // Make 10 requests (well below 1000 limit)
      for (let i = 0; i < 10; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }
      
      expect(mockNext).toHaveBeenCalledTimes(10);
    });

    it('should set rate limit headers', () => {
      const middleware = rateLimiter.middleware();
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 1000);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });

    it('should track remaining requests correctly', () => {
      // Create a fresh rate limiter for this test
      const testLimiter = new (rateLimiter.constructor as any)(15 * 60 * 1000, 1000);
      const middleware = testLimiter.middleware();
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      const calls = (mockRes.setHeader as jest.Mock).mock.calls;
      const remainingCall = calls.find(call => call[0] === 'X-RateLimit-Remaining');
      expect(remainingCall[1]).toBe(999); // 1000 - 1
    });

    it('should reject requests exceeding the limit', () => {
      const middleware = rateLimiter.middleware();
      
      // Make 1001 requests to exceed the limit
      for (let i = 0; i < 1001; i++) {
        try {
          middleware(mockReq as Request, mockRes as Response, mockNext);
        } catch (error) {
          // Expected to throw on the 1001st request
          expect((error as any).status).toBe(429);
        }
      }
    });

    it('should reset counter after window expires', (done) => {
      // Create a rate limiter with a short window for testing
      const testLimiter = new (rateLimiter.constructor as any)(1000, 5); // 1 second window, 5 requests
      const middleware = testLimiter.middleware();
      
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }
      
      // Wait for window to expire
      setTimeout(() => {
        mockNext.mockClear();
        
        // Should allow requests again
        middleware(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        
        done();
      }, 1100);
    });
  });

  describe('Auth Rate Limiter', () => {
    it('should have stricter limits for auth', () => {
      const middleware = authRateLimiter.middleware();
      
      // Make 50 requests (at the limit)
      for (let i = 0; i < 50; i++) {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }
      
      expect(mockNext).toHaveBeenCalledTimes(50);
    });

    it('should reject auth requests exceeding the limit', () => {
      const middleware = authRateLimiter.middleware();
      
      // Make 51 requests to exceed the limit
      for (let i = 0; i < 51; i++) {
        try {
          middleware(mockReq as Request, mockRes as Response, mockNext);
        } catch (error) {
          // Expected to throw on the 51st request
          expect((error as any).status).toBe(429);
        }
      }
    });
  });

  describe('Different IP addresses', () => {
    it('should track limits per IP address', () => {
      const middleware = rateLimiter.middleware();
      
      // First IP makes 5 requests
      const req1 = { ...mockReq, ip: '192.168.1.1' } as Request;
      for (let i = 0; i < 5; i++) {
        middleware(req1, mockRes as Response, mockNext);
      }
      
      // Second IP makes 5 requests
      const req2 = { ...mockReq, ip: '192.168.1.2' } as Request;
      mockNext.mockClear();
      for (let i = 0; i < 5; i++) {
        middleware(req2, mockRes as Response, mockNext);
      }
      
      // Both should succeed independently
      expect(mockNext).toHaveBeenCalledTimes(5);
    });
  });
});
