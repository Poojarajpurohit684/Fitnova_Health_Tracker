/**
 * Shared Retry Strategy Utility
 * Centralized retry logic with exponential backoff
 */

import { timer } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

export class RetryStrategy {
  /**
   * Calculate retry delay with exponential backoff
   * Respects retry-after header if present
   */
  static calculateDelay(error: any, retryCount: number): number {
    const baseDelay = APP_CONFIG.API.RETRY_DELAY_BASE;
    let delayMs = Math.pow(2, retryCount) * baseDelay; // Exponential: 1s, 2s, 4s, 8s...

    // Check for retry-after header (rate limit response)
    const retryAfter = error.headers?.get('retry-after');
    if (retryAfter) {
      const retryAfterMs = isNaN(Number(retryAfter))
        ? new Date(retryAfter).getTime() - Date.now()
        : Number(retryAfter) * 1000;
      delayMs = Math.max(delayMs, retryAfterMs);
    }

    return delayMs;
  }

  /**
   * Get retry timer observable
   */
  static getRetryTimer(error: any, retryCount: number) {
    const delayMs = this.calculateDelay(error, retryCount);
    return timer(delayMs);
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: any): boolean {
    // Don't retry 4xx errors (except 429 rate limit)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }
    // Retry 5xx errors and 429 rate limit
    return error.status >= 500 || error.status === 429;
  }

  /**
   * Check if error is rate limited
   */
  static isRateLimited(error: any): boolean {
    return error.status === 429;
  }
}
