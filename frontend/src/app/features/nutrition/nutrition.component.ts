import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { NutritionEntryFormComponent } from './components/nutrition-entry-form/nutrition-entry-form.component';
import { NutritionService } from './services/nutrition.service';
import { UserContextService } from '../../core/services/user-context.service';
import { Subject, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/components/Button/button.component';
import { CardComponent } from '../../shared/components/Card/card.component';
import { SpinnerComponent, ProgressBarComponent } from '../../shared/components/Loading';
import { FormInputComponent } from '../../shared/components/FormInput/form-input.component';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NutritionEntryFormComponent,
    ButtonComponent,
    CardComponent,
    SpinnerComponent,
    ProgressBarComponent,
    FormInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit, OnDestroy {
  totalProtein = 0;
  totalCarbs = 0;
  totalFats = 0;
  totalCalories = 0;
  showForm = false;
  loading = false;
  prefilledMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch';
  prefilledFood: any | null = null;

  meals: any = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  };

  entries: any[] = [];
  selectedDate: string = new Date().toISOString();

  // Food search properties
  foodSearchQuery = '';
  searchingFood = false;
  foodSearchResults: any[] = [];
  private foodSearchSubject = new Subject<string>();

  // Daily goals
  dailyGoals = {
    calories: 2000,
    protein: 150,
    carbohydrates: 250,
    fats: 80
  };

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private nutritionService: NutritionService,
    private userContext: UserContextService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize with today's date
    this.selectedDate = this.formatDateForInput(new Date());
  }

  ngOnInit(): void {
    this.loadEntries();
    this.loadNutritionData();

    // Setup food search with debounce
    this.foodSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (!query || query.length < 2) {
            this.foodSearchResults = [];
            return of([]);
          }
          this.searchingFood = true;
          return this.nutritionService.searchFoods(query).pipe(
            tap(() => this.searchingFood = false)
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results: any) => {
          this.foodSearchResults = results || [];
        },
        error: (error) => {
          this.searchingFood = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isTodayOrFuture(): boolean {
    const today = new Date();
    const selected = new Date(this.selectedDate);

    // remove time
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    return selected >= today;
  }

  loadNutritionData() {
    this.loading = true;
    this.cdr.markForCheck();
    this.userContext.userId$
      .pipe(
        switchMap(userId => {
          if (!userId) return of({ entries: [], dailyTotals: { calories: 0, protein: 0, carbohydrates: 0, fats: 0 }, dailyGoals: this.dailyGoals });
          return this.nutritionService.getNutritionEntries(new Date(this.selectedDate).toISOString());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.entries) {
            this.entries = response.entries ?? [];
            this.groupMeals();
            this.calculateMacros();
            this.dailyGoals = response.dailyGoals || this.dailyGoals;
            this.calculateMacros();
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          void error;
          this.loading = false;
          this.modalService.error('Failed to load nutrition data');
          this.cdr.markForCheck();
        }
      });
  }

  calculateMacros() {
    const allMeals = [
      ...this.meals.breakfast,
      ...this.meals.lunch,
      ...this.meals.dinner,
      ...this.meals.snack
    ];

    this.totalProtein = allMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    this.totalCarbs = allMeals.reduce((sum, m) => sum + (m.carbohydrates || 0), 0);
    this.totalFats = allMeals.reduce((sum, m) => sum + (m.fats || 0), 0);
    this.totalCalories = allMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  }

  groupMeals(): void {
    this.meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };

    this.entries.forEach((entry: any) => {
      if (this.meals[entry.mealType]) {
        this.meals[entry.mealType].push(entry);
      }
    });
  }

  toggleAddMeal() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.prefilledMealType = 'lunch';
      this.prefilledFood = null;
    }
  }

  logMeal(type?: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
    if (type) {
      this.prefilledMealType = type;
    }
    this.prefilledFood = null;
    this.showForm = true;
  }

  onMealSubmitted(entry: any): void {
    this.showForm = false;
    this.modalService.success('Meal logged successfully!');
    this.prefilledMealType = 'lunch';
    this.prefilledFood = null;

    this.loadNutritionData();
    this.cdr.markForCheck();
  }

  // Date picker methods
  previousDay() {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate = this.formatDateForInput(date);
    this.onDateChange();
  }

  // nextDay() {
  //   const date = new Date(this.selectedDate);
  //   date.setDate(date.getDate() + 1);
  //   this.selectedDate = this.formatDateForInput(date);
  //   this.onDateChange();
  // }

  nextDay() {
    if (this.isTodayOrFuture()) return;

    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);

    this.selectedDate = this.formatDateForInput(date);
    this.onDateChange();
  }

  onDateChange() {
    this.entries = [];
    this.groupMeals();
    this.loadNutritionData();
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Food search method
  onFoodSearch() {
    if (this.foodSearchQuery.trim()) {
      this.foodSearchSubject.next(this.foodSearchQuery);
    } else {
      this.foodSearchResults = [];
    }
  }

  // selectFoodFromSearch(food: any) {
  //   this.prefilledFood = food;
  //   this.foodSearchQuery = '';
  //   this.foodSearchResults = [];
  //   this.showForm = true;
  // }

  selectFoodFromSearch(food: any) {

    const now = new Date(this.selectedDate);

    // ✅ USE USER SELECTED TYPE (NOT AUTO OVERRIDE)
    const mealType = this.prefilledMealType;

    now.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);

    const entry = {
      ...food,
      quantity: 1,
      unit: 'serving',
      mealType,
      loggedAt: now.toISOString()
    };

    this.nutritionService.createNutritionEntry(entry).subscribe({
      next: () => {
        this.modalService.success(`Added to ${mealType} 🍽️`);
        this.loadNutritionData();
        this.cdr.markForCheck();
      },
      error: () => {
        this.modalService.error('Failed to add meal');
      }
    });

    this.foodSearchQuery = '';
    this.foodSearchResults = [];
  }

  getMealCalories(type: string): number {
    return this.meals[type].reduce(
      (sum: number, m: any) => sum + (m.calories || 0),
      0
    );
  }

  getCalorieProgress(): number {
  if (!this.dailyGoals.calories) return 0;
  return Math.min((this.totalCalories / this.dailyGoals.calories) * 100, 100);
}

  // ===== FETCH DATA =====
  loadEntries(date?: string) {
    this.nutritionService.getNutritionEntries(date).subscribe(res => {
      this.entries = res.entries || [];
    });
  }

  // ===== FILTER MEALS =====
  getMealsByType(type: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
    return this.entries.filter(e => e.mealType === type);
  }

  // ===== CALORIES =====
  getCaloriesByType(type: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
    return this.getMealsByType(type)
      .reduce((sum, e) => sum + (e.calories || 0), 0);
  }

  // ===== TEMPLATE FUNCTIONS =====
  getBreakfastMeals() { return this.getMealsByType('breakfast'); }
  getLunchMeals() { return this.getMealsByType('lunch'); }
  getDinnerMeals() { return this.getMealsByType('dinner'); }
  getSnackMeals() { return this.getMealsByType('snack'); }

  getBreakfastCalories() { return this.getCaloriesByType('breakfast'); }
  getLunchCalories() { return this.getCaloriesByType('lunch'); }
  getDinnerCalories() { return this.getCaloriesByType('dinner'); }
  getSnackCalories() { return this.getCaloriesByType('snack'); }

  getMealIcon(type: string): string {
    const icons: { [key: string]: string } = {
      breakfast: '🌅',
      lunch: '☀️',
      snack: '🍿',
      dinner: '🌙',
    };
    return icons[type] || '🍽️';
  }
}
