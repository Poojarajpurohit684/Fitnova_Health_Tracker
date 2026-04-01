import { TestBed } from '@angular/core/testing';
import { GoalService, Goal } from './goal.service';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';

describe('GoalService', () => {
  let service: GoalService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        GoalService,
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    });

    service = TestBed.inject(GoalService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createGoal', () => {
    it('should call api.post with correct endpoint', () => {
      const goal: Goal = {
        goalType: 'weight_loss',
        targetValue: 15,
        currentValue: 0,
        unit: 'lbs',
        targetDate: new Date('2026-03-31'),
        startDate: new Date(),
        status: 'active',
        description: 'Lose 15 lbs',
      };

      apiService.post.and.returnValue(of({ data: goal }));

      service.createGoal(goal).subscribe();

      expect(apiService.post).toHaveBeenCalledWith('/goals', goal);
    });
  });

  describe('getGoals', () => {
    it('should call api.get with correct endpoint', () => {
      apiService.get.and.returnValue(of({ data: [] }));

      service.getGoals().subscribe();

      expect(apiService.get).toHaveBeenCalledWith('/goals', { limit: 10, offset: 0 });
    });

    it('should include status filter when provided', () => {
      apiService.get.and.returnValue(of({ data: [] }));

      service.getGoals('active').subscribe();

      expect(apiService.get).toHaveBeenCalledWith('/goals', { limit: 10, offset: 0, status: 'active' });
    });
  });

  describe('calculateProgress', () => {
    it('should return 100 for completed goals', () => {
      const goal: Goal = {
        goalType: 'weight_loss',
        targetValue: 15,
        currentValue: 15,
        unit: 'lbs',
        targetDate: new Date(),
        startDate: new Date(),
        status: 'completed',
      };

      const progress = service.calculateProgress(goal);

      expect(progress).toBe(100);
    });

    it('should calculate progress percentage correctly', () => {
      const goal: Goal = {
        goalType: 'weight_loss',
        targetValue: 100,
        currentValue: 50,
        unit: 'lbs',
        targetDate: new Date(),
        startDate: new Date(),
        status: 'active',
      };

      const progress = service.calculateProgress(goal);

      expect(progress).toBe(50);
    });

    it('should cap progress at 99 for active goals', () => {
      const goal: Goal = {
        goalType: 'weight_loss',
        targetValue: 100,
        currentValue: 100,
        unit: 'lbs',
        targetDate: new Date(),
        startDate: new Date(),
        status: 'active',
      };

      const progress = service.calculateProgress(goal);

      expect(progress).toBe(99);
    });
  });

  describe('getGoalIcon', () => {
    it('should return correct icon for weight_loss', () => {
      expect(service.getGoalIcon('weight_loss')).toBe('⚖️');
    });

    it('should return correct icon for muscle_gain', () => {
      expect(service.getGoalIcon('muscle_gain')).toBe('💪');
    });

    it('should return correct icon for endurance', () => {
      expect(service.getGoalIcon('endurance')).toBe('🏃');
    });

    it('should return default icon for unknown type', () => {
      expect(service.getGoalIcon('unknown')).toBe('🎯');
    });
  });

  describe('getDaysRemaining', () => {
    it('should calculate days remaining correctly', () => {
      const today = new Date();
      const futureDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

      const daysRemaining = service.getDaysRemaining(futureDate);

      expect(daysRemaining).toBe(10);
    });

    it('should return negative for past dates', () => {
      const today = new Date();
      const pastDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

      const daysRemaining = service.getDaysRemaining(pastDate);

      expect(daysRemaining).toBeLessThan(0);
    });
  });
});
