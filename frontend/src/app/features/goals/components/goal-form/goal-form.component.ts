import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoalService, Goal } from '../../services/goal.service';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <form [formGroup]="goalForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="goalType">Goal Type</label>
          <select id="goalType" formControlName="goalType" class="form-input">
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
            <option value="strength">Strength</option>
            <option value="flexibility">Flexibility</option>
          </select>
          <span class="error" *ngIf="goalForm.get('goalType')?.invalid && goalForm.get('goalType')?.touched">
            Goal type is required
          </span>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <input
            id="description"
            type="text"
            formControlName="description"
            placeholder="e.g., Lose 15 lbs by summer"
            class="form-input"
          />
          <span class="error" *ngIf="goalForm.get('description')?.invalid && goalForm.get('description')?.touched">
            Description is required
          </span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="targetValue">Target Value</label>
            <input
              id="targetValue"
              type="number"
              formControlName="targetValue"
              placeholder="0"
              class="form-input"
              step="0.1"
            />
            <span class="error" *ngIf="goalForm.get('targetValue')?.invalid && goalForm.get('targetValue')?.touched">
              Target value is required
            </span>
          </div>

          <div class="form-group">
            <label for="unit">Unit</label>
            <select id="unit" formControlName="unit" class="form-input">
              <option value="lbs">Pounds (lbs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="km">Kilometers (km)</option>
              <option value="miles">Miles</option>
              <option value="min">Minutes</option>
              <option value="reps">Reps</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="currentValue">Current Value</label>
          <input
            id="currentValue"
            type="number"
            formControlName="currentValue"
            placeholder="0"
            class="form-input"
            step="0.1"
          />
          <span class="error" *ngIf="goalForm.get('currentValue')?.invalid && goalForm.get('currentValue')?.touched">
            Current value is required
          </span>
        </div>

        <div class="form-group">
          <label for="targetDate">Target Date</label>
          <input
            id="targetDate"
            type="date"
            formControlName="targetDate"
            class="form-input"
          />
          <span class="error" *ngIf="goalForm.get('targetDate')?.invalid && goalForm.get('targetDate')?.touched">
            Target date is required
          </span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="!goalForm.valid || isSubmitting">
            {{ isSubmitting ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .form-container {
      padding: 1.5rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      font-weight: 600;
      color: var(--color-text-main);
      font-size: 0.95rem;
    }

    .form-input {
      padding: 0.75rem;
      background: var(--color-bg-surface);
      color: var(--color-text-main);
      border: 1px solid var(--color-border-strong);
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary-base);
      box-shadow: var(--glow-primary);
    }

    .error {
      color: var(--color-error);
      font-size: 0.85rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
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
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.03);
      color: var(--color-text-main);
      border: 1px solid var(--color-border-subtle);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: var(--color-border-strong);
    }

/* ===== DATE ICON FIX (GOAL FORM) ===== */
.form-input[type="date"] {
  color-scheme: dark;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(6px);
}

/* Calendar icon → white */
.form-input[type="date"]::-webkit-date-picker-indicator {
  filter: invert(1) brightness(2);
  opacity: 1;
  cursor: pointer;
}

/* Hover effect */
.form-input[type="date"]::-webkit-date-picker-indicator:hover {
  transform: scale(1.1);
}

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `],
})
export class GoalFormComponent implements OnInit {
  @Output() submitted = new EventEmitter<Goal>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() editingGoal?: Goal;

  goalForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private goalService: GoalService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const defaultDate = futureDate.toISOString().split('T')[0];

    this.goalForm = this.fb.group({
      goalType: ['weight_loss', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      targetValue: [0, [Validators.required, Validators.min(0.1)]],
      unit: ['lbs', Validators.required],
      currentValue: [0, [Validators.required, Validators.min(0)]],
      targetDate: [defaultDate, Validators.required],
    });

    if (this.editingGoal) {
      const targetDate = new Date(this.editingGoal.targetDate).toISOString().split('T')[0];
      this.goalForm.patchValue({
        goalType: this.editingGoal.goalType,
        description: this.editingGoal.description,
        targetValue: this.editingGoal.targetValue,
        unit: this.editingGoal.unit,
        currentValue: this.editingGoal.currentValue,
        targetDate,
      });
    }
  }

  onSubmit(): void {
    if (this.goalForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.goalForm.value;
    const goal: Goal = {
      ...formValue,
      initialValue: this.editingGoal ? this.editingGoal.initialValue : formValue.currentValue,
      targetDate: new Date(formValue.targetDate),
      startDate: this.editingGoal ? this.editingGoal.startDate : new Date(),
      status: this.editingGoal ? this.editingGoal.status : 'active',
    };

    this.submitted.emit(goal);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
