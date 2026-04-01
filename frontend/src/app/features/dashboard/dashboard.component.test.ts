import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent, MetricCardComponent } from './dashboard.component';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';
import { UserContextService } from '../../core/services/user-context.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockStateService: jasmine.SpyObj<StateService>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockUserContextService: jasmine.SpyObj<UserContextService>;

  beforeEach(async () => {
    mockStateService = jasmine.createSpyObj('StateService', ['setUser']);
    mockApiService = jasmine.createSpyObj('ApiService', ['get']);
    mockUserContextService = jasmine.createSpyObj('UserContextService', [], {
      user$: of({ name: 'John Doe', profile: { activityLevel: 'moderate' } }),
      userId$: of('user123')
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: StateService, useValue: mockStateService },
        { provide: ApiService, useValue: mockApiService },
        { provide: UserContextService, useValue: mockUserContextService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('Personalized Greeting', () => {
    it('should display personalized greeting with user name', () => {
      component.userName = 'John Doe';
      fixture.detectChanges();
      const greeting = fixture.nativeElement.querySelector('.greeting');
      expect(greeting.textContent).toContain('Welcome back, John Doe');
    });

    it('should generate appropriate greeting based on time of day', () => {
      const user = { profile: { activityLevel: 'moderate' } };
      const greeting = component.getPersonalizedGreeting(user);
      expect(greeting).toBeTruthy();
      expect(greeting).toContain('Ready for a solid workout session');
    });
  });

  describe('Metric Cards', () => {
    it('should display metric cards with correct values', () => {
      component.weeklyWorkouts = 5;
      component.totalCalories = 2500;
      component.totalMinutes = 180;
      component.activeGoals = 3;
      fixture.detectChanges();

      const metricCards = fixture.nativeElement.querySelectorAll('app-metric-card');
      expect(metricCards.length).toBe(4);
    });

    it('should display trend indicators when available', () => {
      component.workoutTrend = 15;
      component.caloriesTrend = -5;
      component.minutesTrend = 10;
      fixture.detectChanges();

      expect(component.workoutTrend).toBe(15);
      expect(component.caloriesTrend).toBe(-5);
      expect(component.minutesTrend).toBe(10);
    });
  });

  describe('Recent Activity Section', () => {
    it('should display recent activity list', () => {
      const mockWorkouts = [
        { type: 'Running', duration: 30, caloriesBurned: 300, createdAt: new Date() },
        { type: 'Weight Training', duration: 45, caloriesBurned: 250, createdAt: new Date() }
      ];
      mockApiService.get.and.returnValue(of(mockWorkouts));
      component.recentWorkouts$ = of(mockWorkouts);
      fixture.detectChanges();

      const activityItems = fixture.nativeElement.querySelectorAll('.activity-item');
      expect(activityItems.length).toBeGreaterThan(0);
    });

    it('should display empty state when no recent workouts', () => {
      component.recentWorkouts$ = of([]);
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });
  });

  describe('Goals Progress Section', () => {
    it('should display goals with progress bars', () => {
      const mockGoals = [
        { name: 'Run 50km', target: '50km', progress: 60, deadline: new Date() },
        { name: 'Lose 10lbs', target: '10lbs', progress: 40, deadline: new Date() }
      ];
      component.goals$ = of(mockGoals);
      fixture.detectChanges();

      const goalItems = fixture.nativeElement.querySelectorAll('.goal-item');
      expect(goalItems.length).toBeGreaterThan(0);
    });

    it('should display empty state when no active goals', () => {
      component.goals$ = of([]);
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });
  });

  describe('Quick Action Buttons', () => {
    it('should display three quick action buttons', () => {
      fixture.detectChanges();
      const actionButtons = fixture.nativeElement.querySelectorAll('.action-btn');
      expect(actionButtons.length).toBe(3);
    });

    it('should have correct button labels', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('.action-btn');
      const labels = Array.from(buttons).map((btn: any) => btn.textContent.trim());
      expect(labels).toContain('Start Workout');
      expect(labels).toContain('Log Nutrition');
      expect(labels).toContain('View Analytics');
    });
  });

  describe('Responsive Layout', () => {
    it('should render metrics grid', () => {
      fixture.detectChanges();
      const metricsGrid = fixture.nativeElement.querySelector('.metrics-grid');
      expect(metricsGrid).toBeTruthy();
    });

    it('should render activity list', () => {
      fixture.detectChanges();
      const activityList = fixture.nativeElement.querySelector('.activity-list');
      expect(activityList).toBeTruthy();
    });

    it('should render goals list', () => {
      fixture.detectChanges();
      const goalsList = fixture.nativeElement.querySelector('.goals-list');
      expect(goalsList).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner when not loading', () => {
      component.loading = false;
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error occurs', () => {
      component.error = 'Failed to load dashboard';
      fixture.detectChanges();
      const alert = fixture.nativeElement.querySelector('.alert-error');
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain('Failed to load dashboard');
    });
  });

  describe('Streak Calculation', () => {
    it('should calculate streak correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const workouts = [
        { createdAt: today.toISOString(), type: 'Running', duration: 30, caloriesBurned: 300 },
        { createdAt: yesterday.toISOString(), type: 'Running', duration: 30, caloriesBurned: 300 },
        { createdAt: twoDaysAgo.toISOString(), type: 'Running', duration: 30, caloriesBurned: 300 }
      ];

      const streak = component['calculateStreak'](workouts);
      expect(streak).toBeGreaterThan(0);
    });
  });

  describe('Exercise Icon Mapping', () => {
    it('should return correct icon for exercise type', () => {
      expect(component.getExerciseIcon('Running')).toBe('🏃');
      expect(component.getExerciseIcon('Weight Training')).toBe('🏋️');
      expect(component.getExerciseIcon('Cycling')).toBe('🚴');
      expect(component.getExerciseIcon('Swimming')).toBe('🏊');
      expect(component.getExerciseIcon('HIIT')).toBe('⚡');
    });

    it('should return default icon for unknown exercise type', () => {
      expect(component.getExerciseIcon('Unknown')).toBe('💪');
    });
  });
});

describe('MetricCardComponent', () => {
  let component: MetricCardComponent;
  let fixture: ComponentFixture<MetricCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardComponent);
    component = fixture.componentInstance;
  });

  it('should display metric value', () => {
    component.value = 42;
    component.label = 'Test Metric';
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('.metric-value');
    expect(value.textContent).toContain('42');
  });

  it('should display metric label', () => {
    component.label = 'Workouts This Week';
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.metric-label');
    expect(label.textContent).toContain('Workouts This Week');
  });

  it('should display trend indicator when trend is provided', () => {
    component.trend = 15;
    fixture.detectChanges();

    const trend = fixture.nativeElement.querySelector('.metric-trend');
    expect(trend).toBeTruthy();
    expect(trend.textContent).toContain('15%');
  });

  it('should not display trend indicator when trend is null', () => {
    component.trend = null;
    fixture.detectChanges();

    const trend = fixture.nativeElement.querySelector('.metric-trend');
    expect(trend).toBeFalsy();
  });

  it('should apply correct variant class', () => {
    component.variant = 'secondary';
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.metric-card');
    expect(card.classList.contains('metric-secondary')).toBe(true);
  });

  it('should display up arrow for positive trend', () => {
    component.trend = 10;
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.trend-arrow');
    expect(arrow.textContent).toContain('↑');
  });

  it('should display down arrow for negative trend', () => {
    component.trend = -10;
    fixture.detectChanges();

    const arrow = fixture.nativeElement.querySelector('.trend-arrow');
    expect(arrow.textContent).toContain('↓');
  });
});
