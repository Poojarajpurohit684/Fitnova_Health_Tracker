import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

/**
 * Queued Request Interface
 * Represents a request that was made while offline
 */
export interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  params?: any;
  timestamp: number;
  retryCount: number;
  rateLimited?: boolean;
  rateLimitResetTime?: number;
}

/**
 * OfflineService
 * Manages offline/online status and queues requests when offline
 * Syncs queued requests when coming back online
 */
@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private readonly QUEUE_STORAGE_KEY = 'offline_request_queue';
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  // BehaviorSubjects for reactive state management
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private queueSubject = new BehaviorSubject<QueuedRequest[]>([]);
  private syncingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public isOnline$ = this.isOnlineSubject.asObservable();
  public queue$ = this.queueSubject.asObservable();
  public isSyncing$ = this.syncingSubject.asObservable();

  constructor() {
    this.initializeOnlineStatusListener();
    this.loadQueueFromStorage();
  }

  /**
   * Initialize online/offline status listener
   * Listens to online and offline events
   */
  private initializeOnlineStatusListener(): void {
    merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(
      debounceTime(500),
      map(() => navigator.onLine),
      startWith(navigator.onLine)
    ).subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);
      if (isOnline) {
        this.syncQueuedRequests();
      }
    });
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  /**
   * Add a request to the queue
   * Called when a request fails due to offline status or rate limiting
   */
  queueRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any, params?: any, rateLimited: boolean = false, rateLimitResetTime?: number): void {
    const request: QueuedRequest = {
      id: this.generateRequestId(),
      method,
      endpoint,
      data,
      params,
      timestamp: Date.now(),
      retryCount: 0,
      rateLimited,
      rateLimitResetTime,
    };

    const current = this.queueSubject.value;
    this.queueSubject.next([...current, request]);
    this.saveQueueToStorage();
  }

  /**
   * Get all queued requests
   */
  getQueuedRequests(): QueuedRequest[] {
    return this.queueSubject.value;
  }

  /**
   * Remove a request from the queue
   */
  removeFromQueue(requestId: string): void {
    const current = this.queueSubject.value;
    this.queueSubject.next(current.filter(r => r.id !== requestId));
    this.saveQueueToStorage();
  }

  /**
   * Clear all queued requests
   */
  clearQueue(): void {
    this.queueSubject.next([]);
    this.clearQueueFromStorage();
  }

  /**
   * Sync queued requests when coming back online
   * Retries failed requests with exponential backoff
   * Respects rate limit reset times
   */
  async syncQueuedRequests(): Promise<void> {
    if (this.syncingSubject.value || !this.isOnlineSubject.value) {
      return;
    }

    this.syncingSubject.next(true);
    const queue = this.queueSubject.value;

    for (const request of queue) {
      try {
        // Skip rate-limited requests until reset time
        if (request.rateLimited && request.rateLimitResetTime) {
          const now = Date.now();
          if (now < request.rateLimitResetTime) {
            const waitTime = request.rateLimitResetTime - now;
            this.logRequest(`Waiting ${waitTime}ms for rate limit reset on ${request.endpoint}`);
            continue;
          }
        }

        await this.retryRequest(request);
        this.removeFromQueue(request.id);
      } catch (error) {
        console.error(`Failed to sync request ${request.id}:`, error);
        // Update retry count
        const updated = queue.find(r => r.id === request.id);
        if (updated) {
          updated.retryCount++;
          if (updated.retryCount >= this.MAX_RETRIES) {
            this.removeFromQueue(request.id);
            console.error(`Request ${request.id} exceeded max retries`);
          }
        }
      }
    }

    this.syncingSubject.next(false);
  }

  /**
   * Retry a request with exponential backoff
   */
  private async retryRequest(request: QueuedRequest): Promise<void> {
    const delay = this.calculateBackoffDelay(request.retryCount);
    await this.sleep(delay);

    // This would be called by the ApiService to actually retry the request
    // For now, we just track that it should be retried
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(retryCount: number): number {
    return this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save queue to localStorage for persistence
   */
  private saveQueueToStorage(): void {
    try {
      const queue = this.queueSubject.value;
      localStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue to storage:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.QUEUE_STORAGE_KEY);
      if (stored) {
        const queue = JSON.parse(stored) as QueuedRequest[];
        this.queueSubject.next(queue);
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
    }
  }

  /**
   * Clear queue from localStorage
   */
  private clearQueueFromStorage(): void {
    try {
      localStorage.removeItem(this.QUEUE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear queue from storage:', error);
    }
  }

  /**
   * Log offline service messages
   */
  private logRequest(message: string): void {
    return;
  }
}
