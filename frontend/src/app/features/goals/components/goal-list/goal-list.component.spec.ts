import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalListComponent } from './goal-list.component';
import { GoalService, Goal } from '../../services/goal.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { of, throwError } from 'rxjs';

describe('GoalListComponent', () => {
  let component: GoalListComponent;
  let fixture: ComponentFixture<GoalListComponent>;
  let goalService: jasmine.SpyObj<GoalService>;
  let modalService: jasmine.SpyObj<ModalService>;

  const mockGoals: Goal[] = [
    {
      _id: '1',
      goalType: 'weight_loss',
      targetValue: 15,
      currentValue: 6.3,
      unit: 'lbs',
      targetDate: new Date('2026-04-30'),
      startDate: new Date(),
      status: 'active',
      description: 'Lose 15 lbs',
      progress: 42,
    },
    {
      _id: '2',
      goalType: 'muscle_gain',
      targetValue: 5,
      currentValue: 3.2,
      unit: 'lbs',
      targetDate: new Date('2026-03-31'),
      startDate: new Date(),
      status: 'active',
      description: 'Build muscle',
      progress: 65,
    },
    {
      _id: '3',
      goalType: 'flexibility',
      targetValue: 1,
      currentValue: 1,
      unit: 'achieved',
      targetDate: new Date('2026-02-28'),
      startDate: new Date(),
      status: 'completed',
      description: 'Touch toes',
      progress: 100,
    },
  ];

  beforeEach(async () => {
    const goalServiceSpy = jasmine.createSpyObj('GoalService', [
      'getGoals',
      'createGoal',
      'deleteGoal',
      'calculateProgress',
      'getGoalIcon',
      'getDaysRemaining',
    ]);

    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'success',
      'error',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [GoalListComponent],
      providers: [
        { provide: GoalService, useValue: goalServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
      ],
    }).compileComponents();

    goalService = TestBed.inject(GoalService) as jasmine.SpyObj<GoalService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

    goalService.calculateProgress.and.callFake((goal: Goal) => goal.progress || 0);
    goalService.getGoalIcon.and.returnValue('🎯');
    goalService.getDaysRemaining.and.returnValue(30);

    fixture = TestBed.createComponent(GoalListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load goals on init', () => {
      goalService.getGoals.and.returnValue(of({ data: mockGoals }));

      component.ngOnInit();

      expect(goalService.getGoals).toHaveBeenCalled();
      expect(component.goals.length).toBe(3);
    });

    it('should handle error when loading goals', () => {
      goalService.getGoals.and.returnValue(throwError(() => new Error('API error')));

      component.ngOnInit();

      expect(modalService.error).toHaveBeenCalledWith('Failed to load goals');
    });
  });

  describe('updateStats', () => {
    it('should calculate stats correctly', () => {
      component.goals = mockGoals;

      component.updateStats();

      expect(component.totalGoals).toBe(3);
      expect(component.activeGoals).toBe(2);
      expect(component.completedGoals).toBe(1);
      expect(component.averageProgress).toBe(69); // (42 + 65 + 100) / 3 = 69
    });

    it('should handle empty goals', () => {
      component.goals = [];

      component.updateStats();

      expect(component.totalGoals).toBe(0);
      expect(component.activeGoals).toBe(0);
      expect(component.completedGoals).toBe(0);
      expect(component.averageProgress).toBe(0);
    });
  });

  describe('filterGoals', () => {
    beforeEach(() => {
      component.goals = mockGoals;
    });

    it('should filter active goals', () => {
      component.filterGoals('active');

      expect(component.filteredGoals.length).toBe(2);
      expect(component.filteredGoals.every((g) => g.status === 'active')).toBe(true);
    });

    it('should filter completed goals', () => {
      component.filterGoals('completed');

      expect(component.filteredGoals.length).toBe(1);
      expect(component.filteredGoals[0].status).toBe('completed');
    });

    it('should show all goals when filter is all', () => {
      component.filterGoals('all');

      expect(component.filteredGoals.length).toBe(3);
    });
  });

  describe('toggleAddGoal', () => {
    it('should toggle showForm', () => {
      expect(component.showForm).toBe(false);

      component.toggleAddGoal();

      expect(component.showForm).toBe(true);

      component.toggleAddGoal();

      expect(component.showForm).toBe(false);
    });
  });

  describe('onGoalSubmitted', () => {
    it('should create goal and reload', () => {
      goalService.createGoal.and.returnValue(of({ data: mockGoals[0] }));
      goalService.getGoals.and.returnValue(of({ data: mockGoals }));

      const newGoal: Goal = {
        goalType: 'weight_loss',
        targetValue: 15,
        currentValue: 0,
        unit: 'lbs',
        targetDate: new Date(),
        startDate: new Date(),
        status: 'active',
        description: 'New goal',
      };

      component.onGoalSubmitted(newGoal);

      expect(goalService.createGoal).toHaveBeenCalledWith(newGoal);
      expect(modalService.success).toHaveBeenCalledWith('Goal created successfully');
      expect(component.showForm).toBe(false);
    });

    it('should handle error when creating goal', () => {
      goalService.createGoal.and.returnValue(throwError(() => new Error('API error')));

      const newGoal: Goal = {
        goalType: 'weight_loss',
        targetValue: 15,
        currentValue: 0,
        unit: 'lbs',
        targetDate: new Date(),
        startDate: new Date(),
        status: 'active',
        description: 'New goal',
      };

      component.onGoalSubmitted(newGoal);

      expect(modalService.error).toHaveBeenCalledWith('Failed to create goal');
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      goalService.deleteGoal.and.returnValue(of({}));
      goalService.getGoals.and.returnValue(of({ data: [] }));

      component.deleteGoal('1');

      expect(goalService.deleteGoal).toHaveBeenCalledWith('1');
      expect(modalService.success).toHaveBeenCalledWith('Goal deleted successfully');
    });

    it('should not delete goal when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteGoal('1');

      expect(goalService.deleteGoal).not.toHaveBeenCalled();
    });
  });

  describe('formatGoalType', () => {
    it('should format goal type correctly', () => {
      expect(component.formatGoalType('weight_loss')).toBe('Weight Loss');
      expect(component.formatGoalType('muscle_gain')).toBe('Muscle Gain');
      expect(component.formatGoalType('endurance')).toBe('Endurance');
    });
  });

  describe('getDaysRemaining', () => {
    it('should call goalService.getDaysRemaining', () => {
      const date = new Date();

      component.getDaysRemaining(date);

      expect(goalService.getDaysRemaining).toHaveBeenCalledWith(date);
    });
  });
});
