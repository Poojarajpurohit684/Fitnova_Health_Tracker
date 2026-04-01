import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { WorkoutService } from '../../services/workout.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="workouts-wrapper">
      <div class="workouts-header">
        <div>
          <h1>My Workouts</h1>
          <p class="subtitle">Track your fitness journey</p>
        </div>
        <div class="header-actions">
          <button (click)="openAddWorkoutForm()" class="btn btn-primary" [disabled]="loading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Workout
          </button>
          <button (click)="loadWorkouts()" class="btn btn-secondary" [disabled]="loading">
            <svg *ngIf="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
            </svg>
            <span *ngIf="!loading">Refresh</span>
            <span *ngIf="loading">Loading...</span>
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your workouts...</p>
      </div>

      <div *ngIf="error" class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong>Failed to load workouts</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <div *ngIf="!loading && workouts.length === 0 && !error" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 4h12v2H6z"></path>
          <path d="M6 10h12v10H6z"></path>
          <path d="M9 14h6"></path>
        </svg>
        <h3>No workouts yet</h3>
        <p>Start your fitness journey by logging your first workout!</p>
      </div>

      <div *ngIf="!loading && workouts.length > 0" class="workouts-grid">

      <div *ngFor="let workout of workouts" class="workout-card" (click)="goToDetail(workout)">
          <div class="workout-header">
            <span class="exercise-icon">{{ getExerciseIcon(workout.exerciseType) }}</span>
            <h3>{{ workout.exerciseType }}</h3>
          </div>

          <div class="workout-stats">
            <div class="stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div>
                <span class="stat-label">Duration</span>
                <span class="stat-value">{{ workout.duration }} min</span>
              </div>
            </div>

            <div class="stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <div>
                <span class="stat-label">Intensity</span>
                <span class="stat-value">{{ workout.intensity }}/10</span>
              </div>
            </div>

            <div class="stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <div>
                <span class="stat-label">Calories</span>
                <span class="stat-value">{{ workout.caloriesBurned }}</span>
              </div>
            </div>
          </div>

          <div class="workout-date">
            {{ workout.createdAt | date: 'MMM dd, yyyy' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #10B981;
      --secondary: #3B82F6;
      --accent: #6EE7B7;
      --text: #111827;
      --text-light: #6B7280;
      --border: #E5E7EB;
      --light: #F9FAFB;
      --error: #EF4444;
    }

    .workouts-wrapper {
      width: 100%;
    }

    .workouts-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .workouts-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: var(--primary);
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: var(--text-light);
      font-size: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.2);
      background: #059669;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.1);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--light);
      border-color: var(--primary);
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert {
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .alert svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .alert strong {
      display: block;
      margin-bottom: 0.5rem;
    }

    .alert p {
      margin: 0;
      font-size: 0.9rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      background: white;
      border-radius: 16px;
      border: 1px solid var(--border);
    }

    .empty-state svg {
      width: 48px;
      height: 48px;
      color: var(--secondary);
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: var(--primary);
    }

    .empty-state p {
      margin: 0;
      color: var(--text-light);
    }

    .workouts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .workout-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: 1px solid var(--border);
    }

    .workout-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .workout-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .exercise-icon {
      font-size: 1.75rem;
    }

    .workout-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--primary);
      font-weight: 600;
    }

    .workout-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stat svg {
      width: 18px;
      height: 18px;
      color: var(--secondary);
      flex-shrink: 0;
    }

    .stat-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-light);
      font-weight: 500;
    }

    .stat-value {
      display: block;
      font-size: 1.1rem;
      color: var(--primary);
      font-weight: 700;
    }

    .workout-date {
      font-size: 0.85rem;
      color: var(--text-light);
      text-align: right;
    }

    .menu-wrapper {
  margin-left: auto;
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.menu-btn:hover {
  color: white;
}

.menu-dropdown {
  position: absolute;
  top: 25px;
  right: 0;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  min-width: 120px;
}

.menu-dropdown button {
  background: none;
  border: none;
  color: white;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
}

.menu-dropdown button:hover {
  background: rgba(255,255,255,0.08);
}

    @media (max-width: 768px) {
      .workouts-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .workouts-grid {
        grid-template-columns: 1fr;
      }

      .workouts-header h1 {
        font-size: 1.5rem;
      }
    }
  `],
})
export class WorkoutListComponent implements OnInit, OnDestroy {
  workouts$: Observable<any[]> = new Observable();
  workouts: any[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  activeMenuId: string | null = null;

  constructor(
    private workoutService: WorkoutService,
    private modalService: ModalService,
    private userContext: UserContextService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.loadWorkouts();
    // Refresh workouts when navigating back to this page
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: any) => event.url.includes('/workouts')),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadWorkouts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkouts(): void {
    this.loading = true;
    this.error = null;

    this.userContext.userId$
      .pipe(
        switchMap(userId => {
          if (!userId) {
            this.loading = false;
            return of([]);
          }
          return this.workoutService.getWorkouts();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          console.log('WorkoutListComponent: Received response:', response);
          // Response should be an array from the service
          if (Array.isArray(response)) {
            this.workouts = response;
            console.log('WorkoutListComponent: Set workouts array:', this.workouts);
          } else {
            console.warn('WorkoutListComponent: Response is not an array:', response);
            this.workouts = [];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading workouts:', err);
          this.loading = false;
          this.workouts = [];
          if (err.status !== 0) {
            this.error = 'Unable to fetch workouts. Please try again.';
            this.modalService.error(this.error);
          }
        },
      });
  }

  getExerciseIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Running': '🏃',
      'Weight Training': '🏋️',
      'Cycling': '🚴',
      'Swimming': '🏊',
      'HIIT': '⚡',
    };
    return icons[type] || '💪';
  }

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  editWorkout(workout: any) {
    this.router.navigate(['/workouts', workout._id, 'edit']);
  }

  deleteWorkout(workout: any): void {
    this.modalService.confirm(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.workoutService.deleteWorkout(workout._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadWorkouts();
              this.modalService.success('Workout deleted');
            },
            error: (err) => {
              console.error('Error deleting workout:', err);
              this.modalService.error('Failed to delete workout');
            }
          });
      }
    });
  }

  openAddWorkoutForm(): void {
    this.router.navigate(['/workouts/create']);
  }

  goToDetail(workout: any) {
    this.router.navigate(['/workouts', workout._id]);
  }
}
