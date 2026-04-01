import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalFormComponent } from './goal-form.component';
import { GoalService, Goal } from '../../services/goal.service';
import { of } from 'rxjs';

describe('GoalFormComponent', () => {
  let component: GoalFormComponent;
  let fixture: ComponentFixture<GoalFormComponent>;
  let goalService: jasmine.SpyObj<GoalService>;

  beforeEach(async () => {
    const goalServiceSpy = jasmine.createSpyObj('GoalService', ['createGoal']);

    await TestBed.configureTestingModule({
      imports: [GoalFormComponent],
      providers: [{ provide: GoalService, useValue: goalServiceSpy }],
    }).compileComponents();

    goalService = TestBed.inject(GoalService) as jasmine.SpyObj<GoalService>;
    fixture = TestBed.createComponent(GoalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with default values', () => {
      expect(component.goalForm).toBeDefined();
      expect(component.goalForm.get('goalType')?.value).toBe('weight_loss');
      expect(component.goalForm.get('unit')?.value).toBe('lbs');
      expect(component.goalForm.get('currentValue')?.value).toBe(0);
    });

    it('should populate form with editing goal data', () => {
      const editingGoal: Goal = {
        _id: '1',
        goalType: 'muscle_gain',
        targetValue: 5,
        currentValue: 2,
        unit: 'kg',
        targetDate: new Date('2026-03-31'),
        startDate: new Date(),
        status: 'active',
        description: 'Build muscle',
      };

      component.editingGoal = editingGoal;
      component.ngOnInit();

      expect(component.goalForm.get('goalType')?.value).toBe('muscle_gain');
      expect(component.goalForm.get('description')?.value).toBe('Build muscle');
      expect(component.goalForm.get('targetValue')?.value).toBe(5);
      expect(component.goalForm.get('currentValue')?.value).toBe(2);
      expect(component.goalForm.get('unit')?.value).toBe('kg');
    });
  });

  describe('form validation', () => {
    it('should be invalid when required fields are empty', () => {
      component.goalForm.patchValue({
        description: '',
        targetValue: 0,
      });

      expect(component.goalForm.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', () => {
      component.goalForm.patchValue({
        goalType: 'weight_loss',
        description: 'Lose weight',
        targetValue: 15,
        unit: 'lbs',
        currentValue: 0,
        targetDate: new Date().toISOString().split('T')[0],
      });

      expect(component.goalForm.valid).toBe(true);
    });

    it('should validate description minimum length', () => {
      const descriptionControl = component.goalForm.get('description');

      descriptionControl?.setValue('ab');
      expect(descriptionControl?.hasError('minlength')).toBe(true);

      descriptionControl?.setValue('abc');
      expect(descriptionControl?.hasError('minlength')).toBe(false);
    });

    it('should validate targetValue minimum', () => {
      const targetValueControl = component.goalForm.get('targetValue');

      targetValueControl?.setValue(0);
      expect(targetValueControl?.hasError('min')).toBe(true);

      targetValueControl?.setValue(0.1);
      expect(targetValueControl?.hasError('min')).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should emit submitted event with goal data', () => {
      spyOn(component.submitted, 'emit');

      component.goalForm.patchValue({
        goalType: 'weight_loss',
        description: 'Lose 15 lbs',
        targetValue: 15,
        unit: 'lbs',
        currentValue: 0,
        targetDate: '2026-03-31',
      });

      component.onSubmit();

      expect(component.submitted.emit).toHaveBeenCalled();
      const emittedGoal = (component.submitted.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedGoal.goalType).toBe('weight_loss');
      expect(emittedGoal.description).toBe('Lose 15 lbs');
      expect(emittedGoal.status).toBe('active');
    });

    it('should not emit when form is invalid', () => {
      spyOn(component.submitted, 'emit');

      component.goalForm.patchValue({
        description: '',
      });

      component.onSubmit();

      expect(component.submitted.emit).not.toHaveBeenCalled();
    });

    it('should set isSubmitting flag', () => {
      component.goalForm.patchValue({
        goalType: 'weight_loss',
        description: 'Lose 15 lbs',
        targetValue: 15,
        unit: 'lbs',
        currentValue: 0,
        targetDate: '2026-03-31',
      });

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('should emit cancelled event', () => {
      spyOn(component.cancelled, 'emit');

      component.onCancel();

      expect(component.cancelled.emit).toHaveBeenCalled();
    });
  });
});
