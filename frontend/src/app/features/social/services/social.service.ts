import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UserContextService } from '../../../core/services/user-context.service';

export interface Connection {
  _id: string;
  userId: string;
  connectedUserId: string;
  connectedUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityFeed {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  activityType: 'workout' | 'goal_achieved' | 'connection_made' | 'milestone';
  relatedEntityId: string;
  relatedEntityType: string;
  description: string;
  visibility: 'public' | 'connections' | 'private';
  createdAt: Date;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  currentWeight?: number;
  targetWeight?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SocialService {
  private apiUrl = environment.apiUrl;
  private readonly CACHE_KEY_CONNECTIONS = 'connections_cache';

  constructor(
    private http: HttpClient,
    private userContext: UserContextService
  ) {}

  /**
   * Send a connection request from authenticated user
   * Automatically includes userId from UserContext
   * Invalidates cache after successful request
   * Updates UserContextService with new connection
   */
  sendConnectionRequest(connectedUserId: string): Observable<Connection> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.post<Connection>(`${this.apiUrl}/connections/request`, {
          userId,
          connectedUserId,
        }).pipe(
          tap((response) => {
            this.invalidateCache();
            this.userContext.addConnection(response);
          })
        );
      })
    );
  }

  /**
   * Get connections for the authenticated user with pagination
   * Filters by userId from UserContext
   */
  getConnections(status?: string, limit: number = 20, offset: number = 0): Observable<{
    connections: Connection[];
    total: number;
  }> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return of({ connections: [], total: 0 });
        }
        let url = `${this.apiUrl}/connections?limit=${limit}&offset=${offset}`;
        if (status) {
          url += `&status=${status}`;
        }
        return this.http.get<{ connections: Connection[]; total: number }>(url);
      })
    );
  }

  /**
   * Accept a connection request for the authenticated user
   * Verifies connection belongs to user
   * Invalidates cache after successful acceptance
   * Updates UserContextService with updated connection
   */
  acceptConnectionRequest(connectionId: string): Observable<Connection> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.put<Connection>(`${this.apiUrl}/connections/${connectionId}`, { status: 'accepted' }).pipe(
          tap((response) => {
            this.invalidateCache();
            this.userContext.updateConnection(connectionId, response);
          })
        );
      })
    );
  }

  /**
   * Reject a connection request for the authenticated user
   * Verifies connection belongs to user
   * Invalidates cache after successful rejection
   * Updates UserContextService with updated connection
   */
  rejectConnectionRequest(connectionId: string): Observable<Connection> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.put<Connection>(`${this.apiUrl}/connections/${connectionId}`, { status: 'rejected' }).pipe(
          tap((response) => {
            this.invalidateCache();
            this.userContext.updateConnection(connectionId, response);
          })
        );
      })
    );
  }

  /**
   * Remove a connection for the authenticated user
   * Verifies connection belongs to user
   * Invalidates cache after successful removal
   * Updates UserContextService by removing connection
   */
  removeConnection(connectionId: string): Observable<{ message: string }> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.delete<{ message: string }>(`${this.apiUrl}/connections/${connectionId}`).pipe(
          tap(() => {
            this.invalidateCache();
            this.userContext.removeConnection(connectionId);
          })
        );
      })
    );
  }

  /**
   * Get activity feed for the authenticated user
   * Shows only user's activities and connections' activities
   */
  getActivityFeed(limit: number = 20, offset: number = 0): Observable<{
    activities: ActivityFeed[];
    total: number;
  }> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return of({ activities: [], total: 0 });
        }
        return this.http.get<{ activities: ActivityFeed[]; total: number }>(
          `${this.apiUrl}/activity-feed?limit=${limit}&offset=${offset}`
        );
      })
    );
  }

  /**
   * Delete an activity for the authenticated user
   * Verifies activity belongs to user
   * Updates UserContextService by removing activity
   */
  deleteActivity(activityId: string): Observable<{ message: string }> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.delete<{ message: string }>(`${this.apiUrl}/activity-feed/${activityId}`).pipe(
          tap(() => {
            this.userContext.removeActivity(activityId);
          })
        );
      })
    );
  }

  /**
   * Search for users (excluding self)
   */
  searchUsers(query: string): Observable<{ users: User[] }> {
    return this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return of({ users: [] });
        }
        return this.http.get<{ users: User[] }>(`${this.apiUrl}/users/search?query=${query}&excludeUserId=${userId}`);
      })
    );
  }

  /**
   * Invalidate connections cache
   * Called after POST/PUT/DELETE operations to ensure fresh data on next GET
   */
  private invalidateCache(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY_CONNECTIONS);
    } catch (error) {
      console.error('Failed to invalidate connections cache:', error);
    }
  }
}
