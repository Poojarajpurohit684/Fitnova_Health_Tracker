import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';
import { UserContextService } from '../../core/services/user-context.service';
import { CardComponent } from '../../shared/components/Card/card.component';
import { ButtonComponent } from '../../shared/components/Button/button.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { ProgressBarComponent } from '../../shared/components/Loading';
import { map } from 'rxjs/operators';

/**
 * Metric Card Component - Professional Metric Display
 */
@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, CardComponent],
  template: `
    <app-card class="glass-card" [hoverable]="true">
      <div class="flex-column gap-md">
        <div class="flex-row justify-between items-center">
          <div class="icon-wrapper" [class]="variant">
            <ng-content select="[icon]"></ng-content>
          </div>
          <div class="trend" *ngIf="trend !== null" [class.positive]="trend > 0">
            <span class="material-icons text-xs">{{ trend > 0 ? 'trending_up' : 'trending_down' }}</span>
            <span class="text-xs font-bold">{{ Math.abs(trend) }}%</span>
          </div>
        </div>
        <div class="flex-column">
          <span class="text-2xl font-black">{{ value }}</span>
          <span class="text-muted text-xs font-bold uppercase tracking-wider">{{ label }}</span>
        </div>
        <div class="progress-container" *ngIf="progress !== null">
          <div class="progress-bar" [style.width.%]="progress" [class]="variant"></div>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
    }
    .icon-wrapper.primary { color: var(--color-primary-base); background: rgba(99, 102, 241, 0.1); }
    .icon-wrapper.secondary { color: var(--color-accent-base); background: rgba(6, 182, 212, 0.1); }
    .icon-wrapper.accent { color: var(--color-error); background: rgba(239, 68, 68, 0.1); }
    .icon-wrapper.success { color: var(--color-success); background: rgba(16, 185, 129, 0.1); }

    .trend {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-error);
    }
    .trend.positive {
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-success);
    }

    .progress-container {
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 4px;
    }
    .progress-bar { height: 100%; border-radius: 2px; transition: width 1s ease; }
    .progress-bar.primary { background: var(--color-primary-base); }
    .progress-bar.secondary { background: var(--color-accent-base); }
    .progress-bar.accent { background: var(--color-error); }
    .progress-bar.success { background: var(--color-success); }
  `]
})
export class MetricCardComponent {
  @Input() value: string | number | null = '0';
  @Input() label: string = 'Metric';
  @Input() trend: number | null = null;
  @Input() progress: number | null = null;
  @Input() variant: 'primary' | 'secondary' | 'accent' | 'success' = 'primary';

  Math = Math;
}

/**
 * DashboardComponent - User Performance Overview
 * 
 * The primary landing page for authenticated users.
 * Displays high-level metrics, recent activities, and goal progress
 * using an enterprise-grade responsive layout.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, LogoComponent, MetricCardComponent, ProgressBarComponent],
  template: `
    <div class="container">
      <!-- Hero Section -->
      <header class="flex-row justify-between items-center flex-stack gap-lg" style="margin-bottom: 3rem;">
        <div class="flex-column gap-xs">
          <div class="flex-row items-center gap-sm">
            <span class="text-primary font-bold text-xs uppercase tracking-widest">{{ userLevel }}</span>
            <div style="width: 4px; height: 4px; border-radius: 50%; background: var(--color-text-dim);"></div>
            <span class="text-dim text-xs uppercase font-bold tracking-widest">Streak: {{ streak }} Days</span>
          </div>
          <h1 class="text-4xl font-black">Welcome back, {{ userName }}!</h1>
          <p class="text-muted text-lg">{{ userGreeting }}</p>
        </div>
        <div class="flex-row gap-md flex-stack">
          <app-button variant="primary" routerLink="/workouts" class="w-full-mobile">
            <span class="material-icons">play_circle</span>
            Start Session
          </app-button>
          <app-button variant="glass" routerLink="/nutrition" class="w-full-mobile">
            <span class="material-icons">restaurant</span>
            Log Meal
          </app-button>
        </div>
      </header>

      <!-- Metrics Bento Grid -->
      <div *ngIf="!loading && !error" class="section">
      <div class="grid grid-cols-4" style="margin-bottom: 3rem;">
        <app-metric-card 
          [value]="weeklyWorkouts" 
          label="Workouts / Week"
          [trend]="workoutTrend"
          [progress]="(weeklyWorkouts / 5) * 100"
          variant="primary">
          <span icon class="material-icons">fitness_center</span>
        </app-metric-card>

        <app-metric-card 
          [value]="totalCalories | number" 
          label="Calories Burned"
          [trend]="caloriesTrend"
          [progress]="(totalCalories / 2500) * 100"
          variant="accent">
          <span icon class="material-icons">local_fire_department</span>
        </app-metric-card>

        <app-metric-card 
          [value]="totalMinutes" 
          label="Training Minutes"
          [trend]="minutesTrend"
          [progress]="(totalMinutes / 150) * 100"
          variant="secondary">
          <span icon class="material-icons">timer</span>
        </app-metric-card>

        <app-metric-card 
          [value]="activeGoals" 
          label="Active Goals"
          [trend]="null"
          [progress]="(activeGoals / 5) * 100"
          variant="success">
          <span icon class="material-icons">track_changes</span>
        </app-metric-card>
      </div>
      </div>

      <!-- Content Row -->
      <div class="grid dashboard-content-grid" style="gap: 2rem;">
        <!-- Recent Activity -->
        <div *ngIf="!loading && !error" class="section">
        <section class="flex-column gap-lg">
          <div class="flex-row justify-between items-center">
            <h2 class="text-xl font-bold">Recent Activity</h2>
            <a routerLink="/workouts" class="text-sm font-bold text-primary no-underline hover:underline">View All</a>
          </div>
          
          <div class="flex-column gap-md" *ngIf="(recentWorkouts$ | async) as workouts">
            <app-card *ngFor="let workout of (workouts || []).slice(0, 4)" class="glass-card" [hoverable]="true" [clickable]="true" (click)="openWorkout(workout)">
              <div class="flex-row items-center gap-md">
                <div style="width: 48px; height: 48px; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.1); color: var(--color-primary-base); display: flex; align-items: center; justify-content: center;">
                  <span class="material-icons">{{ getExerciseIcon(workout.exerciseType) }}</span>
                </div>
                <div class="flex-column flex-1">
                  <span class="font-bold text-sm-mobile">{{ workout.exerciseType }}</span>
                  <div class="flex-row items-center gap-sm text-xs text-muted wrap">
                    <span>{{ workout.duration }}m</span>
                    <span>•</span>
                    <span>{{ workout.caloriesBurned }} kcal</span>
                    <span class="mobile-hide">•</span>
                    <span class="mobile-hide">{{ workout.createdAt | date: 'shortTime' }}</span>
                  </div>
                </div>
                <span class="material-icons text-dim">chevron_right</span>
              </div>
            </app-card>
          </div>
        </section>
        </div>

        <!-- Goals Progress -->
        <div *ngIf="!loading && !error" class="section">  
        <section class="flex-column gap-lg">
          <div class="flex-row justify-between items-center">
            <h2 class="text-xl font-bold">Goals</h2>
            <a routerLink="/goals" class="text-sm font-bold text-primary no-underline hover:underline">Manage</a>
          </div>

          <div class="flex-column gap-md" *ngIf="(goals$ | async) as goals">
          
            <app-card *ngFor="let goal of (goals || []).slice(0, 3)" class="glass-card">
  <div class="flex-row items-center gap-md">

    <div class="goal-icon mobile-hide">
      <span class="material-icons">flag</span>
    </div>

    <div class="flex-column flex-1">
      <div class="flex-row justify-between items-center">
        <span class="font-bold text-sm">{{ goal.name }}</span>
        <span class="text-primary font-black">{{ goal.progress || 0 }}%</span>
      </div>

      <app-progress-bar 
        [value]="goal.progress || 0" 
        size="sm">
      </app-progress-bar>

      <div class="flex-row justify-between text-xs text-dim">
        <span>{{ goal.currentValue || 0 }} / {{ goal.targetValue }}</span>
        <span *ngIf="goal.deadline">{{ goal.deadline | date:'MMM d' }}</span>
      </div>
    </div>

  </div>
</app-card>
          </div>
        </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding-top: 2rem; padding-bottom: 4rem; }
    a { transition: color 0.2s; }

    .dashboard-content-grid {
      grid-template-columns: 1.5fr 1fr;
    }

    @media (max-width: 1024px) {
      .dashboard-content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .w-full-mobile { width: 100%; }
      .text-sm-mobile { font-size: 0.875rem; }
    }

    .goal-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  weeklyWorkouts = 0;
  totalCalories = 0;
  totalMinutes = 0;
  activeGoals = 0;
  streak = 0;
  userLevel = 'Beginner';
  userName = '';
  userGreeting = '';
  loading = false;
  error: string | null = null;

  workoutTrend: number | null = 12;
  caloriesTrend: number | null = -5;
  minutesTrend: number | null = 8;

  recentWorkouts$: Observable<any[]>;
  goals$: Observable<any[]>;
  user$: Observable<any>;

  private destroy$ = new Subject<void>();

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private userContext: UserContextService,
    private router: Router
  ) {
    this.user$ = this.userContext.user$;
    this.recentWorkouts$ = new Observable();
    this.goals$ = new Observable();
  }

  calculateStreak(workouts: any[]) {
    if (!workouts.length) {
      this.streak = 0;
      return;
    }

    const uniqueDays = Array.from(
      new Set(workouts.map(w => new Date(w.createdAt).toDateString()))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let current = new Date();

    for (let date of uniqueDays) {
      const d = new Date(date);

      if (
        d.toDateString() === current.toDateString() ||
        d.toDateString() === new Date(current.setDate(current.getDate() - 1)).toDateString()
      ) {
        streak++;
        current = new Date(d);
      } else {
        break;
      }
    }

    this.streak = streak;
  }

  calculateLevel(totalWorkouts: number): string {
    if (totalWorkouts < 10) return 'Beginner';
    if (totalWorkouts < 30) return 'Intermediate';
    if (totalWorkouts < 60) return 'Advanced';
    return 'Elite Athlete';
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile() {
    this.userContext.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = user.name || 'Athlete';
          this.userGreeting = this.getPersonalizedGreeting(user);
        }
      });
  }

  getPersonalizedGreeting(user: any): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Ready for your morning session?';
    if (hour < 18) return 'Keeping up the momentum?';
    return 'Finish your day strong.';
  }

  openWorkout(workout: any) {
    console.log('Clicked workout:', workout);

    // Option 1: Navigate to workouts page
    // this.router.navigate(['/workouts']);

    // Option 2 (better): Navigate to specific workout
    this.router.navigate(['/workouts', workout._id]);
  }

  loadDashboardData() {
    this.recentWorkouts$ = this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) return of([]);
        return this.apiService.get<any>('/workouts', { limit: 5 });
      }),
      tap(response => {
        const workouts = response?.items || [];

        this.weeklyWorkouts = workouts.length;
        this.totalCalories = workouts.reduce((sum: number, w: any) => sum + (w.caloriesBurned || 0), 0);
        this.totalMinutes = workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0);

        this.calculateStreak(workouts);
        this.userLevel = this.calculateLevel(workouts.length);
      }),
      map(response => (response?.items || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )),
      map(response => Array.isArray(response) ? response : (response?.items || [])),
      takeUntil(this.destroy$)
    );

    this.goals$ = this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) return of([]);
        return this.apiService.get<any>('/goals', { status: 'active' });
      }),
      tap(response => {
        const goals = Array.isArray(response) ? response : (response?.items || []);

        this.activeGoals = goals.length;

        goals.forEach((goal: any) => {
          if (goal.currentValue !== undefined && goal.targetValue) {
            goal.progress = Math.min(
              (goal.currentValue / goal.targetValue) * 100,
              100
            );
          } else {
            goal.progress = 0;
          }
        });
      }),
      map(response => Array.isArray(response) ? response : (response?.items || [])),
      takeUntil(this.destroy$)
    );
  }

  /**
   * getExerciseIcon - Utility
   * Maps workout types to Material Design icons for consistent visual cues.
   */
  getExerciseIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Running': 'directions_run',
      'Cycling': 'directions_bike',
      'Swimming': 'pool',
      'Weight Training': 'fitness_center',
      'HIIT': 'bolt',
      'Yoga': 'self_improvement',
      'Walking': 'directions_walk'
    };

    return icons[type] || 'fitness_center';
  }
}
