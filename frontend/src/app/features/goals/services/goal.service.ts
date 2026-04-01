import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export interface Goal {
  _id?: string;
  userId?: string;
  goalType: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility';
  targetValue: number;
  initialValue?: number;
  currentValue: number;
  unit: string;
  targetDate: Date;
  startDate: Date;
  status: 'active' | 'completed' | 'abandoned';
  description?: string;
  progress?: number;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private readonly CACHE_KEY_GOALS = 'goals_cache';

  constructor(
    private api: ApiService,
    private userContext: UserContextService
  ) {}

  /**
   * Create a new goal for the authenticated user
   * Invalidates cache after successful creation
   * Updates UserContextService with new goal
   */
  createGoal(data: Goal): Observable<any> {
    return this.api.post('/goals', data).pipe(
      tap((response: any) => {
        this.invalidateCache();
        this.userContext.addGoal(response);
      })
    );
  }

  /**
   * Get goals for the authenticated user with pagination
   */
  getGoals(status?: string, limit: number = 10, offset: number = 0): Observable<any> {
    const params: any = { limit, offset };
    if (status) params.status = status;

    return this.api.get('/goals', params).pipe(
      map((response: any) => {
        const data = response.items || response || [];
        return { data, items: data, total: data.length };
      }),
      catchError((error: any) => {
        void error;
        return of({ data: [], items: [], total: 0 });
      })
    );
  }

  /**
   * Get a specific goal for the authenticated user
   * Verifies goal belongs to user
   */
  getGoal(id: string): Observable<any> {
    return this.api.get(`/goals/${id}`);
  }

  /**
   * Update a goal for the authenticated user
   * Verifies goal belongs to user
   * Invalidates cache after successful update
   * Updates UserContextService with updated goal
   */
  updateGoal(id: string, data: Partial<Goal>): Observable<any> {
    return this.api.put(`/goals/${id}`, data).pipe(
      tap((response: any) => {
        this.invalidateCache();
        this.userContext.updateGoal(id, response.data || response);
      })
    );
  }

  /**
   * Delete a goal for the authenticated user
   * Verifies goal belongs to user
   * Invalidates cache after successful deletion
   * Updates UserContextService by removing goal
   */
  deleteGoal(id: string): Observable<any> {
    return this.api.delete(`/goals/${id}`).pipe(
      tap(() => {
        this.invalidateCache();
        this.userContext.removeGoal(id);
      })
    );
  }

  /**
   * Calculate progress percentage for a goal
   */
  calculateProgress(goal: Goal): number {
    if (goal.status === 'completed') {
      return 100;
    }
    
    const initial = goal.initialValue ?? goal.currentValue;
    const current = goal.currentValue;
    const target = goal.targetValue;
    let progress = 0;

    if (goal.goalType === 'weight_loss') {
      if (initial > target) {
        progress = ((initial - current) / (initial - target)) * 100;
      } else {
        progress = (current <= target) ? 100 : 0;
      }
    } else {
      if (target > initial) {
        progress = ((current - initial) / (target - initial)) * 100;
      } else {
        progress = (current / target) * 100;
      }
    }

    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  /**
   * Get icon for goal type
   */
  getGoalIcon(goalType: string): string {
    const icons: { [key: string]: string } = {
      weight_loss: '⚖️',
      muscle_gain: '💪',
      endurance: '🏃',
      strength: '🏋️',
      flexibility: '🧘',
    };
    return icons[goalType] || '🎯';
  }

  /**
   * Get days remaining until goal deadline
   */
  getDaysRemaining(targetDate: Date): number {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Invalidate goals cache
   * Called after POST/PUT/DELETE operations to ensure fresh data on next GET
   */
  private invalidateCache(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY_GOALS);
    } catch (error) {
      void error;
    }
  }
}
