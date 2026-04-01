import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap, retry, timeout, shareReplay, tap, catchError } from 'rxjs/operators';
import { OfflineService } from './offline.service';
import { APP_CONFIG } from '../config/app.config';
import { RetryStrategy } from '../utils/retry.strategy';

interface RequestCacheEntry<T> {
  observable: Observable<T>;
  timestamp: number;
}

/**
 * ApiService - Core HTTP Communication Service
 * 
 * Provides a standardized interface for all backend communication.
 * Includes automatic error handling, caching for GET requests, 
 * and environment-aware base URL configuration.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = APP_CONFIG.API.BASE_URL;
  private requestCache = new Map<string, RequestCacheEntry<any>>();
  private readonly REQUEST_TIMEOUT = APP_CONFIG.API.TIMEOUT;
  private readonly MAX_RETRIES = APP_CONFIG.API.MAX_RETRIES;
  private readonly isDevelopment = !this.isProduction();

  constructor(
    private http: HttpClient,
    private offlineService: OfflineService
  ) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    const cacheKey = this.generateCacheKey('GET', endpoint, params);
    
    // Check if request is already in flight
    if (this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      this.logRequest('GET', endpoint, 'CACHE_HIT');
      return cached.observable;
    }

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    this.logRequest('GET', endpoint, 'SENDING', params);

    const request$ = this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          const retryAfter = error.headers?.get('retry-after');
          let delayMs = Math.pow(2, retryCount) * 1000;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime() - Date.now()
              : Number(retryAfter) * 1000;
            delayMs = Math.max(delayMs, retryAfterMs);
          }

          this.logRequest('GET', endpoint, 'RETRY', { retryCount, delayMs, error: error.message });
          return timer(delayMs);
        }
      }),
      tap(response => {
        this.logRequest('GET', endpoint, 'SUCCESS', response);
        this.requestCache.delete(cacheKey);
      }),
      catchError(error => {
        this.logRequest('GET', endpoint, 'ERROR', { error: error.message, status: error.status });
        this.requestCache.delete(cacheKey);

        if (error.status === 429) {
          const retryAfter = error.headers?.get('retry-after');
          let rateLimitResetTime: number | undefined;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime()
              : Date.now() + (Number(retryAfter) * 1000);
            rateLimitResetTime = retryAfterMs;
          }

          this.offlineService.queueRequest('GET', endpoint, undefined, params, true, rateLimitResetTime);
          this.logRequest('GET', endpoint, 'QUEUED_RATE_LIMITED', { params, resetTime: rateLimitResetTime });
        }

        return throwError(() => this.handleError(error));
      }),
      shareReplay(1)
    );

    // Store in cache to deduplicate in-flight requests
    this.requestCache.set(cacheKey, {
      observable: request$,
      timestamp: Date.now()
    });

    return request$;
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    if (!this.offlineService.isOnline()) {
      this.offlineService.queueRequest('POST', endpoint, data);
      this.logRequest('POST', endpoint, 'QUEUED_OFFLINE', data);
      return throwError(() => new Error('Offline - request queued for sync'));
    }

    this.logRequest('POST', endpoint, 'SENDING', data);

    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          const retryAfter = error.headers?.get('retry-after');
          let delayMs = Math.pow(2, retryCount) * 1000;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime() - Date.now()
              : Number(retryAfter) * 1000;
            delayMs = Math.max(delayMs, retryAfterMs);
          }

          this.logRequest('POST', endpoint, 'RETRY', { retryCount, delayMs, error: error.message });
          return timer(delayMs);
        }
      }),
      tap(response => {
        this.logRequest('POST', endpoint, 'SUCCESS', response);
      }),
      catchError(error => {
        this.logRequest('POST', endpoint, 'ERROR', { error: error.message, status: error.status });

        if (error.status === 429) {
          const retryAfter = error.headers?.get('retry-after');
          let rateLimitResetTime: number | undefined;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime()
              : Date.now() + (Number(retryAfter) * 1000);
            rateLimitResetTime = retryAfterMs;
          }

          this.offlineService.queueRequest('POST', endpoint, data, undefined, true, rateLimitResetTime);
          this.logRequest('POST', endpoint, 'QUEUED_RATE_LIMITED', { resetTime: rateLimitResetTime });
        } else if (!this.offlineService.isOnline()) {
          this.offlineService.queueRequest('POST', endpoint, data);
        }

        return throwError(() => this.handleError(error));
      })
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    if (!this.offlineService.isOnline()) {
      this.offlineService.queueRequest('PUT', endpoint, data);
      this.logRequest('PUT', endpoint, 'QUEUED_OFFLINE', data);
      return throwError(() => new Error('Offline - request queued for sync'));
    }

    this.logRequest('PUT', endpoint, 'SENDING', data);

    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          const retryAfter = error.headers?.get('retry-after');
          let delayMs = Math.pow(2, retryCount) * 1000;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime() - Date.now()
              : Number(retryAfter) * 1000;
            delayMs = Math.max(delayMs, retryAfterMs);
          }

          this.logRequest('PUT', endpoint, 'RETRY', { retryCount, delayMs, error: error.message });
          return timer(delayMs);
        }
      }),
      tap(response => {
        this.logRequest('PUT', endpoint, 'SUCCESS', response);
      }),
      catchError(error => {
        this.logRequest('PUT', endpoint, 'ERROR', { error: error.message });

        if (error.status === 429) {
          const retryAfter = error.headers?.get('retry-after');
          let rateLimitResetTime: number | undefined;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime()
              : Date.now() + (Number(retryAfter) * 1000);
            rateLimitResetTime = retryAfterMs;
          }

          this.offlineService.queueRequest('PUT', endpoint, data, undefined, true, rateLimitResetTime);
          this.logRequest('PUT', endpoint, 'QUEUED_RATE_LIMITED', { resetTime: rateLimitResetTime });
        } else if (!this.offlineService.isOnline()) {
          this.offlineService.queueRequest('PUT', endpoint, data);
        }

        return throwError(() => this.handleError(error));
      })
    );
  }

  delete<T>(endpoint: string, params?: any): Observable<T> {
    if (!this.offlineService.isOnline()) {
      this.offlineService.queueRequest('DELETE', endpoint, undefined, params);
      this.logRequest('DELETE', endpoint, 'QUEUED_OFFLINE', params);
      return throwError(() => new Error('Offline - request queued for sync'));
    }

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    this.logRequest('DELETE', endpoint, 'SENDING', params);

    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { params: httpParams }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          const retryAfter = error.headers?.get('retry-after');
          let delayMs = Math.pow(2, retryCount) * 1000;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime() - Date.now()
              : Number(retryAfter) * 1000;
            delayMs = Math.max(delayMs, retryAfterMs);
          }

          this.logRequest('DELETE', endpoint, 'RETRY', { retryCount, delayMs, error: error.message });
          return timer(delayMs);
        }
      }),
      tap(response => {
        this.logRequest('DELETE', endpoint, 'SUCCESS', response);
      }),
      catchError(error => {
        this.logRequest('DELETE', endpoint, 'ERROR', { error: error.message });

        if (error.status === 429) {
          const retryAfter = error.headers?.get('retry-after');
          let rateLimitResetTime: number | undefined;

          if (retryAfter) {
            const retryAfterMs = isNaN(Number(retryAfter))
              ? new Date(retryAfter).getTime()
              : Date.now() + (Number(retryAfter) * 1000);
            rateLimitResetTime = retryAfterMs;
          }

          this.offlineService.queueRequest('DELETE', endpoint, undefined, params, true, rateLimitResetTime);
          this.logRequest('DELETE', endpoint, 'QUEUED_RATE_LIMITED', { resetTime: rateLimitResetTime });
        } else if (!this.offlineService.isOnline()) {
          this.offlineService.queueRequest('DELETE', endpoint, undefined, params);
        }

        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Generate a cache key for request deduplication
   */
  private generateCacheKey(method: string, endpoint: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${method}:${endpoint}:${paramStr}`;
  }

  /**
   * Handle API errors with typed responses
   */
  private handleError(error: any): Error {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request';
          break;
        case 401:
          errorMessage = 'Unauthorized - please log in again';
          break;
        case 403:
          errorMessage = 'Forbidden - you do not have permission';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 408:
          errorMessage = 'Request timeout';
          break;
        case 429:
          errorMessage = 'Too many requests - retrying automatically';
          break;
        case 500:
          errorMessage = 'Server error - please try again later';
          break;
        default:
          errorMessage = `Error: ${error.status} ${error.statusText}`;
      }
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Request timeout - the server took too long to respond';
    }

    return new Error(errorMessage);
  }

  /**
   * Log requests and responses in development mode
   */
  private logRequest(method: string, endpoint: string, status: string, data?: any): void {
    return;
  }

  /**
   * Check if running in production
   */
  private isProduction(): boolean {
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  }
}
