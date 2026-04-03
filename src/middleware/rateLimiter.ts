import { Request, Response, NextFunction } from 'express';
import { createError, ErrorCode } from '../utils/errors';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private getKey(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      let entry = this.store.get(key);

      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + this.windowMs,
        };
        this.store.set(key, entry);
      }

      entry.count++;

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - entry.count));
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

      if (entry.count > this.maxRequests) {
        throw createError(
          ErrorCode.RATE_LIMIT,
          'Too many requests, please try again later',
          429
        );
      }

      next();
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  getStats(): { size: number; entries: number } {
    return {
      size: this.store.size,
      entries: this.store.size,
    };
  }
}

export const rateLimiter = new RateLimiter(15 * 60 * 1000, 1000); // 1000 requests per 15 minutes for normal users
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 50); // 50 requests per 15 minutes for auth
