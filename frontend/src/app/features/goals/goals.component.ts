import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../shared/services/modal.service';
import { GoalService, Goal as ApiGoal } from './services/goal.service';
import { Subject, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

interface GoalCard {
  _id: string;
  name: string;
  description: string;
  icon: string;
  target: string;
  current: string;
  progress: number;
  deadline: Date;
  status: 'active' | 'completed' | 'archived';
  raw: ApiGoal;
}

import { ButtonComponent } from '../../shared/components/Button/button.component';
import { CardComponent } from '../../shared/components/Card/card.component';
import { SpinnerComponent, ProgressBarComponent } from '../../shared/components/Loading';
import { GoalFormComponent } from './components/goal-form/goal-form.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    SpinnerComponent,
    ProgressBarComponent,
    GoalFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit, OnDestroy {
  goals: GoalCard[] = [];
  filteredGoals: GoalCard[] = [];
  selectedGoal: GoalCard | null = null;
  showDetailView = false;
  showCreateForm = false;
  editingGoal: ApiGoal | undefined = undefined;
  loading = false;
  currentFilter: 'active' | 'completed' | 'archived' | 'all' = 'all';

  // Statistics
  totalGoals = 0;
  activeGoals = 0;
  completedGoals = 0;
  archivedGoals = 0;
  averageProgress = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private modalService: ModalService,
    private goalService: GoalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadGoals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGoals() {
    this.loading = true;
    this.cdr.markForCheck();
    this.goalService
      .getGoals(undefined, 100, 0)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          const data: ApiGoal[] = response?.data || [];
          this.goals = data.map((g) => this.toGoalCard(g));
          this.updateStats();
          this.filterGoals('all');
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.modalService.error('Failed to load goals');
          this.cdr.markForCheck();
        },
      });
  }

  updateStats() {
    const goals = this.goals;

    this.totalGoals = goals.length;
    this.activeGoals = goals.filter(g => g.status === 'active').length;
    this.completedGoals = goals.filter(g => g.status === 'completed').length;
    this.archivedGoals = goals.filter(g => g.status === 'archived').length;

    this.averageProgress = goals.length
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;

    this.cdr.markForCheck();
  }

  filterGoals(filter: 'active' | 'completed' | 'archived' | 'all') {
    this.currentFilter = filter;

    if (filter === 'all') {
      this.filteredGoals = [...this.goals];
    } else {
      this.filteredGoals = this.goals.filter(g => g.status === filter);
    }

    this.cdr.markForCheck();
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.editingGoal = undefined;
    }
  }

  quickAdd(goal: GoalCard, value: number) {
    const updatedValue = Number(goal.raw.currentValue) + value;

    this.goalService.updateGoal(goal._id, {
      currentValue: updatedValue
    }).subscribe(() => {
      goal.raw.currentValue = updatedValue;
      goal.current = `${updatedValue}`;
      goal.progress = this.goalService.calculateProgress(goal.raw);

      this.updateStats();
      this.cdr.markForCheck();
    });
  }

  viewGoalDetail(goal: GoalCard) {
    this.selectedGoal = goal;
    this.showDetailView = true;
  }

  closeDetailView() {
    this.showDetailView = false;
    this.selectedGoal = null;
  }

  editGoal(goal: GoalCard) {
    this.editingGoal = goal.raw;
    this.showCreateForm = true;
  }

  archiveGoal(goal: GoalCard) {
    this.modalService.confirm(
      'Archive Goal',
      'Are you sure you want to archive this goal? You can unarchive it later.',
      'Archive',
      'Cancel',
      'warning'
    ).subscribe(confirmed => {
      if (confirmed) {
        // optimistic UI
        goal.status = 'archived';

        this.updateStats();
        this.filterGoals(this.currentFilter);

        this.goalService.updateGoal(goal._id, { status: 'abandoned' })
          .subscribe({
            next: () => {
              this.modalService.success('Goal archived');
            },
            error: () => {
              this.modalService.error('Failed to archive');
              this.loadGoals(); // rollback
            }
          });
      }
    });
  }

  completeGoal(goal: GoalCard) {
    if (!goal._id) return;

    goal.status = 'completed';
    goal.progress = 100;

    this.updateStats();
    this.filterGoals(this.currentFilter);

    this.goalService.updateGoal(goal._id, { status: 'completed' })
      .subscribe({
        next: () => {
          this.modalService.success('Goal completed 🎉');
        },
        error: () => {
          this.modalService.error('Failed to complete');
          this.loadGoals();
        }
      });
  }

  unarchiveGoal(goal: GoalCard) {
    this.modalService.confirm(
      'Unarchive Goal',
      'Are you sure you want to unarchive this goal? It will be set to active.',
      'Unarchive',
      'Cancel',
      'info'
    ).subscribe(confirmed => {
      if (confirmed) {
        goal.status = 'active';

        this.updateStats();
        this.filterGoals(this.currentFilter);

        this.goalService.updateGoal(goal._id, { status: 'active' })
          .subscribe({
            next: () => {
              this.modalService.success('Goal unarchived');
            },
            error: () => {
              this.modalService.error('Failed to unarchive');
              this.loadGoals();
            }
          });
      }
    });
  }

  deleteGoal(goal: GoalCard) {
    this.modalService.confirm(
      'Delete Goal',
      'Are you sure you want to delete this goal permanently? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.goalService.deleteGoal(goal._id).subscribe({
          next: () => {
            this.goals = this.goals.filter(g => g._id !== goal._id);

            this.updateStats();
            this.filterGoals(this.currentFilter);

            this.modalService.success('Goal deleted');
            this.cdr.markForCheck();
          },
          error: () => {
            this.modalService.error('Delete failed');
          },
        });
      }
    });
  }

  getMotivation(progress: number): string {
    if (progress >= 90) return '🔥 Almost there!';
    if (progress >= 70) return '💪 Keep pushing!';
    if (progress >= 40) return '⚡ Good progress!';
    return '🚀 Let’s get started!';
  }

  getProgressPercentage(goal: GoalCard): number {
    return Math.min(goal.progress, 100);
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#10B981';
    if (progress >= 50) return '#3B82F6';
    if (progress >= 25) return '#F59E0B';
    return '#EF4444';
  }

  updateProgress(goal: GoalCard, value: number) {
    const numeric = Number(value);
    goal.raw.currentValue = numeric;
    
    const updatedCard = this.toGoalCard(goal.raw);
    goal.current = updatedCard.current;
    goal.progress = updatedCard.progress;

    this.updateStats();
    this.cdr.markForCheck();
  }

  onGoalSubmitted(goal: ApiGoal) {
    const isEdit = !!this.editingGoal?._id;

    const op$ = isEdit
      ? this.goalService.updateGoal(this.editingGoal!._id!, goal)
      : this.goalService.createGoal(goal);

    op$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {

        const newGoal = this.toGoalCard(res.data || res);

        if (isEdit) {
          const index = this.goals.findIndex(g => g._id === newGoal._id);
          if (index > -1) this.goals[index] = newGoal;
        } else {
          this.goals.unshift(newGoal);
        }

        this.updateStats();
        this.filterGoals(this.currentFilter);

        this.showCreateForm = false;
        this.editingGoal = undefined;

        this.modalService.success(isEdit ? 'Goal updated' : 'Goal created');
        this.cdr.markForCheck();
      },
      error: () => this.modalService.error('Failed to save goal'),
    });
  }

  /**
   * toGoalCard - Data Transformer
   * 
   * Converts raw API goal data into a formatted GoalCard object for the UI.
   * Handles type-specific progress calculation and naming logic.
   */
  private toGoalCard(goal: ApiGoal): GoalCard {
    const status = goal.status === 'abandoned' ? 'archived' : goal.status;
    
    // Progress calculation based on goal type
    let progress = 0;
    const initial = goal.initialValue ?? goal.currentValue;
    const current = goal.currentValue;
    const target = goal.targetValue;

    if (goal.status === 'completed') {
      progress = 100;
    } else if (goal.goalType === 'weight_loss') {
      // For weight loss, we want current to be lower than initial
      if (initial > target) {
        progress = ((initial - current) / (initial - target)) * 100;
      } else {
        // Fallback if data is weird
        progress = (current <= target) ? 100 : 0;
      }
    } else {
      // For others, we want current to be higher than initial
      if (target > initial) {
        progress = ((current - initial) / (target - initial)) * 100;
      } else {
        // Fallback
        progress = (current / target) * 100;
      }
    }

    const finalProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const goalTypeLabel = this.formatGoalType(goal.goalType);
    const name = goal.description || goalTypeLabel;
    
    return {
      _id: goal._id || '',
      name: name,
      description: goalTypeLabel,
      icon: this.goalService.getGoalIcon(goal.goalType),
      target: `${goal.targetValue} ${goal.unit}`,
      current: `${goal.currentValue}`,
      progress: finalProgress,
      deadline: new Date(goal.targetDate),
      status,
      raw: goal,
    };
  }

  private formatGoalType(goalType: string): string {
    return goalType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * getFeedback - Motivational Logic
   * 
   * Generates type-specific motivational messages based on progress percentage.
   */
  getFeedback(goal: GoalCard): string {
    const progress = goal.progress;
    const type = goal.raw.goalType;

    if (progress >= 100) return '🎉 Goal achieved! Incredible work.';
    
    if (type === 'weight_loss') {
      if (progress > 75) return '🔥 So close to your target weight!';
      if (progress > 40) return '💪 Great consistency, the scale is moving!';
      return '🚀 Every pound counts. Let\'s get started!';
    }
    
    if (type === 'muscle_gain' || type === 'strength') {
      if (progress > 75) return '🔥 You\'re becoming a powerhouse!';
      if (progress > 40) return '💪 Gains are visible! Keep lifting.';
      return '🚀 Time to build that foundation!';
    }

    if (progress > 75) return '🔥 You\'re almost at the finish line!';
    if (progress > 40) return '💪 Halfway there! Keep up the momentum.';
    return '🚀 The journey of a thousand miles begins here!';
  }
}
