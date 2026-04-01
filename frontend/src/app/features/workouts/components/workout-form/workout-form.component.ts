import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutService } from '../../services/workout.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-wrapper">
      <div class="form-container">
        <div class="form-header">
          <span *ngIf="!loading">
            <h1>{{ isEditMode ? 'Update Workout' : 'Log Workout' }}</h1>
          </span>
          <p class="subtitle">Record your exercise session</p>
        </div>

        <form [formGroup]="workoutForm" (ngSubmit)="onSubmit()" class="workout-form">
          <div class="form-group">
            <label for="exerciseType">Exercise Type</label>
            <select id="exerciseType" formControlName="exerciseType" class="form-input">
              <option value="">Select exercise type</option>
              <option value="Running">Running</option>
              <option value="Weight Training">Weight Training</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
              <option value="Pilates">Pilates</option>
              <option value="Other">Other</option>
            </select>
            <span class="error-text" *ngIf="workoutForm.get('exerciseType')?.invalid && workoutForm.get('exerciseType')?.touched">
              Please select an exercise type
            </span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startTime">Start Time</label>
              <input id="startTime" type="datetime-local" formControlName="startTime" class="form-input" />
              <span class="error-text" *ngIf="workoutForm.get('startTime')?.invalid && workoutForm.get('startTime')?.touched">
                Start time is required
              </span>
            </div>

            <div class="form-group">
              <label for="endTime">End Time</label>
              <input id="endTime" type="datetime-local" formControlName="endTime" class="form-input" />
              <span class="error-text" *ngIf="workoutForm.get('endTime')?.invalid && workoutForm.get('endTime')?.touched">
                End time is required
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="duration">Duration (minutes)</label>
              <input id="duration" type="number" formControlName="duration" class="form-input" min="0" placeholder="30" />
              <span class="error-text" *ngIf="workoutForm.get('duration')?.invalid && workoutForm.get('duration')?.touched">
                Duration is required
              </span>
            </div>

            <div class="form-group">
              <label for="intensity">Intensity (1-10)</label>
              <input id="intensity" type="number" formControlName="intensity" class="form-input" min="1" max="10" placeholder="7" />
              <span class="error-text" *ngIf="workoutForm.get('intensity')?.invalid && workoutForm.get('intensity')?.touched">
                Intensity must be between 1-10
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notes (optional)</label>
            <textarea id="notes" formControlName="notes" class="form-input textarea" placeholder="How did you feel? Any notes?"></textarea>
          </div>

          <div *ngIf="error" class="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <strong>Error</strong>
              <p>{{ error }}</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" (click)="onCancel()" class="btn btn-secondary">Cancel</button>
            <button type="submit" [disabled]="!workoutForm.valid || loading" class="btn btn-primary">
              <span *ngIf="!loading">
                Log Workout
              </span>
              <span *ngIf="loading">
                <span class="spinner"></span>
                Saving...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

       .form-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #000000ff 100%);
      padding: 2rem;
    }

      .form-container {
      background: var(--color-bg-card);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border);
      max-width: 600px;
      width: 100%;
    }

      .form-header {
      margin-bottom: 2rem;
    }

    .form-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      color: var(--primary);
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: var(--text-light);
      font-size: 0.95rem;
    }

    .workout-form {
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

    .form-group label {
      font-weight: 600;
      color: var(--color-text-main);
      font-size: 0.95rem;
    }

    .form-input {
      padding: 0.875rem 1rem;
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

      .form-input.textarea {
      resize: vertical;
      min-height: 100px;
    }

    .error-text {
      color: var(--color-error);
      font-size: 0.85rem;
      font-weight: 500;
    }

     .alert {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 10px;
      font-size: 0.9rem;
    }

    .alert-error {
      background: #FEE2E2;
      border: 1px solid #FECACA;
      color: #991B1B;
    }

    .alert svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .alert strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .alert p {
      margin: 0;
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

      .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* ===== DATETIME ICON (CALENDAR + CLOCK) ===== */
.form-input[type="datetime-local"] {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(6px);  
  color-scheme: dark;
}

/* Icon color */
.form-input[type="datetime-local"]::-webkit-date-picker-indicator {
  filter: invert(1) brightness(2);
  opacity: 1;
  cursor: pointer;
}

/* Hover effect */
.form-input[type="datetime-local"]::-webkit-date-picker-indicator:hover {
  transform: scale(1.1);
}

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
    .form-container {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }

            .form-header h1 {
        font-size: 1.5rem;
      }
    }
  `],
  // styles: [`
  //   :host {
  //     --primary: #0F172A;
  //     --secondary: #06B6D4;
  //     --accent: #8B5CF6;
  //     --text: #1E293B;
  //     --text-light: #64748B;
  //     --border: #E2E8F0;
  //     --light: #F8FAFC;
  //     --error: #EF4444;
  //   }

  //   .form-wrapper {
  //     min-height: 100vh;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  //     padding: 2rem;
  //   }

  //   .form-container {
  //     background: white;
  //     border-radius: 16px;
  //     padding: 2rem;
  //     box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  //     border: 1px solid var(--border);
  //     max-width: 600px;
  //     width: 100%;
  //   }

  //   .form-header {
  //     margin-bottom: 2rem;
  //   }

  //   .form-header h1 {
  //     margin: 0 0 0.5rem 0;
  //     font-size: 1.75rem;
  //     color: var(--primary);
  //     font-weight: 700;
  //   }

  //   .subtitle {
  //     margin: 0;
  //     color: var(--text-light);
  //     font-size: 0.95rem;
  //   }

  //   .workout-form {
  //     display: flex;
  //     flex-direction: column;
  //     gap: 1.5rem;
  //   }

  //   .form-group {
  //     display: flex;
  //     flex-direction: column;
  //     gap: 0.5rem;
  //   }

  //   .form-row {
  //     display: grid;
  //     grid-template-columns: 1fr 1fr;
  //     gap: 1rem;
  //   }

  //   .form-group label {
  //     font-weight: 600;
  //     color: var(--text);
  //     font-size: 0.9rem;
  //   }

  //   .form-input {
  //     padding: 0.875rem 1rem;
  //     border: 1px solid var(--border);
  //     border-radius: 10px;
  //     font-size: 0.95rem;
  //     font-family: inherit;
  //     transition: all 0.3s ease;
  //     background: white;
  //   }

  //   .form-input:focus {
  //     outline: none;
  //     border-color: var(--secondary);
  //     box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
  //   }

  //   .form-input.textarea {
  //     resize: vertical;
  //     min-height: 100px;
  //   }

  //   .error-text {
  //     font-size: 0.8rem;
  //     color: var(--error);
  //     font-weight: 500;
  //   }

  //   .alert {
  //     display: flex;
  //     gap: 1rem;
  //     padding: 1rem;
  //     border-radius: 10px;
  //     font-size: 0.9rem;
  //   }

  //   .alert-error {
  //     background: #FEE2E2;
  //     border: 1px solid #FECACA;
  //     color: #991B1B;
  //   }

  //   .alert svg {
  //     flex-shrink: 0;
  //     width: 20px;
  //     height: 20px;
  //   }

  //   .alert strong {
  //     display: block;
  //     margin-bottom: 0.25rem;
  //   }

  //   .alert p {
  //     margin: 0;
  //   }

  //   .form-actions {
  //     display: flex;
  //     gap: 1rem;
  //     margin-top: 1rem;
  //   }

  //   .btn {
  //     padding: 0.875rem 1.5rem;
  //     border: none;
  //     border-radius: 10px;
  //     font-weight: 700;
  //     cursor: pointer;
  //     transition: all 0.3s ease;
  //     font-size: 0.95rem;
  //     font-family: inherit;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     gap: 0.5rem;
  //     flex: 1;
  //   }

  //   .btn-primary {
  //     background: linear-gradient(135deg, var(--primary), var(--secondary));
  //     color: white;
  //     box-shadow: 0 4px 15px rgba(15, 23, 42, 0.2);
  //   }

  //   .btn-primary:hover:not(:disabled) {
  //     transform: translateY(-2px);
  //     box-shadow: 0 8px 25px rgba(15, 23, 42, 0.3);
  //   }

  //   .btn-primary:disabled {
  //     opacity: 0.6;
  //     cursor: not-allowed;
  //   }

  //   .btn-secondary {
  //     background: white;
  //     color: var(--text);
  //     border: 1px solid var(--border);
  //   }

  //   .btn-secondary:hover {
  //     background: var(--light);
  //     border-color: var(--secondary);
  //   }

  //   .spinner {
  //     width: 16px;
  //     height: 16px;
  //     border: 2px solid rgba(255, 255, 255, 0.3);
  //     border-top-color: white;
  //     border-radius: 50%;
  //     animation: spin 0.8s linear infinite;
  //   }

  //   @keyframes spin {
  //     to { transform: rotate(360deg); }
  //   }

  //   @media (max-width: 640px) {
  //     .form-container {
  //       padding: 1.5rem;
  //     }

  //     .form-row {
  //       grid-template-columns: 1fr;
  //     }

  //     .form-header h1 {
  //       font-size: 1.5rem;
  //     }
  //   }
  // `]
})
export class WorkoutFormComponent implements OnInit {
  workoutForm: FormGroup;
  loading = false;
  error: string | null = null;
  workoutId?: string;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.workoutForm = this.fb.group({
      exerciseType: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      intensity: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      notes: [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.workoutId = id;
      this.isEditMode = true;
      this.loadWorkout();
    } else {
      // Default values for create
      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 60000);

      this.workoutForm.patchValue({
        startTime: this.formatDateTimeLocal(startTime),
        endTime: this.formatDateTimeLocal(now),
        duration: 30,
        intensity: 7,
      });
    }
  }

  onSubmit() {
    if (this.workoutForm.invalid) return;

    this.loading = true;
    this.error = null;

    const formValue = this.workoutForm.value;

    const payload: any = {
      exerciseType: formValue.exerciseType,
      startTime: new Date(formValue.startTime).toISOString(),
      endTime: new Date(formValue.endTime).toISOString(),
      duration: parseInt(formValue.duration),
      intensity: parseInt(formValue.intensity),
      caloriesBurned: formValue.caloriesBurned || 0,
      notes: formValue.notes,
    };

    const request$ = this.isEditMode
      ? this.workoutService.updateWorkout(this.workoutId!, payload)
      : this.workoutService.createWorkout(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;

        this.notificationService.success(
          this.isEditMode
            ? 'Workout updated successfully 💪'
            : 'Workout logged successfully 💪'
        );

        this.router.navigate(['/workouts']);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.error?.message ||
          err.error?.message ||
          'Something went wrong';
      },
    });
  }

  onCancel() {
    this.router.navigate(['/workouts']);
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  loadWorkout() {
    this.workoutService.getWorkout(this.workoutId!).subscribe({
      next: (workout: any) => {
        this.workoutForm.patchValue({
          exerciseType: workout.exerciseType,
          startTime: this.formatDateTimeLocal(new Date(workout.startTime)),
          endTime: this.formatDateTimeLocal(new Date(workout.endTime)),
          duration: workout.duration,
          intensity: workout.intensity,
          notes: workout.notes,
        });
      },
      error: () => {
        this.notificationService.error('Failed to load workout');
        this.router.navigate(['/workouts']);
      },
    });
  }
}
