import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutritionLogComponent } from './nutrition-log.component';
import { NutritionService, NutritionEntry, DailyTotals, DailyGoals } from '../../services/nutrition.service';
import { of, throwError } from 'rxjs';

describe('NutritionLogComponent', () => {
  let component: NutritionLogComponent;
  let fixture: ComponentFixture<NutritionLogComponent>;
  let nutritionService: jasmine.SpyObj<NutritionService>;

  const mockEntries: NutritionEntry[] = [
    {
      _id: '1',
      foodName: 'Chicken Breast',
      quantity: 150,
      unit: 'g',
      calories: 250,
      protein: 35,
      carbohydrates: 0,
      fats: 5,
      mealType: 'lunch',
      loggedAt: new Date('2024-01-15T12:00:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '2',
      foodName: 'Brown Rice',
      quantity: 150,
      unit: 'g',
      calories: 195,
      protein: 4,
      carbohydrates: 43,
      fats: 2,
      mealType: 'lunch',
      loggedAt: new Date('2024-01-15T12:15:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: '3',
      foodName: 'Banana',
      quantity: 1,
      unit: 'medium',
      calories: 105,
      protein: 1,
      carbohydrates: 27,
      fats: 0,
      mealType: 'snack',
      loggedAt: new Date('2024-01-15T15:00:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockDailyTotals: DailyTotals = {
    calories: 550,
    protein: 40,
    carbohydrates: 70,
    fats: 7,
  };

  const mockDailyGoals: DailyGoals = {
    calories: 2000,
    protein: 150,
    carbohydrates: 250,
    fats: 80,
  };

  beforeEach(async () => {
    const nutritionServiceSpy = jasmine.createSpyObj('NutritionService', [
      'getNutritionEntries',
      'deleteNutritionEntry',
    ]);

    await TestBed.configureTestingModule({
      imports: [NutritionLogComponent],
      providers: [{ provide: NutritionService, useValue: nutritionServiceSpy }],
    }).compileComponents();

    nutritionService = TestBed.inject(NutritionService) as jasmine.SpyObj<NutritionService>;

    fixture = TestBed.createComponent(NutritionLogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load nutrition data on init', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );

      component.ngOnInit();

      expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
      expect(component.entries.length).toBe(3);
      expect(component.dailyTotals).toEqual(mockDailyTotals);
      expect(component.dailyGoals).toEqual(mockDailyGoals);
    });

    it('should initialize with default daily goals', () => {
      expect(component.dailyGoals.calories).toBe(2000);
      expect(component.dailyGoals.protein).toBe(150);
      expect(component.dailyGoals.carbohydrates).toBe(250);
      expect(component.dailyGoals.fats).toBe(80);
    });

    it('should initialize with empty entries', () => {
      expect(component.entries).toEqual([]);
    });

    it('should initialize with showForm false', () => {
      expect(component.showForm).toBe(false);
    });
  });

  describe('loadNutritionData', () => {
    it('should fetch nutrition entries from service', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );

      component.loadNutritionData();

      expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
      expect(component.entries).toEqual(mockEntries);
    });

    it('should update daily totals', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );

      component.loadNutritionData();

      expect(component.dailyTotals.calories).toBe(550);
      expect(component.dailyTotals.protein).toBe(40);
      expect(component.dailyTotals.carbohydrates).toBe(70);
      expect(component.dailyTotals.fats).toBe(7);
    });

    it('should update daily goals', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );

      component.loadNutritionData();

      expect(component.dailyGoals).toEqual(mockDailyGoals);
    });

    it('should handle error when loading nutrition data', () => {
      spyOn(console, 'error');
      nutritionService.getNutritionEntries.and.returnValue(
        throwError(() => new Error('API error'))
      );

      component.loadNutritionData();

      expect(console.error).toHaveBeenCalledWith('Error loading nutrition data:', jasmine.any(Error));
    });

    it('should handle empty entries response', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: [],
          dailyTotals: { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
          dailyGoals: mockDailyGoals,
        })
      );

      component.loadNutritionData();

      expect(component.entries).toEqual([]);
    });
  });

  describe('toggleAddMeal', () => {
    it('should toggle showForm', () => {
      expect(component.showForm).toBe(false);

      component.toggleAddMeal();

      expect(component.showForm).toBe(true);

      component.toggleAddMeal();

      expect(component.showForm).toBe(false);
    });
  });

  describe('onEntrySubmitted', () => {
    it('should close form and reload data on entry submitted', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );

      component.showForm = true;
      const newEntry = mockEntries[0];

      component.onEntrySubmitted(newEntry);

      expect(component.showForm).toBe(false);
      expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      nutritionService.deleteNutritionEntry.and.returnValue(of({}));
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: [],
          dailyTotals: { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
          dailyGoals: mockDailyGoals,
        })
      );

      component.deleteEntry('1');

      expect(nutritionService.deleteNutritionEntry).toHaveBeenCalledWith('1');
      expect(nutritionService.getNutritionEntries).toHaveBeenCalled();
    });

    it('should not delete entry when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteEntry('1');

      expect(nutritionService.deleteNutritionEntry).not.toHaveBeenCalled();
    });

    it('should handle error when deleting entry', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(console, 'error');
      nutritionService.deleteNutritionEntry.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      component.deleteEntry('1');

      expect(console.error).toHaveBeenCalledWith('Error deleting entry:', jasmine.any(Error));
    });
  });

  describe('getMealIcon', () => {
    it('should return correct icon for breakfast', () => {
      expect(component.getMealIcon('breakfast')).toBe('🌅');
    });

    it('should return correct icon for lunch', () => {
      expect(component.getMealIcon('lunch')).toBe('☀️');
    });

    it('should return correct icon for snack', () => {
      expect(component.getMealIcon('snack')).toBe('🍿');
    });

    it('should return correct icon for dinner', () => {
      expect(component.getMealIcon('dinner')).toBe('🌙');
    });

    it('should return default icon for unknown meal type', () => {
      expect(component.getMealIcon('unknown')).toBe('🍽️');
    });
  });

  describe('formatTime', () => {
    it('should format date to time string', () => {
      const date = new Date('2024-01-15T12:30:00');
      const formatted = component.formatTime(date);

      expect(formatted).toContain('12');
      expect(formatted).toContain('30');
    });

    it('should handle string date input', () => {
      const dateString = '2024-01-15T12:30:00';
      const formatted = component.formatTime(dateString);

      expect(formatted).toBeTruthy();
    });
  });

  describe('getProgressPercentage', () => {
    it('should calculate progress percentage correctly', () => {
      const percentage = component.getProgressPercentage(550, 2000);

      expect(percentage).toBeCloseTo(27.5, 1);
    });

    it('should cap percentage at 100', () => {
      const percentage = component.getProgressPercentage(2500, 2000);

      expect(percentage).toBe(100);
    });

    it('should return 0 when goal is 0', () => {
      const percentage = component.getProgressPercentage(100, 0);

      expect(percentage).toBe(0);
    });

    it('should return 0 when current is 0', () => {
      const percentage = component.getProgressPercentage(0, 2000);

      expect(percentage).toBe(0);
    });

    it('should handle full goal achievement', () => {
      const percentage = component.getProgressPercentage(2000, 2000);

      expect(percentage).toBe(100);
    });
  });

  describe('Daily Totals Display', () => {
    beforeEach(() => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );
      component.loadNutritionData();
    });

    it('should display correct daily totals', () => {
      expect(component.dailyTotals.calories).toBe(550);
      expect(component.dailyTotals.protein).toBe(40);
      expect(component.dailyTotals.carbohydrates).toBe(70);
      expect(component.dailyTotals.fats).toBe(7);
    });

    it('should display correct daily goals', () => {
      expect(component.dailyGoals.calories).toBe(2000);
      expect(component.dailyGoals.protein).toBe(150);
      expect(component.dailyGoals.carbohydrates).toBe(250);
      expect(component.dailyGoals.fats).toBe(80);
    });
  });

  describe('Entries Display', () => {
    beforeEach(() => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: mockEntries,
          dailyTotals: mockDailyTotals,
          dailyGoals: mockDailyGoals,
        })
      );
      component.loadNutritionData();
    });

    it('should display all nutrition entries', () => {
      expect(component.entries.length).toBe(3);
    });

    it('should display entry details correctly', () => {
      const firstEntry = component.entries[0];

      expect(firstEntry.foodName).toBe('Chicken Breast');
      expect(firstEntry.calories).toBe(250);
      expect(firstEntry.protein).toBe(35);
    });

    it('should display entries in correct order', () => {
      expect(component.entries[0].foodName).toBe('Chicken Breast');
      expect(component.entries[1].foodName).toBe('Brown Rice');
      expect(component.entries[2].foodName).toBe('Banana');
    });
  });

  describe('Empty State', () => {
    it('should handle empty entries list', () => {
      nutritionService.getNutritionEntries.and.returnValue(
        of({
          entries: [],
          dailyTotals: { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
          dailyGoals: mockDailyGoals,
        })
      );

      component.loadNutritionData();

      expect(component.entries.length).toBe(0);
    });
  });
});
