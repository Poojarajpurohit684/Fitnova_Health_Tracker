import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalsComponent } from './goals.component';
import { ApiService } from '../../core/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { UserContextService } from '../../core/services/user-context.service';
import { of, throwError } from 'rxjs';

describe('GoalsComponent', () => {
  let component: GoalsComponent;
  let fixture: ComponentFixture<GoalsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let userContextService: jasmine.SpyObj<UserContextService>;

  const mockGoals = [
    {
      id: '1',
      name: 'Build Muscle',
      description: 'Increase muscle mass by 5 lbs',
      icon: '💪',
      target: '5 lbs',
      current: '3.2 lbs',
      deadline: 'Mar 31, 2026',
      progress: 65,
      status: 'active' as const,
      milestones: [
        { id: '1', name: 'First 2 lbs', targetValue: 2, currentValue: 2, completed: true },
        { id: '2', name: 'Next 3 lbs', targetValue: 3, currentValue: 1.2, completed: false }
      ],
      badges: [
        { id: '1', name: 'First Step', icon: '🏅', unlockedAt: 'Jan 15, 2026' }
      ]
    },
    {
      id: '2',
      name: 'Lose Weight',
      description: 'Reduce body weight by 15 lbs',
      icon: '⚖️',
      target: '15 lbs',
      current: '6.3 lbs',
      deadline: 'Apr 30, 2026',
      progress: 42,
      status: 'active' as const,
      milestones: [],
      badges: []
    },
    {
      id: '3',
      name: 'Flexibility',
      description: 'Touch toes without bending knees',
      icon: '🧘',
      target: 'Achieved',
      current: 'Achieved',
      deadline: 'Feb 28, 2026',
      progress: 100,
      status: 'completed' as const,
      milestones: [],
      badges: [
        { id: '2', name: 'Flexibility Master', icon: '🎯', unlockedAt: 'Feb 28, 2026' }
      ]
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['show', 'error', 'success']);
    const userContextServiceSpy = jasmine.createSpyObj('UserContextService', [], {
      userId$: of('user123')
    });

    await TestBed.configureTestingModule({
      imports: [GoalsComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: UserContextService, useValue: userContextServiceSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    userContextService = TestBed.inject(UserContextService) as jasmine.SpyObj<UserContextService>;

    fixture = TestBed.createComponent(GoalsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load goals on init', () => {
      apiService.get.and.returnValue(of({ goals: mockGoals }));
      component.ngOnInit();
      expect(apiService.get).toHaveBeenCalledWith('/goals');
      expect(component.goals.length).toBe(3);
    });

    it('should handle empty goals response', () => {
      apiService.get.and.returnValue(of({ goals: [] }));
      component.ngOnInit();
      expect(component.goals.length).toBe(0);
      expect(component.filteredGoals.length).toBe(0);
    });

    it('should handle API error gracefully', () => {
      apiService.get.and.returnValue(throwError(() => new Error('API Error')));
      component.ngOnInit();
      expect(modalService.error).toHaveBeenCalledWith('Failed to load goals');
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(() => {
      component.goals = mockGoals;
      component.updateStats();
    });

    it('should calculate total goals correctly', () => {
      expect(component.totalGoals).toBe(3);
    });

    it('should calculate active goals correctly', () => {
      expect(component.activeGoals).toBe(2);
    });

    it('should calculate completed goals correctly', () => {
      expect(component.completedGoals).toBe(1);
    });

    it('should calculate average progress correctly', () => {
      const expectedAverage = Math.round((65 + 42 + 100) / 3);
      expect(component.averageProgress).toBe(expectedAverage);
    });

    it('should handle empty goals array', () => {
      component.goals = [];
      component.updateStats();
      expect(component.totalGoals).toBe(0);
      expect(component.averageProgress).toBe(0);
    });
  });

  describe('Goal Filtering', () => {
    beforeEach(() => {
      component.goals = mockGoals;
    });

    it('should filter active goals', () => {
      component.filterGoals('active');
      expect(component.filteredGoals.length).toBe(2);
      expect(component.filteredGoals.every(g => g.status === 'active')).toBe(true);
    });

    it('should filter completed goals', () => {
      component.filterGoals('completed');
      expect(component.filteredGoals.length).toBe(1);
      expect(component.filteredGoals[0].status).toBe('completed');
    });

    it('should filter archived goals', () => {
      component.filterGoals('archived');
      expect(component.filteredGoals.length).toBe(0);
    });

    it('should show all goals when filter is "all"', () => {
      component.filterGoals('all');
      expect(component.filteredGoals.length).toBe(3);
    });

    it('should update current filter', () => {
      component.filterGoals('active');
      expect(component.currentFilter).toBe('active');
    });
  });

  describe('Goal Detail View', () => {
    it('should open goal detail view', () => {
      const goal = mockGoals[0];
      component.viewGoalDetail(goal);
      expect(component.showDetailView).toBe(true);
      expect(component.selectedGoal).toBe(goal);
    });

    it('should close goal detail view', () => {
      component.showDetailView = true;
      component.selectedGoal = mockGoals[0];
      component.closeDetailView();
      expect(component.showDetailView).toBe(false);
      expect(component.selectedGoal).toBeNull();
    });
  });

  describe('Goal Actions', () => {
    beforeEach(() => {
      component.goals = mockGoals;
      component.updateStats();
    });

    it('should toggle create form', () => {
      expect(component.showCreateForm).toBe(false);
      component.toggleCreateForm();
      expect(component.showCreateForm).toBe(true);
      component.toggleCreateForm();
      expect(component.showCreateForm).toBe(false);
    });

    it('should edit goal', () => {
      const goal = mockGoals[0];
      component.editGoal(goal);
      expect(modalService.show).toHaveBeenCalled();
    });

    it('should complete goal', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const goal = mockGoals[0];
      const initialStatus = goal.status;
      component.completeGoal(goal);
      expect(goal.status).toBe('completed');
      expect(goal.progress).toBe(100);
      expect(modalService.success).toHaveBeenCalled();
    });

    it('should not complete goal if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const goal = mockGoals[0];
      const initialStatus = goal.status;
      component.completeGoal(goal);
      expect(goal.status).toBe(initialStatus);
    });

    it('should archive goal', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const goal = mockGoals[0];
      component.archiveGoal(goal);
      expect(goal.status).toBe('archived');
      expect(modalService.success).toHaveBeenCalled();
    });

    it('should not archive goal if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const goal = mockGoals[0];
      const initialStatus = goal.status;
      component.archiveGoal(goal);
      expect(goal.status).toBe(initialStatus);
    });
  });

  describe('Progress Calculations', () => {
    it('should get progress percentage capped at 100', () => {
      const goal = { ...mockGoals[0], progress: 150 };
      expect(component.getProgressPercentage(goal)).toBe(100);
    });

    it('should get progress percentage for normal values', () => {
      const goal = mockGoals[0];
      expect(component.getProgressPercentage(goal)).toBe(65);
    });

    it('should return correct color for high progress', () => {
      const goal = { ...mockGoals[0], progress: 80 };
      expect(component.getProgressColor(goal.progress)).toBe('#10B981');
    });

    it('should return correct color for medium-high progress', () => {
      const goal = { ...mockGoals[0], progress: 60 };
      expect(component.getProgressColor(goal.progress)).toBe('#3B82F6');
    });

    it('should return correct color for medium progress', () => {
      const goal = { ...mockGoals[0], progress: 30 };
      expect(component.getProgressColor(goal.progress)).toBe('#F59E0B');
    });

    it('should return correct color for low progress', () => {
      const goal = { ...mockGoals[0], progress: 10 };
      expect(component.getProgressColor(goal.progress)).toBe('#EF4444');
    });
  });

  describe('Responsive Behavior', () => {
    it('should render goal cards in grid layout', () => {
      component.goals = mockGoals;
      component.filteredGoals = mockGoals;
      fixture.detectChanges();
      const goalCards = fixture.nativeElement.querySelectorAll('.goal-card');
      expect(goalCards.length).toBe(3);
    });

    it('should display empty state when no goals', () => {
      component.goals = [];
      component.filteredGoals = [];
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should display loading state when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      const loadingState = fixture.nativeElement.querySelector('.loading-state');
      expect(loadingState).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have aria labels on buttons', () => {
      fixture.detectChanges();
      const createBtn = fixture.nativeElement.querySelector('.btn-primary');
      expect(createBtn.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria labels on filter buttons', () => {
      fixture.detectChanges();
      const filterBtns = fixture.nativeElement.querySelectorAll('.filter-btn');
      filterBtns.forEach((btn: HTMLElement) => {
        expect(btn.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
