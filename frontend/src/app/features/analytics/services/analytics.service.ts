import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { HttpClient } from '@angular/common/http';

export interface AnalyticsDashboard {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration?: number;
  averageDuration: number;
  weeklyTrends: Array<{ date: string; workouts: number; calories: number }>;
  macroBreakdown: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  goals: Array<{ name: string; progress: number; target: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(
    private api: ApiService,
    private userContext: UserContextService,
    private http: HttpClient
  ) {}

  getDashboard(startDate?: Date, endDate?: Date): Observable<AnalyticsDashboard> {
    return this.userContext.userId$.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          return of({
            totalWorkouts: 0,
            totalCalories: 0,
            totalDuration: 0,
            averageDuration: 0,
            weeklyTrends: [],
            macroBreakdown: { protein: 0, carbohydrates: 0, fats: 0 },
            goals: [],
          });
        }

        const params: any = {};
        if (startDate) params.startDate = startDate.toISOString();
        if (endDate) params.endDate = endDate.toISOString();

        return this.api.get<AnalyticsDashboard>('/analytics/dashboard', params).pipe(
          catchError(() =>
            of({
              totalWorkouts: 0,
              totalCalories: 0,
              totalDuration: 0,
              averageDuration: 0,
              weeklyTrends: [],
              macroBreakdown: { protein: 0, carbohydrates: 0, fats: 0 },
              goals: [],
            })
          )
        );
      })
    );
  }

  exportPDF(startDate: Date, endDate: Date): Observable<Blob> {
    return this.http.get(`/api/v1/analytics/export`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      responseType: 'blob'
    });
  }
}