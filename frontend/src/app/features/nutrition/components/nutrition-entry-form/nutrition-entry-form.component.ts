import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutritionService, NutritionEntry } from '../../services/nutrition.service';

@Component({
  selector: 'app-nutrition-entry-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
  <div class="form-wrapper">
    <div class="form-container">
      <form [formGroup]="entryForm" (ngSubmit)="onSubmit()" class="meal-form">
        <div class="form-group">
          <label for="foodName">Food Name</label>
          <input
            id="foodName"
            type="text"
            formControlName="foodName"
            placeholder="e.g., Paneer Bhurji"
            class="form-input"
          />
          <span class="error" *ngIf="entryForm.get('foodName')?.invalid && entryForm.get('foodName')?.touched">
            Food name is required
          </span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              formControlName="quantity"
              placeholder="100"
              class="form-input"
              step="0.1"
            />
            <span class="error" *ngIf="entryForm.get('quantity')?.invalid && entryForm.get('quantity')?.touched">
              Quantity is required
            </span>
          </div>

          <div class="form-group">
            <label for="unit">Unit</label>
            <select id="unit" formControlName="unit" class="form-input">
              <option value="g">Grams (g)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="serving">Serving</option>
              <option value="oz">Ounces (oz)</option>
              <option value="cup">Cup</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="calories">Calories</label>
            <input
              id="calories"
              type="number"
              formControlName="calories"
              placeholder="0"
              class="form-input"
            />
            <span class="error" *ngIf="entryForm.get('calories')?.invalid && entryForm.get('calories')?.touched">
              Calories is required
            </span>
          </div>

          <div class="form-group">
            <label for="protein">Protein (g)</label>
            <input
              id="protein"
              type="number"
              formControlName="protein"
              placeholder="0"
              class="form-input"
              step="0.1"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="carbohydrates">Carbs (g)</label>
            <input
              id="carbohydrates"
              type="number"
              formControlName="carbohydrates"
              placeholder="0"
              class="form-input"
              step="0.1"
            />
          </div>

          <div class="form-group">
            <label for="fats">Fats (g)</label>
            <input
              id="fats"
              type="number"
              formControlName="fats"
              placeholder="0"
              class="form-input"
              step="0.1"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="mealType">Meal Type</label>
          <select id="mealType" formControlName="mealType" class="form-input">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div class="form-group">
          <label for="loggedAt">Time</label>
          <input
            id="loggedAt"
            type="datetime-local"
            formControlName="loggedAt"
            class="form-input"
            [max]="getMaxDateTime()"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="!entryForm.valid || isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Log Meal' }}
          </button>
        </div>
      </form>
    </div>
    </div>
  `,
  // styles: [`
  //   :host { display: block; }

  //   .form-wrapper {
  //     min-height: 100vh;
  //     display: flex;
  //     align-items: center;
  //     justify-content: center;
  //     background: linear-gradient(135deg, ##0f172a 20%, #000000ff 100%);
  //     padding: 2rem;
  //   }

  //   .form-container {
  //     padding: 1.5rem;
  //     width: 100%;
  //     overflow-y: auto;
  //     max-height: calc(90vh - 80px);
  //     display: flex;
  //     flex-direction: column;
  //   }

  //   form {
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

  //   label {
  //     font-weight: 600;
  //     color: var(--color-text-main);
  //     font-size: 0.95rem;
  //   }

  //   .form-input {
  //     padding: 0.75rem;
  //     background: var(--color-bg-surface);
  //     color: var(--color-text-main);
  //     border: 1px solid var(--color-border-strong);
  //     border-radius: 8px;
  //     font-size: 1rem;
  //     font-family: inherit;
  //     transition: all 0.2s ease;
  //   }

  //   .form-input:focus {
  //     outline: none;
  //     border-color: var(--color-primary-base);
  //     box-shadow: var(--glow-primary);
  //   }

  //   .error {
  //     color: var(--color-error);
  //     font-size: 0.85rem;
  //     font-weight: 500;
  //   }

  //   .form-actions {
  //     display: flex;
  //     gap: 1rem;
  //     justify-content: flex-end;
  //     margin-top: 1.5rem;
  //     padding-top: 1.5rem;
  //     border-top: 1px solid var(--color-border-subtle);
  //     position: sticky;
  //     bottom: 0;
  //     background: rgba(15, 23, 42, 0.85);
  //     flex-shrink: 0;
  //   }

  //   .btn {
  //     padding: 0.75rem 1.5rem;
  //     border: none;
  //     border-radius: 8px;
  //     font-weight: 700;
  //     font-size: 1rem;
  //     cursor: pointer;
  //     transition: all 0.2s ease;
  //     font-family: inherit;
  //     display: inline-flex;
  //     align-items: center;
  //     justify-content: center;
  //     min-width: 120px;
  //   }

  //   .btn-primary {
  //     background: var(--color-primary-base);
  //     color: white;
  //     box-shadow: var(--glow-primary);
  //   }

  //   .btn-primary:hover:not(:disabled) {
  //     transform: translateY(-2px);
  //   }

  //   .btn-primary:disabled {
  //     opacity: 0.5;
  //     cursor: not-allowed;
  //   }

  //   .btn-secondary {
  //     background: rgba(255, 255, 255, 0.03);
  //     color: var(--color-text-main);
  //     border: 1px solid var(--color-border-subtle);
  //   }

  //   .btn-secondary:hover {
  //     background: rgba(255, 255, 255, 0.06);
  //     border-color: var(--color-border-strong);
  //   }

  //   @media (max-width: 640px) {
  //     .form-row {
  //       grid-template-columns: 1fr;
  //     }

  //     .form-actions {
  //       flex-direction: column-reverse;
  //     }

  //     .btn {
  //       width: 100%;
  //     }
  //   }
  // `],
  styles: [`
    :host { display: block; }

.form-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.form-container {
  width: 100%;
  padding: 1.5rem 2rem 2rem 2rem;
}

.meal-form {
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

.form-input {
  padding: 0.875rem 1rem;
  background: var(--color-bg-surface);
  color: var(--color-text-main);
  border: 1px solid var(--color-border-strong);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
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
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--color-primary-base);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255,255,255,0.03);
  color: var(--color-text-main);
  border: 1px solid var(--color-border-subtle);
}

/* ===== DATETIME (MEAL TIME) FIX ===== */

.form-input[type="datetime-local"] {
  color-scheme: dark;
}

/* Calendar + Clock icon → WHITE */
.form-input[type="datetime-local"]::-webkit-date-picker-indicator {
  filter: invert(1) brightness(2);
  opacity: 1;
  cursor: pointer;
}

/* Hover */
.form-input[type="datetime-local"]::-webkit-date-picker-indicator:hover {
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
export class NutritionEntryFormComponent implements OnInit {
  @Input() mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  @Input() prefillFood?: Partial<NutritionEntry>;
  @Output() submitted = new EventEmitter<NutritionEntry>();
  @Output() cancelled = new EventEmitter<void>();

  entryForm!: FormGroup;
  isSubmitting = false;

  searchResults: any[] = [];
  isSearching = false;

  constructor(private fb: FormBuilder, private nutritionService: NutritionService) { }

  ngOnInit(): void {
    this.initializeForm();
    if (this.mealType) {
      this.entryForm.patchValue({ mealType: this.mealType });
    }
    if (this.prefillFood) {
      this.entryForm.patchValue({
        foodName: this.prefillFood.foodName,
        unit: this.prefillFood.unit,
        calories: this.prefillFood.calories,
        protein: this.prefillFood.protein,
        carbohydrates: this.prefillFood.carbohydrates,
        fats: this.prefillFood.fats,
      });
    }
  }

  private initializeForm(): void {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    this.entryForm = this.fb.group({
      foodName: ['', [Validators.required, Validators.minLength(2)]],
      quantity: [100, [Validators.required, Validators.min(0.1)]],
      unit: ['g', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.min(0)]],
      carbohydrates: [0, [Validators.min(0)]],
      fats: [0, [Validators.min(0)]],
      mealType: ['lunch', Validators.required],
      loggedAt: [localDateTime, Validators.required],
    });
  }

  getMaxDateTime(): string {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  onSubmit(): void {
  if (this.entryForm.invalid) return;

  this.isSubmitting = true;

  const formValue = this.entryForm.value;

  const entry: NutritionEntry = {
    foodName: String(formValue.foodName).trim(),
    quantity: Number(formValue.quantity),
    unit: String(formValue.unit),
    calories: Number(formValue.calories),
    protein: Number(formValue.protein || 0),
    carbohydrates: Number(formValue.carbohydrates || 0),
    fats: Number(formValue.fats || 0),
    mealType: formValue.mealType,
    loggedAt: new Date(formValue.loggedAt)
  };

  console.log('FINAL PAYLOAD:', entry);

  this.nutritionService.createNutritionEntry(entry).subscribe({
    next: (result) => {
      this.isSubmitting = false;
      this.submitted.emit(result);
    },
    error: (err) => {
      console.error('BACKEND ERROR:', err);
      this.isSubmitting = false;
    }
  });
}

  onCancel(): void {
    this.cancelled.emit();
  }

  onFoodSearch(query: string) {
  if (!query || query.length < 2) {
    this.searchResults = [];
    return;
  }

  this.isSearching = true;

  this.nutritionService.searchFoods(query).subscribe({
    next: (res: any) => {
      this.searchResults = res.items || [];
      this.isSearching = false;
    },
    error: () => {
      this.isSearching = false;
    }
  });
}

selectFood(item: any) {
  this.entryForm.patchValue({
    foodName: item.foodName,
    unit: item.unit,
    calories: item.calories,
    protein: item.protein,
    carbohydrates: item.carbohydrates,
    fats: item.fats
  });

  this.searchResults = [];
}
}
