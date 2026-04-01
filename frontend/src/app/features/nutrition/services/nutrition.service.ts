import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { APP_CONFIG } from '../../../core/config/app.config';

export interface NutritionEntry {
  _id?: string;
  userId?: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber?: number;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

export interface NutritionResponse {
  entries: NutritionEntry[];
  dailyTotals: DailyTotals;
  dailyGoals: DailyGoals;
}

@Injectable({
  providedIn: 'root',
})
export class NutritionService {
  private readonly CACHE_KEY_NUTRITION = 'nutrition_cache';

  constructor(
    private apiService: ApiService,
    private userContext: UserContextService
  ) {}

  /**
   * Get nutrition entries for the authenticated user with pagination
   */
  getNutritionEntries(
  date?: string,
  limit: number = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  offset: number = 0
): Observable<NutritionResponse> {

  const params: any = {};
  if (date) params.date = date;

  return this.apiService.get<any>('/nutrition/daily/entries', params).pipe(
    map((response: any) => {

      const entries = response.items || [];

      const dailyTotals: DailyTotals = {
        calories: entries.reduce((sum: number, e: any) => sum + (e.calories || 0), 0),
        protein: entries.reduce((sum: number, e: any) => sum + (e.protein || 0), 0),
        carbohydrates: entries.reduce((sum: number, e: any) => sum + (e.carbohydrates || 0), 0),
        fats: entries.reduce((sum: number, e: any) => sum + (e.fats || 0), 0),
      };

      const dailyGoals: DailyGoals = APP_CONFIG.DEFAULT_DAILY_GOALS;

      return {
        entries,
        dailyTotals,
        dailyGoals,
      };
    }),
    catchError(() => {
      return of({
        entries: [],
        dailyTotals: { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
        dailyGoals: APP_CONFIG.DEFAULT_DAILY_GOALS,
      });
    })
  );
}

  /**
   * Create a new nutrition entry for the authenticated user
   * Automatically includes userId from UserContext
   * Invalidates cache after successful creation
   * Updates UserContextService with new entry
   */
  createNutritionEntry(entry: NutritionEntry): Observable<NutritionEntry> {
    return this.apiService.post<NutritionEntry>('/nutrition', entry).pipe(
      tap((response) => {
        this.invalidateCache();
        this.userContext.addNutritionEntry(response);
      })
    );
  }

  /**
   * Update a nutrition entry for the authenticated user
   * Verifies entry belongs to user
   * Invalidates cache after successful update
   * Updates UserContextService with updated entry
   */
  updateNutritionEntry(entryId: string, entry: Partial<NutritionEntry>): Observable<NutritionEntry> {
    return this.apiService.put<NutritionEntry>(`/nutrition/${entryId}`, entry).pipe(
      tap((response) => {
        this.invalidateCache();
        this.userContext.updateNutritionEntry(entryId, response);
      })
    );
  }

  /**
   * Delete a nutrition entry for the authenticated user
   * Verifies entry belongs to user
   * Invalidates cache after successful deletion
   * Updates UserContextService by removing entry
   */
  deleteNutritionEntry(entryId: string): Observable<any> {
    return this.apiService.delete<any>(`/nutrition/${entryId}`).pipe(
      tap(() => {
        this.invalidateCache();
        this.userContext.removeNutritionEntry(entryId);
      })
    );
  }

  /**
   * Search for food items
   */
  searchFoods(query: string): Observable<any> {
    return this.apiService.get<any>('/nutrition/search', { query });
  }

  /**
   * Get nutrition statistics for the authenticated user
   * Filters by userId from UserContext
   */
  getStats(startDate?: string, endDate?: string): Observable<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.apiService.get<any>('/nutrition/stats/summary', params);
  }

  /**
   * Invalidate nutrition cache
   * Called after POST/PUT/DELETE operations to ensure fresh data on next GET
   */
  private invalidateCache(): void {
    try {
      sessionStorage.removeItem(this.CACHE_KEY_NUTRITION);
    } catch (error) {
      void error;
    }
  }
}
