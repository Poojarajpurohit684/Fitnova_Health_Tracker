import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, switchMap, filter } from 'rxjs/operators';
import { GoalService, Goal } from '../../services/goal.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { GoalFormComponent } from '../goal-form/goal-form.component';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [CommonModule, GoalFormComponent],
  template: `
    <div class="goals-wrapper">
      <div class="goals-header">
        <h1>Goals</h1>
        <button class="btn btn-primary" (click)="toggleAddGoal()" [disabled]="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Goal
        </button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your goals...</p>
      </div>

      <div *ngIf="error" class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong>Failed to load goals</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <div *ngIf="!loading && !error">
        <div class="goals-stats">
          <div class="stat-card">
            <div class="stat-value">{{ totalGoals }}</div>
            <div class="stat-label">Total Goals</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ activeGoals }}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ completedGoals }}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ averageProgress }}%</div>
            <div class="stat-label">Avg Progress</div>
          </div>
        </div>

        <div class="goals-filters">
          <button class="filter-btn" [class.active]="currentFilter === 'all'" (click)="filterGoals('all')">All</button>
          <button class="filter-btn" [class.active]="currentFilter === 'active'" (click)="filterGoals('active')">Active</button>
          <button class="filter-btn" [class.active]="currentFilter === 'completed'" (click)="filterGoals('completed')">Completed</button>
        </div>

        <div *ngIf="showForm" class="form-modal-overlay" (click)="toggleAddGoal()">
          <div class="form-modal" (click)="$event.stopPropagation()">
            <div class="form-modal-header">
              <h2>{{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}</h2>
              <button class="close-btn" (click)="toggleAddGoal()">×</button>
            </div>
            <app-goal-form
              [editingGoal]="editingGoal || undefined"
              (submitted)="onGoalSubmitted($event)"
              (cancelled)="toggleAddGoal()"
            ></app-goal-form>
          </div>
        </div>

        <div class="goals-grid">
          <div class="goal-card" *ngFor="let goal of filteredGoals" [ngClass]="'status-' + goal.status">
            <div class="goal-header">
              <span class="goal-icon">{{ goalService.getGoalIcon(goal.goalType) }}</span>
              <div class="goal-title">
                <h3>{{ goal.description }}</h3>
                <p class="goal-type">{{ formatGoalType(goal.goalType) }}</p>
              </div>
              <span class="goal-status" [ngClass]="'status-' + goal.status">
                {{ goal.status === 'completed' ? '✓' : (goal.progress || 0) + '%' }}
              </span>
            </div>

            <div class="goal-progress">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="goal.progress || 0"></div>
              </div>
              <div class="progress-text">
                <span class="current">{{ goal.currentValue }}</span>
                <span class="separator">/</span>
                <span class="target">{{ goal.targetValue }} {{ goal.unit }}</span>
              </div>
            </div>

            <div class="goal-details">
              <div class="detail">
                <span class="detail-label">Progress</span>
                <span class="detail-value">{{ goal.progress || 0 }}%</span>
              </div>
              <div class="detail">
                <span class="detail-label">Days Left</span>
                <span class="detail-value">{{ getDaysRemaining(goal.targetDate) }}</span>
              </div>
              <div class="detail">
                <span class="detail-label">Status</span>
                <span class="detail-value" [ngClass]="'status-' + goal.status">{{ goal.status }}</span>
              </div>
            </div>

            <div class="goal-actions">
              <button class="action-btn" *ngIf="goal.status === 'active'" (click)="editGoal(goal)">Edit</button>
              <button class="action-btn danger" *ngIf="goal.status === 'active'" (click)="deleteGoal(goal._id!)">Delete</button>
            </div>
          </div>

          <div *ngIf="filteredGoals.length === 0" class="empty-state">
            <div class="empty-icon">🎯</div>
            <h3>No goals yet</h3>
            <p>Create your first goal to start tracking your progress</p>
            <button class="btn btn-primary" (click)="toggleAddGoal()">Create Goal</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0F172A;
      --secondary: #06B6D4;
      --accent: #8B5CF6;
      --success: #10B981;
      --error: #EF4444;
      --text: #1E293B;
      --text-light: #64748B;
      --border: #E2E8F0;
      --light: #F8FAFC;
    }

    .goals-wrapper {
      width: 100%;
    }

    .goals-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .goals-header h1 {
      margin: 0;
      font-size: 2rem;
      color: var(--primary);
      font-weight: 700;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #1E293B);
      color: white;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
    }

    .btn-primary:disabled {
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
      border-top-color: var(--secondary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert {
      padding: 1.5rem;
      border-radius: 8px;
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

    .goals-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--secondary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-light);
    }

    .goals-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .filter-btn {
      padding: 0.6rem 1.2rem;
      border: 1px solid var(--border);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: var(--text-light);
      transition: all 0.3s ease;
    }

    .filter-btn:hover {
      border-color: var(--secondary);
      color: var(--secondary);
    }

    .filter-btn.active {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      border-color: transparent;
    }

    .form-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .form-modal {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .form-modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      color: #94A3B8;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--light);
      color: var(--text);
    }

    .goals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .goal-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
      border-left: 4px solid var(--secondary);
      transition: all 0.3s ease;
    }

    .goal-card.status-completed {
      border-left-color: var(--success);
      opacity: 0.8;
    }

    .goal-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .goal-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .goal-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .goal-title {
      flex: 1;
    }

    .goal-title h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: var(--primary);
      font-weight: 700;
    }

    .goal-type {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-light);
    }

    .goal-status {
      background: linear-gradient(135deg, var(--secondary), #0891b2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .goal-status.status-completed {
      background: linear-gradient(135deg, var(--success), #059669);
    }

    .goal-progress {
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      height: 8px;
      background: var(--light);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--secondary), #0891b2);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .goal-card.status-completed .progress-fill {
      background: linear-gradient(90deg, var(--success), #059669);
    }

    .progress-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-light);
    }

    .current {
      font-weight: 700;
      color: var(--primary);
    }

    .target {
      color: var(--text-light);
    }

    .goal-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--light);
      border-radius: 8px;
    }

    .detail {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.75rem;
      color: var(--text-light);
      font-weight: 600;
      text-transform: uppercase;
    }

    .detail-value {
      font-size: 0.95rem;
      color: var(--primary);
      font-weight: 700;
    }

    .detail-value.status-active {
      color: var(--secondary);
    }

    .detail-value.status-completed {
      color: var(--success);
    }

    .goal-actions {
      display: flex;
      gap: 0.75rem;
    }

    .action-btn {
      flex: 1;
      padding: 0.6rem 1rem;
      border: 1px solid var(--border);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: var(--secondary);
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: rgba(6, 182, 212, 0.05);
      border-color: var(--secondary);
    }

    .action-btn.danger {
      color: #EF4444;
    }

    .action-btn.danger:hover {
      background: rgba(239, 68, 68, 0.05);
      border-color: #EF4444;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--primary);
      font-size: 1.25rem;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
      color: var(--text-light);
    }

    @media (max-width: 768px) {
      .goals-header {
        flex-direction: column;
        align-items: stretch;
      }

      .btn {
        justify-content: center;
      }

      .goals-grid {
        grid-template-columns: 1fr;
      }

      .goal-details {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class GoalListComponent implements OnInit, OnDestroy {
  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  currentFilter: string = 'all';
  showForm = false;
  editingGoal: Goal | null = null;
  loading = false;
  error: string | null = null;

  totalGoals = 0;
  activeGoals = 0;
  completedGoals = 0;
  averageProgress = 0;

  private destroy$ = new Subject<void>();

  constructor(
    public goalService: GoalService,
    private modalService: ModalService,
    private userContext: UserContextService
  ) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGoals(): void {
    this.loading = true;
    this.error = null;
    
    this.userContext.userId$
      .pipe(
        switchMap(userId => {
          if (!userId) {
            this.loading = false;
            this.error = null;
            return of({ data: [] });
          }
          return this.goalService.getGoals();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.data && Array.isArray(response.data)) {
            this.goals = response.data.map((goal: Goal) => ({
              ...goal,
              progress: this.goalService.calculateProgress(goal),
            }));
            this.userContext.updateGoals(this.goals);
            this.updateStats();
            this.filterGoals(this.currentFilter);
          } else {
            this.goals = [];
            this.updateStats();
            this.filterGoals(this.currentFilter);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading goals:', err);
          this.loading = false;
          this.error = 'Unable to load goals. Please try again.';
        }
      });
  }

  updateStats(): void {
    this.totalGoals = this.goals.length;
    this.activeGoals = this.goals.filter((g) => g.status === 'active').length;
    this.completedGoals = this.goals.filter((g) => g.status === 'completed').length;
    this.averageProgress = this.goals.length > 0
      ? Math.round(this.goals.reduce((sum, g) => sum + (g.progress || 0), 0) / this.goals.length)
      : 0;
  }

  filterGoals(filter: string): void {
    this.currentFilter = filter;
    if (filter === 'active') {
      this.filteredGoals = this.goals.filter((g) => g.status === 'active');
    } else if (filter === 'completed') {
      this.filteredGoals = this.goals.filter((g) => g.status === 'completed');
    } else {
      this.filteredGoals = this.goals;
    }
  }

  toggleAddGoal(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.editingGoal = null;
    }
  }

  onGoalSubmitted(goal: Goal): void {
    if (this.editingGoal) {
      this.goalService.updateGoal(this.editingGoal._id!, goal)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showForm = false;
            this.editingGoal = null;
            this.modalService.success('Goal updated successfully');
            // Reload goals after a short delay to ensure UserContextService is updated
            setTimeout(() => {
              this.loadGoals();
            }, 300);
          },
          error: (err) => {
            console.error('Error updating goal:', err);
            this.modalService.error('Failed to update goal');
          }
        });
    } else {
      this.goalService.createGoal(goal)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showForm = false;
            this.modalService.success('Goal created successfully');
            // Reload goals after a short delay to ensure UserContextService is updated
            setTimeout(() => {
              this.loadGoals();
            }, 300);
          },
          error: (err) => {
            console.error('Error creating goal:', err);
            this.modalService.error('Failed to create goal');
          }
        });
    }
  }

  editGoal(goal: Goal): void {
    this.editingGoal = goal;
    this.showForm = true;
    
    setTimeout(() => {
      const formElement = document.querySelector('.form-modal');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  deleteGoal(goalId: string): void {
    this.modalService.confirm(
      'Delete Goal',
      'Are you sure you want to delete this goal permanently? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.goalService.deleteGoal(goalId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadGoals();
              this.modalService.success('Goal deleted');
            },
            error: (err) => {
              console.error('Error deleting goal:', err);
              this.modalService.error('Failed to delete goal');
            }
          });
      }
    });
  }

  formatGoalType(goalType: string): string {
    return goalType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  getDaysRemaining(targetDate: Date): number {
    return this.goalService.getDaysRemaining(targetDate);
  }
}
