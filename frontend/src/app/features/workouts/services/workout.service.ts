import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export interface Workout {
  _id?: string;
  userId?: string;
  exerciseType: string;
  duration: number;
  intensity: number;
  caloriesBurned: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private readonly CACHE_KEY_WORKOUTS = 'workouts_cache';

  constructor(
    private api: ApiService,
    private userContext: UserContextService
  ) { }

  /**
   * Create a new workout for the authenticated user
   * Invalidates cache after successful creation
   * Updates UserContextService with new workout
   */
  createWorkout(data: Workout): Observable<any> {
    return this.api.post('/workouts', data).pipe(
      tap((response: any) => {
        this.invalidateCache();
        this.userContext.addWorkout(response);
      })
    );
  }

  /**
   * Get workouts for the authenticated user with pagination
   */
  getWorkouts(limit: number = 10, offset: number = 0): Observable<any> {
    return this.api.get('/workouts', { limit, offset }).pipe(
      map((response: any) => response.items || []),
      catchError((error: any) => {
        void error;
        return of([]);
      })
    );
  }

  /**
   * Get a specific workout for the authenticated user
   * Verifies workout belongs to user
   */
  getWorkout(id: string): Observable<any> {
    return this.api.get(`/workouts/${id}`);
  }

  /**
   * Update a workout for the authenticated user
   * Verifies workout belongs to user
   * Invalidates cache after successful update
   * Updates UserContextService with updated workout
   */
  updateWorkout(id: string, data: Partial<Workout>): Observable<any> {
    return this.api.put(`/workouts/${id}`, data).pipe(
      tap((response: any) => {
        this.invalidateCache();
        this.userContext.updateWorkout(id, response);
      })
    );
  }

  /**
   * Delete a workout for the authenticated user
   * Verifies workout belongs to user
   * Invalidates cache after successful deletion
   * Updates UserContextService by removing workout
   */
  deleteWorkout(id: string): Observable<any> {
    return this.api.delete(`/workouts/${id}`).pipe(
      tap(() => {
        this.invalidateCache();
        this.userContext.removeWorkout(id);
      })
    );
  }

  /**
   * Invalidate workouts cache
   * Called after POST/PUT/DELETE operations to ensure fresh data on next GET
   */
  private invalidateCache(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY_WORKOUTS);
    } catch (error) {
      void error;
    }
  }
}
