import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionComponent } from './nutrition.component';
import { NutritionService } from './services/nutrition.service';
import { UserContextService } from '../../core/services/user-context.service';
import { ModalService } from '../../shared/services/modal.service';
import { of, throwError } from 'rxjs';

describe('NutritionComponent', () => {
  let component: NutritionComponent;
  let fixture: ComponentFixture<NutritionComponent>;
  let nutritionService: jasmine.SpyObj<NutritionService>;
  let userContextService: jasmine.SpyObj<UserContextService>;
  let modalService: jasmine.SpyObj<ModalService>;

  const mockNutritionResponse: any = {
    entries: [
      {
        _id: '1',
        foodName: 'Chicken Breast',
        quantity: 100,
        unit: 'g',
        calories: 165,
        protein: 31,
        carbohydrates: 0,
        fats: 3.6,
        mealType: 'lunch' as const,
        loggedAt: new Date('2024-01-15T12:00:00'),
      },
      {
        _id: '2',
        foodName: 'Brown Rice',
        quantity: 150,
        unit: 'g',
        calories: 195,
        protein: 4.3,
        carbohydrates: 43,
        fats: 1.6,
        mealType: 'lunch' as const,
        loggedAt: new Date('2024-01-15T12:15:00'),
      },
      {
        _id: '3',
        foodName: 'Banana',
        quantity: 1,
        unit: 'serving',
        calories: 105,
        protein: 1.3,
        carbohydrates: 27,
        fats: 0.3,
        mealType: 'breakfast' as const,
        loggedAt: new Date('2024-01-15T08:00:00'),
      },
    ],
    dailyTotals: {
      calories: 465,
      protein: 36.6,
      carbohydrates: 70,
      fats: 5.5,
    },
    dailyGoals: {
      calories: 2000,
      protein: 150,
      carbohydrates: 250,
      fats: 80,
    },
  };

  beforeEach(async () => {
    const nutritionServiceSpy = jasmine.createSpyObj('NutritionService', [
      'getNutritionEntries',
      'createNutritionEntry',
      'searchFood',
    ]);
    const userContextServiceSpy = jasmine.createSpyObj('UserContextService', [], {
      userId$: of('user123'),
    });
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [CommonModule, FormsModule, NutritionComponent],
      providers: [
        { provide: NutritionService, useValue: nutritionServiceSpy },
        { provide: UserContextService, useValue: userContextServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
      ],
    }).compileComponents();

    nutritionService = TestBed.inject(NutritionService) as jasmine.SpyObj<NutritionService>;
    userContextService = TestBed.inject(UserContextService) as jasmine.SpyObj<UserContextService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

    nutritionService.getNutritionEntries.and.returnValue(of(mockNutritionResponse));
    nutritionService.searchFood.and.returnValue(of([]));

    fixture = TestBed.createComponent(NutritionComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with today\'s date', () => {
      const today = new Date();
      const expectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      expect(component.selectedDate).toBe(expectedDate);
    });

    it('should load nutrition data on init', () => {
      fixture.detectChanges();
      expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
    });

    it('should set loading state during data fetch', (done) => {
      nutritionService.getNutritionEntries.and.returnValue(of(mockNutritionResponse));
      fixture.detectChanges();
      
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Daily Summary Calculation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate total calories correctly', () => {
      expect(component.totalCalories).toBe(465);
    });

    it('should calculate total protein correctly', () => {
      expect(component.totalProtein).toBe(36.6);
    });

    it('should calculate total carbohydrates correctly', () => {
      expect(component.totalCarbs).toBe(70);
    });

    it('should calculate total fats correctly', () => {
      expect(component.totalFats).toBe(5.5);
    });

    it('should set daily goals from response', () => {
      expect(component.dailyGoals).toEqual(mockNutritionResponse.dailyGoals);
    });
  });

  describe('Meal Organization by Type', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter breakfast meals correctly', () => {
      const breakfastMeals = component.getBreakfastMeals();
      expect(breakfastMeals.length).toBe(1);
      expect(breakfastMeals[0].foodName).toBe('Banana');
    });

    it('should filter lunch meals correctly', () => {
      const lunchMeals = component.getLunchMeals();
      expect(lunchMeals.length).toBe(2);
      expect(lunchMeals[0].foodName).toBe('Chicken Breast');
      expect(lunchMeals[1].foodName).toBe('Brown Rice');
    });

    it('should filter dinner meals correctly', () => {
      const dinnerMeals = component.getDinnerMeals();
      expect(dinnerMeals.length).toBe(0);
    });

    it('should filter snack meals correctly', () => {
      const snackMeals = component.getSnackMeals();
      expect(snackMeals.length).toBe(0);
    });

    it('should calculate breakfast calories correctly', () => {
      expect(component.getBreakfastCalories()).toBe(105);
    });

    it('should calculate lunch calories correctly', () => {
      expect(component.getLunchCalories()).toBe(360);
    });

    it('should calculate dinner calories correctly', () => {
      expect(component.getDinnerCalories()).toBe(0);
    });

    it('should calculate snack calories correctly', () => {
      expect(component.getSnackCalories()).toBe(0);
    });
  });

  describe('Date Picker Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to previous day', () => {
      const initialDate = component.selectedDate;
      component.previousDay();
      
      const initial = new Date(initialDate);
      const previous = new Date(component.selectedDate);
      expect(previous.getTime()).toBeLessThan(initial.getTime());
    });

    it('should navigate to next day', () => {
      const initialDate = component.selectedDate;
      component.nextDay();
      
      const initial = new Date(initialDate);
      const next = new Date(component.selectedDate);
      expect(next.getTime()).toBeGreaterThan(initial.getTime());
    });

    it('should reload data when date changes', () => {
      nutritionService.getNutritionEntries.calls.reset();
      component.onDateChange();
      expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
    });
  });

  describe('Food Search Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should search food with query', (done) => {
      const mockSearchResults = [
        { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
      ];
      nutritionService.searchFood.and.returnValue(of(mockSearchResults));

      component.foodSearchQuery = 'chicken';
      component.onFoodSearch();

      setTimeout(() => {
        expect(nutritionService.searchFood).toHaveBeenCalledWith('chicken');
        done();
      }, 400);
    });

    it('should clear search results when query is empty', () => {
      component.foodSearchQuery = '';
      component.onFoodSearch();
      expect(component.foodSearchResults.length).toBe(0);
    });

    it('should not search with query less than 2 characters', (done) => {
      nutritionService.searchFood.calls.reset();
      component.foodSearchQuery = 'a';
      component.onFoodSearch();

      setTimeout(() => {
        expect(nutritionService.searchFood).not.toHaveBeenCalled();
        done();
      }, 400);
    });

    it('should clear search query after selecting food', () => {
      component.foodSearchQuery = 'chicken';
      component.foodSearchResults = [
        { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
      ];

      component.selectFoodFromSearch(component.foodSearchResults[0]);

      expect(component.foodSearchQuery).toBe('');
      expect(component.foodSearchResults.length).toBe(0);
    });
  });

  describe('Modal Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle add meal form visibility', () => {
      expect(component.showForm).toBe(false);
      component.toggleAddMeal();
      expect(component.showForm).toBe(true);
      component.toggleAddMeal();
      expect(component.showForm).toBe(false);
    });

    it('should close form and show success message on meal submission', () => {
      component.showForm = true;
      const mockEntry = { foodName: 'Test Food', calories: 100 };

      component.onMealSubmitted(mockEntry);

      expect(component.showForm).toBe(false);
      expect(modalService.success).toHaveBeenCalledWith('Meal logged successfully!');
    });

    it('should reload nutrition data after meal submission', (done) => {
      nutritionService.getNutritionEntries.calls.reset();
      component.onMealSubmitted({});

      setTimeout(() => {
        expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
        done();
      }, 400);
    });
  });

  describe('Responsive Layout', () => {
    it('should render date picker section', () => {
      fixture.detectChanges();
      const datePickerSection = fixture.nativeElement.querySelector('.date-picker-section');
      expect(datePickerSection).toBeTruthy();
    });

    it('should render daily summary card', () => {
      fixture.detectChanges();
      const summaryCard = fixture.nativeElement.querySelector('.daily-summary-card');
      expect(summaryCard).toBeTruthy();
    });

    it('should render meals by type section', () => {
      fixture.detectChanges();
      const mealsSection = fixture.nativeElement.querySelector('.meals-by-type-section');
      expect(mealsSection).toBeTruthy();
    });

    it('should render food search section', () => {
      fixture.detectChanges();
      const searchSection = fixture.nativeElement.querySelector('.food-search-section');
      expect(searchSection).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle nutrition data loading error', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      fixture.detectChanges();

      expect(modalService.error).toHaveBeenCalledWith('Failed to load nutrition data');
    });

    it('should handle food search error gracefully', (done) => {
      nutritionService.searchFood.and.returnValue(
        throwError(() => new Error('Search Error'))
      );

      component.foodSearchQuery = 'test';
      component.onFoodSearch();

      setTimeout(() => {
        expect(component.searchingFood).toBe(false);
        done();
      }, 400);
    });
  });

  describe('Meal Icon Display', () => {
    it('should return correct icon for breakfast', () => {
      expect(component.getMealIcon('breakfast')).toBe('🌅');
    });

    it('should return correct icon for lunch', () => {
      expect(component.getMealIcon('lunch')).toBe('☀️');
    });

    it('should return correct icon for dinner', () => {
      expect(component.getMealIcon('dinner')).toBe('🌙');
    });

    it('should return correct icon for snack', () => {
      expect(component.getMealIcon('snack')).toBe('🍿');
    });

    it('should return default icon for unknown meal type', () => {
      expect(component.getMealIcon('unknown')).toBe('🍽️');
    });
  });

  describe('Loading State', () => {
    it('should display loading state while fetching data', () => {
      nutritionService.getNutritionEntries.and.returnValue(of(mockNutritionResponse));
      component.loading = true;
      fixture.detectChanges();

      const loadingState = fixture.nativeElement.querySelector('.loading-state');
      expect(loadingState).toBeTruthy();
    });

    it('should hide loading state after data is loaded', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });
  });
});
