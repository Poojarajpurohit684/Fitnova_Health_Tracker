import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NutritionService, NutritionEntry, DailyTotals, DailyGoals } from '../../services/nutrition.service';
import { NutritionEntryFormComponent } from '../nutrition-entry-form/nutrition-entry-form.component';
import { UserContextService } from '../../../../core/services/user-context.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-nutrition-log',
  standalone: true,
  imports: [CommonModule, NutritionEntryFormComponent],
  template: `
    <div class="nutrition-wrapper">
      <div class="nutrition-header">
        <h1>Nutrition Tracker</h1>
        <button class="btn btn-primary" (click)="toggleAddMeal()" [disabled]="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Log Meal
        </button>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading nutrition data...</p>
      </div>

      <div *ngIf="error" class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong>Failed to load nutrition data</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <div *ngIf="!loading && !error">
        <div *ngIf="showForm" class="form-modal">
          <div class="form-modal-content">
            <div class="form-modal-header">
              <h2>Log New Meal</h2>
              <p>Record your nutrition intake</p>
              <button class="close-btn" (click)="toggleAddMeal()">×</button>
            </div>
            <app-nutrition-entry-form
              (submitted)="onEntrySubmitted($event)"
              (cancelled)="toggleAddMeal()"
            ></app-nutrition-entry-form>
          </div>
        </div>

        <div class="daily-totals">
          <div class="totals-card calories">
            <div class="totals-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
              </svg>
              <span>Calories</span>
            </div>
            <div class="totals-value">{{ dailyTotals.calories }}</div>
            <div class="totals-goal">Goal: {{ dailyGoals.calories }}</div>
            <div class="progress-bar">
              <div 
              class="progress-fill" 
              [class.over-goal]="dailyTotals.calories > dailyGoals.calories"
              [style.width.%]="getProgressPercentage(dailyTotals.calories, dailyGoals.calories)"></div>
            </div>
          </div>

          <div class="totals-card protein">
            <div class="totals-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span>Protein</span>
            </div>
            <div class="totals-value">{{ dailyTotals.protein }}g</div>
            <div class="totals-goal">Goal: {{ dailyGoals.protein }}g</div>
            <div class="progress-bar">
              <div 
              class="progress-fill" 
              [class.over-goal]="dailyTotals.protein > dailyGoals.protein"
              [style.width.%]="getProgressPercentage(dailyTotals.protein, dailyGoals.protein)"></div>
            </div>
          </div>

          <div class="totals-card carbs">
            <div class="totals-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span>Carbs</span>
            </div>
            <div class="totals-value">{{ dailyTotals.carbohydrates }}g</div>
            <div class="totals-goal">Goal: {{ dailyGoals.carbohydrates }}g</div>
            <div class="progress-bar">
              <div 
              class="progress-fill" 
              [class.over-goal]="dailyTotals.carbohydrates > dailyGoals.carbohydrates"
              [style.width.%]="getProgressPercentage(dailyTotals.carbohydrates, dailyGoals.carbohydrates)"></div>
            </div>
          </div>

          <div class="totals-card fats">
            <div class="totals-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              <span>Fats</span>
            </div>
            <div class="totals-value">{{ dailyTotals.fats }}g</div>
            <div class="totals-goal">Goal: {{ dailyGoals.fats }}g</div>
            <div class="progress-bar">
              <div 
              class="progress-fill" 
              [class.over-goal]="dailyTotals.fats > dailyGoals.fats" 
              [style.width.%]="getProgressPercentage(dailyTotals.fats, dailyGoals.fats)"></div>
            </div>
          </div>
        </div>

        <div class="meals-section">
          <h2>Today's Meals</h2>
          <div *ngIf="entries.length === 0" class="empty-state">
            <p>No meals logged yet. Start by logging your first meal!</p>
          </div>
          <div class="meals-list" *ngIf="entries.length > 0">
            <div class="meal-card" *ngFor="let entry of entries">
              <div class="meal-header">
                <span class="meal-icon">{{ getMealIcon(entry.mealType) }}</span>
                <div class="meal-info">
                  <span class="meal-name">{{ entry.foodName }}</span>
                  <span class="meal-time">{{ formatTime(entry.loggedAt) }}</span>
                </div>
                <span class="meal-calories">{{ entry.calories }} cal</span>
                <button class="delete-btn" (click)="deleteEntry(entry._id!)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div class="meal-macros">
                <span class="macro-badge">P: {{ entry.protein }}g</span>
                <span class="macro-badge">C: {{ entry.carbohydrates }}g</span>
                <span class="macro-badge">F: {{ entry.fats }}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  // styles: [`
  //   :host {
  //     --primary: #0F172A;
  //     --secondary: #06B6D4;
  //     --accent: #8B5CF6;
  //     --success: #10B981;
  //     --error: #EF4444;
  //     --text: #1E293B;
  //     --text-light: #64748B;
  //     --border: #E2E8F0;
  //     --light: #F8FAFC;
  //   }

  //   .nutrition-wrapper {
  //     width: 100%;
  //     padding: 2rem;
  //   }

  //   .nutrition-header {
  //     display: flex;
  //     justify-content: space-between;
  //     align-items: center;
  //     margin-bottom: 2rem;
  //     gap: 2rem;
  //   }

  //   .nutrition-header h1 {
  //     margin: 0;
  //     font-size: 2rem;
  //     color: var(--primary);
  //     font-weight: 700;
  //   }

  //   .btn {
  //     padding: 0.75rem 1.5rem;
  //     border: none;
  //     border-radius: 10px;
  //     font-weight: 600;
  //     cursor: pointer;
  //     transition: all 0.3s ease;
  //     font-family: inherit;
  //     display: flex;
  //     align-items: center;
  //     gap: 0.5rem;
  //   }

  //   .btn-primary {
  //     background: linear-gradient(135deg, var(--primary), #1E293B);
  //     color: white;
  //     box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
  //   }

  //   .btn-primary:hover:not(:disabled) {
  //     transform: translateY(-2px);
  //     box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
  //   }

  //   .btn-primary:disabled {
  //     opacity: 0.6;
  //     cursor: not-allowed;
  //   }

  //   .loading-state {
  //     display: flex;
  //     flex-direction: column;
  //     align-items: center;
  //     justify-content: center;
  //     padding: 4rem 2rem;
  //     text-align: center;
  //   }

  //   .spinner {
  //     width: 40px;
  //     height: 40px;
  //     border: 4px solid var(--border);
  //     border-top-color: var(--secondary);
  //     border-radius: 50%;
  //     animation: spin 0.8s linear infinite;
  //     margin-bottom: 1rem;
  //   }

  //   @keyframes spin {
  //     to { transform: rotate(360deg); }
  //   }

  //   .alert {
  //     padding: 1.5rem;
  //     border-radius: 8px;
  //     margin-bottom: 2rem;
  //     display: flex;
  //     gap: 1rem;
  //     align-items: flex-start;
  //   }

  //   .alert-error {
  //     background: rgba(239, 68, 68, 0.1);
  //     color: var(--error);
  //     border: 1px solid rgba(239, 68, 68, 0.3);
  //   }

  //   .alert svg {
  //     flex-shrink: 0;
  //     width: 20px;
  //     height: 20px;
  //   }

  //   .alert strong {
  //     display: block;
  //     margin-bottom: 0.5rem;
  //   }

  //   .alert p {
  //     margin: 0;
  //     font-size: 0.9rem;
  //   }

  //   .form-modal {
  //     position: fixed;
  //     inset: 0;
  //     background: rgba(0, 0, 0, 0.5);
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     z-index: 1000;
  //     backdrop-filter: blur(4px);
  //   }

  //   .form-modal-content {
  //     background: white;
  //     border-radius: 16px;
  //     box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  //     max-width: 500px;
  //     width: 90%;
  //     max-height: 90vh;
  //     overflow-y: auto;
  //   }

  //   .form-modal-header {
  //     display: flex;
  //     justify-content: space-between;
  //     align-items: center;
  //     padding: 1.5rem;
  //     border-bottom: 1px solid var(--border);
  //   }

  //   .form-modal-header h2 {
  //     margin: 0;
  //     font-size: 1.25rem;
  //     color: var(--primary);
  //   }

  //   .close-btn {
  //     background: none;
  //     border: none;
  //     font-size: 2rem;
  //     color: #94A3B8;
  //     cursor: pointer;
  //     padding: 0;
  //     width: 32px;
  //     height: 32px;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     border-radius: 8px;
  //     transition: all 0.2s ease;
  //   }

  //   .close-btn:hover {
  //     background: var(--light);
  //     color: var(--text);
  //   }

  //   .daily-totals {
  //     display: grid;
  //     grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  //     gap: 1.5rem;
  //     margin-bottom: 2rem;
  //   }

  //   .totals-card {
  //     background: white;
  //     border-radius: 12px;
  //     padding: 1.5rem;
  //     box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  //     border-top: 4px solid var(--secondary);
  //     transition: all 0.3s ease;
  //   }

  //   .totals-card.protein {
  //     border-top-color: #EF4444;
  //   }

  //   .totals-card.carbs {
  //     border-top-color: #F59E0B;
  //   }

  //   .totals-card.fats {
  //     border-top-color: #8B5CF6;
  //   }

  //   .totals-card:hover {
  //     transform: translateY(-4px);
  //     box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  //   }

  //   .totals-header {
  //     display: flex;
  //     align-items: center;
  //     gap: 0.75rem;
  //     margin-bottom: 1rem;
  //   }

  //   .totals-header svg {
  //     width: 24px;
  //     height: 24px;
  //     color: var(--secondary);
  //   }

  //   .totals-card.protein .totals-header svg {
  //     color: #EF4444;
  //   }

  //   .totals-card.carbs .totals-header svg {
  //     color: #F59E0B;
  //   }

  //   .totals-card.fats .totals-header svg {
  //     color: #8B5CF6;
  //   }

  //   .totals-header span {
  //     font-weight: 700;
  //     color: var(--primary);
  //   }

  //   .totals-value {
  //     font-size: 2rem;
  //     font-weight: 800;
  //     color: var(--primary);
  //     margin-bottom: 0.5rem;
  //   }

  //   .totals-goal {
  //     font-size: 0.9rem;
  //     color: var(--text-light);
  //     margin-bottom: 0.75rem;
  //   }

  //   .progress-bar {
  //     height: 8px;
  //     background: var(--light);
  //     border-radius: 4px;
  //     overflow: hidden;
  //   }

  //   .progress-fill {
  //     height: 100%;
  //     background: linear-gradient(90deg, var(--secondary), #0891b2);
  //     border-radius: 4px;
  //     transition: width 0.3s ease;
  //   }

  //   .totals-card.protein .progress-fill {
  //     background: linear-gradient(90deg, #EF4444, #DC2626);
  //   }

  //   .totals-card.carbs .progress-fill {
  //     background: linear-gradient(90deg, #F59E0B, #d97706);
  //   }

  //   .totals-card.fats .progress-fill {
  //     background: linear-gradient(90deg, #8B5CF6, #7c3aed);
  //   }

  //   .meals-section {
  //     background: white;
  //     border-radius: 12px;
  //     padding: 2rem;
  //     box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  //     border: 1px solid var(--border);
  //   }

  //   .meals-section h2 {
  //     margin: 0 0 1.5rem 0;
  //     font-size: 1.5rem;
  //     color: var(--primary);
  //     font-weight: 700;
  //   }

  //   .empty-state {
  //     text-align: center;
  //     padding: 2rem;
  //     color: var(--text-light);
  //   }

  //   .meals-list {
  //     display: flex;
  //     flex-direction: column;
  //     gap: 1rem;
  //   }

  //   .meal-card {
  //     background: var(--light);
  //     border-radius: 10px;
  //     padding: 1rem;
  //     border-left: 4px solid var(--secondary);
  //     transition: all 0.3s ease;
  //   }

  //   .meal-card:hover {
  //     background: #f1f5f9;
  //     transform: translateX(4px);
  //   }

  //   .meal-header {
  //     display: flex;
  //     align-items: center;
  //     gap: 1rem;
  //     margin-bottom: 0.75rem;
  //   }

  //   .meal-icon {
  //     font-size: 1.5rem;
  //   }

  //   .meal-info {
  //     flex: 1;
  //     display: flex;
  //     flex-direction: column;
  //     gap: 0.25rem;
  //   }

  //   .meal-name {
  //     font-weight: 700;
  //     color: var(--primary);
  //   }

  //   .meal-time {
  //     font-size: 0.85rem;
  //     color: var(--text-light);
  //   }

  //   .meal-calories {
  //     font-weight: 700;
  //     color: var(--secondary);
  //   }

  //   .delete-btn {
  //     background: none;
  //     border: none;
  //     color: var(--error);
  //     cursor: pointer;
  //     padding: 0.5rem;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     border-radius: 6px;
  //     transition: all 0.2s ease;
  //   }

  //   .delete-btn:hover {
  //     background: rgba(239, 68, 68, 0.1);
  //   }

  //   .meal-macros {
  //     display: flex;
  //     gap: 0.75rem;
  //     flex-wrap: wrap;
  //   }

  //   .macro-badge {
  //     background: white;
  //     padding: 0.4rem 0.8rem;
  //     border-radius: 6px;
  //     font-size: 0.85rem;
  //     font-weight: 600;
  //     color: var(--text-light);
  //   }

  //   @media (max-width: 768px) {
  //     .nutrition-wrapper {
  //       padding: 1rem;
  //     }

  //     .nutrition-header {
  //       flex-direction: column;
  //       align-items: stretch;
  //     }

  //     .btn {
  //       justify-content: center;
  //     }

  //     .daily-totals {
  //       grid-template-columns: 1fr;
  //     }

  //     .form-modal-content {
  //       width: 95%;
  //     }
  //   }
  // `],
  styles: [`
:host {
  display: block;
}

/* PAGE WRAPPER */

.nutrition-wrapper {
  width: 100%;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 20%, #000000 100%);
}

/* HEADER */

.nutrition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.nutrition-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--color-text-main);
  font-weight: 700;
}

/* BUTTONS */

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: .5rem;
  transition: all .2s ease;
}

.btn-primary {
  background: var(--color-primary-base);
  color: white;
  box-shadow: var(--glow-primary);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: .5;
}

/* LOADING */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,.2);
  border-top-color: var(--color-primary-base);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ERROR */

.alert {
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.alert-error {
  background: rgba(239,68,68,.1);
  border: 1px solid rgba(239,68,68,.4);
  color: var(--color-error);
}

/* MODAL */

.form-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-modal-content {
  background: var(--color-bg-card);
  border-radius: 16px;
  border: 1px solid var(--color-border-strong);
  width: 95%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: modalFade .25s ease;
}

@keyframes modalFade {
  from {
    transform: scale(.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.form-modal-header {
  position: sticky;
  top: 0;
  background: var(--color-bg-card);
  z-index: 5;
}

.form-modal-header h2 {
  margin: 0;
  color: var(--color-text-main);
}

.form-modal-header p {
  margin: 0;
  color: var(--color-text-light);
  font-size: 0.95rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: 1.5rem;
  cursor: pointer;
}

/* DAILY TOTALS */

.daily-totals {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.totals-card {
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--color-border-subtle);
  transition: .2s;
}

.totals-card:hover {
  transform: translateY(-3px);
}

.totals-header {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .75rem;
  color: var(--color-text-light);
}

.totals-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.totals-goal {
  font-size: .9rem;
  color: var(--color-text-light);
  margin-bottom: .5rem;
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary-base);
  transition: width .3s ease;
}

.progress-fill.over-goal {
  background: #10B981;
}

/* MEALS SECTION */

.meals-section {
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--color-border-subtle);
}

.meals-section h2 {
  margin: 0 0 1.5rem;
  color: var(--color-text-main);
}

.meals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* MEAL CARD */

.meal-card {
  background: var(--color-bg-surface);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--color-border-subtle);
  transition: .2s;
}

.meal-card:hover {
  transform: translateX(4px);
}

.meal-header {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: .5rem;
}

.meal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meal-name {
  font-weight: 600;
  color: var(--color-text-main);
}

.meal-time {
  font-size: .85rem;
  color: var(--color-text-light);
}

.meal-calories {
  font-weight: 700;
  color: var(--color-primary-base);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
}

.meal-macros {
  display: flex;
  gap: .5rem;
}

.macro-badge {
  background: rgba(255,255,255,.05);
  padding: .3rem .6rem;
  border-radius: 6px;
  font-size: .8rem;
  color: var(--color-text-light);
}

/* MOBILE */

@media (max-width: 768px) {

  .nutrition-wrapper {
    padding: 1rem;
  }

  .nutrition-header {
    flex-direction: column;
    gap: 1rem;
  }

  .daily-totals {
    grid-template-columns: 1fr;
  }
}
  `],
})
export class NutritionLogComponent implements OnInit, OnDestroy {
  entries: NutritionEntry[] = [];
  dailyTotals: DailyTotals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
  };
  dailyGoals: DailyGoals = {
    calories: 2000,
    protein: 150,
    carbohydrates: 250,
    fats: 80,
  };
  showForm = false;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private nutritionService: NutritionService,
    private userContext: UserContextService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadNutritionData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNutritionData(): void {
    this.loading = true;
    this.error = null;

    this.nutritionService.getNutritionEntries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.entries = response.entries;
          this.dailyTotals = response.dailyTotals;
          this.dailyGoals = response.dailyGoals;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading nutrition data:', error);
          this.loading = false;
          this.error = 'Unable to load nutrition data. Please try again.';
        }
      });
  }

  toggleAddMeal(): void {
    this.showForm = !this.showForm;
    document.body.style.overflow = this.showForm ? 'hidden' : 'auto';
  }

  onEntrySubmitted(entry: NutritionEntry): void {
    this.showForm = false;
    this.loadNutritionData();
  }

  deleteEntry(entryId: string): void {
    this.modalService.confirm(
      'Delete Entry',
      'Are you sure you want to delete this nutrition entry? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.nutritionService.deleteNutritionEntry(entryId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadNutritionData();
              this.modalService.success('Entry deleted');
            },
            error: (error) => {
              console.error('Error deleting entry:', error);
              this.modalService.error('Failed to delete entry');
            }
          });
      }
    });
  }

  getMealIcon(type: string): string {
    const icons: { [key: string]: string } = {
      breakfast: '🌅',
      lunch: '☀️',
      snack: '🍿',
      dinner: '🌙',
    };
    return icons[type] || '🍽️';
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  getProgressPercentage(current: number, goal: number): number {
    if (goal === 0) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(percentage, 100);
  }
}
