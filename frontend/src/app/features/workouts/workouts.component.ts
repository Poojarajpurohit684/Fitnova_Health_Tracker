import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { CardComponent } from '../../shared/components/Card/card.component';
import { ButtonComponent } from '../../shared/components/Button/button.component';
import { FormInputComponent } from '../../shared/components/FormInput/form-input.component';
import { WorkoutService } from './services/workout.service';
import { UserContextService } from '../../core/services/user-context.service';
import { HostListener } from '@angular/core';

import { ModalService } from '../../shared/services/modal.service';

/**
 * Workout Card Component - Standardized for Fit-Nova UI
 */
@Component({
  selector: 'app-workout-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card class="glass-card" [hoverable]="true" (click)="openDetail()">
      <div class="flex-column gap-md">
        <div class="flex-row justify-between items-start">
          <div class="flex-row gap-sm items-center">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-primary-base);">
              <span class="material-icons">{{ getExerciseIcon(workout.exerciseType) }}</span>
            </div>
            <div class="flex-column">
              <h3 class="text-md font-bold">{{ workout.exerciseType }}</h3>
              <span class="text-xs text-dim">{{ workout.createdAt | date: 'MMM dd, yyyy' }}</span>
            </div>
          </div>
          
          <div class="menu-wrapper" (click)="$event.stopPropagation()">
          <button class="menu-btn" (click)="toggleMenu()" style="background: none; border: none; color: var(--color-text-dim);">
            <span class="material-icons" style="font-size: 1.25rem;">more_vert</span>
          </button>

<div class="menu-dropdown" *ngIf="isMenuOpen">

  <button class="menu-item text-sm font-bold" (click)="onEdit()">
    <span class="material-icons">edit</span>
    <span>Edit</span>
  </button>

  <button class="menu-item danger text-sm font-bold" (click)="onDelete()">
    <span class="material-icons">delete</span>
    <span>Delete</span>
  </button>

</div>
          </div>
        </div>

        <div class="flex-row gap-lg" style="padding-top: 0.5rem; border-top: 1px solid var(--color-border-subtle);">
          <div class="flex-column">
            <span class="text-xs text-muted font-bold uppercase tracking-wider">Duration</span>
            <span class="text-sm font-black text-primary">{{ workout.duration }} min</span>
          </div>
          <div class="flex-column">
            <span class="text-xs text-muted font-bold uppercase tracking-wider">Burned</span>
            <span class="text-sm font-black text-accent">{{ workout.caloriesBurned }} kcal</span>
          </div>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .menu-wrapper {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  cursor: pointer;
}

/* ===== DROPDOWN CONTAINER ===== */
.menu-dropdown {
  position: absolute;
  top: 32px;
  right: 0;

  background: rgba(15, 23, 42, 0.85); /* glass effect */
  backdrop-filter: blur(10px);

  border: var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);

  padding: 6px;
  min-width: 180px;

  display: flex;
  flex-direction: column;
  gap: 2px;

  z-index: 1000;

  animation: fadeIn 0.15s ease;
}

.menu-dropdown button {
  background: none;
  border: none;
  color: white;
  padding: 8px;
  text-align: left;
  cursor: pointer;
}

.menu-dropdown button:hover {
  background: rgba(255,255,255,0.08);
}

/* ===== MENU ITEMS ===== */
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;
  border-radius: var(--radius-sm);

  background: transparent;
  border: none;

  color: var(--color-text-main);
  font-size: 0.9rem;
  cursor: pointer;

  transition: all var(--duration-fast) var(--easing-standard);
}

/* ICON */
.menu-item .material-icons {
  font-size: 18px;
  color: var(--color-text-dim);
}

/* HOVER */
.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* ===== DELETE (DANGER) ===== */
.menu-item.danger {
  color: var(--color-error);
}

.menu-item.danger .material-icons {
  color: var(--color-error);
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
  `]

})
export class WorkoutCardComponent {
  @Input() workout: any;

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    this.isMenuOpen = false;
  }

  constructor(
    private router: Router,
    private workoutService: WorkoutService,
    private modalService: ModalService
  ) { }

  isMenuOpen = false;

  openDetail() {
    this.router.navigate(['/workouts', this.workout._id]);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onEdit() {
    this.isMenuOpen = false;
    this.router.navigate(['/workouts', this.workout._id, 'edit']);
  }

  onDelete() {
    this.modalService.confirm(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.workoutService.deleteWorkout(this.workout._id).subscribe({
          next: () => {
            this.isMenuOpen = false;
            window.location.reload();
          }
        });
      }
    });
  }

  // getIcon(type: string): string {
  //   const icons: { [key: string]: string } = {
  //     'Running': 'directions_run',
  //     'Weight Training': 'fitness_center',
  //     'Cycling': 'directions_bike',
  //     'Swimming': 'pool',
  //     'HIIT': 'bolt',
  //   };

  getExerciseIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Running': 'directions_run',
      'Cycling': 'directions_bike',
      'Swimming': 'pool',
      'Weightlifting': 'fitness_center',
      'Yoga': 'self_improvement',
      'Walking': 'directions_walk'
    };

    return icons[type] || 'fitness_center';
  }
}

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardComponent, ButtonComponent, FormInputComponent, WorkoutCardComponent],
  template: `
    <div class="container">
      <!-- Header Section -->
      <header class="page-header flex-row justify-between items-end flex-stack">
        <div class="flex-column">
          <h1 class="page-title">Workouts</h1>
          <p class="page-subtitle">Track and analyze your fitness activities.</p>
        </div>
        <app-button variant="primary" (click)="startWorkout()" [disabled]="loading" class="w-full-mobile">
          <span class="material-icons">add</span>
          {{ isLoggingMode ? 'Log Workout' : 'Start Workout' }}
        </app-button>
      </header>

      <!-- Filter Section -->
      <app-card class="glass-card" [hoverable]="false" style="margin-bottom: 2rem;">
        <div class="grid grid-cols-4 gap-md filter-grid">
          <app-form-input 
            label="Search" 
            [(ngModel)]="searchQuery" 
            (input)="applyFilters()" 
            placeholder="Search workouts...">
          </app-form-input>

          <div class="flex-column gap-xs">
            <label class="text-muted text-xs font-bold uppercase tracking-wider">Type</label>
            <select 
              class="filter-select"
              [(ngModel)]="selectedType" (change)="applyFilters()">
              <option value="">All Types</option>
              <option value="Running">Running</option>
              <option value="Weight Training">Weight Training</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="HIIT">HIIT</option>
            </select>
          </div>

          <app-form-input 
            label="From Date" 
            type="date" 
            [(ngModel)]="dateFrom" 
            (change)="applyFilters()">
          </app-form-input>

          <app-form-input 
            label="Min Duration" 
            type="number" 
            [(ngModel)]="durationMin" 
            (change)="applyFilters()">
          </app-form-input>
        </div>
      </app-card>

      <!-- Workouts Grid -->
      <div class="grid grid-cols-3" *ngIf="!loading">
        <app-workout-card *ngFor="let workout of filteredWorkouts" [workout]="workout"></app-workout-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredWorkouts.length === 0" class="flex-column items-center justify-center text-center" style="padding: 4rem 0;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-bg-surface); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: var(--color-text-dim);">
          <span class="material-icons" style="font-size: 3rem;">history</span>
        </div>
        <h3 class="text-xl font-bold">No workouts found</h3>
        <p class="text-muted" style="max-width: 300px; margin-top: 0.5rem; margin-bottom: 2rem;">Time to break a sweat! Start your first workout session now.</p>
        <app-button variant="primary" (click)="startWorkout()">Start Training</app-button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex-column items-center justify-center" style="min-height: 400px;">
        <div style="width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: var(--color-primary-base); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin { to { transform: rotate(360deg); } }

    .filter-select {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      color: var(--color-text-main);
      outline: none;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .filter-select:focus {
      border-color: var(--color-primary-base);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    @media (max-width: 768px) {
      .w-full-mobile { width: 100%; }
      
      .filter-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 480px) {
      .filter-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WorkoutsComponent implements OnInit, OnDestroy {
  workouts: any[] = [];
  filteredWorkouts: any[] = [];
  loading = false;
  isLoggingMode = true;

  // Filters
  selectedType = '';
  dateFrom = '';
  dateTo = '';
  durationMin: number | null = null;
  searchQuery = '';

  private destroy$ = new Subject<void>();

  constructor(
    private workoutService: WorkoutService,
    private userContext: UserContextService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadWorkouts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkouts() {
    this.loading = true;
    this.userContext.userId$.pipe(
      switchMap(userId => {
        if (!userId) return of([]);
        return this.workoutService.getWorkouts();
      }),
      takeUntil(this.destroy$)
    ).subscribe(workouts => {
      this.workouts = workouts;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters() {
    this.filteredWorkouts = this.workouts.filter(w => {
      const matchType = !this.selectedType || w.exerciseType === this.selectedType;
      const matchSearch = !this.searchQuery ||
        w.exerciseType.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (w.notes && w.notes.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchDuration = !this.durationMin || w.duration >= this.durationMin;
      const matchDate = !this.dateFrom || new Date(w.createdAt) >= new Date(this.dateFrom);

      return matchType && matchSearch && matchDuration && matchDate;
    });
  }

  startWorkout() {
    this.router.navigate(['/workouts/create']);
  }
}
