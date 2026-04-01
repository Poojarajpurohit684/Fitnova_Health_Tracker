import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { UserContextService } from '../../core/services/user-context.service';
import { WorkoutService } from './services/workout.service';
import { WorkoutsComponent } from './workouts.component';

describe('WorkoutsComponent', () => {
  let component: WorkoutsComponent;
  let fixture: ComponentFixture<WorkoutsComponent>;
  let workoutService: jasmine.SpyObj<WorkoutService>;
  let router: jasmine.SpyObj<Router>;

  const mockWorkouts = [
    { exerciseType: 'Running', duration: 30, caloriesBurned: 300, createdAt: new Date('2024-01-15T00:00:00Z') },
    { exerciseType: 'Cycling', duration: 60, caloriesBurned: 500, createdAt: new Date('2024-01-10T00:00:00Z') },
    { exerciseType: 'Weight Training', duration: 45, caloriesBurned: 250, createdAt: new Date('2024-01-05T00:00:00Z') },
  ];

  beforeEach(async () => {
    const workoutServiceSpy = jasmine.createSpyObj('WorkoutService', ['getWorkouts']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const userContextSpy = jasmine.createSpyObj('UserContextService', [], {
      userId$: new BehaviorSubject('user123'),
    });

    await TestBed.configureTestingModule({
      imports: [WorkoutsComponent],
      providers: [
        { provide: WorkoutService, useValue: workoutServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: UserContextService, useValue: userContextSpy },
      ],
    }).compileComponents();

    workoutService = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    workoutService.getWorkouts.and.returnValue(of(mockWorkouts as any));

    fixture = TestBed.createComponent(WorkoutsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workouts on init', () => {
    fixture.detectChanges();
    expect(workoutService.getWorkouts).toHaveBeenCalled();
    expect(component.workouts.length).toBe(3);
    expect(component.filteredWorkouts.length).toBe(3);
  });

  it('should filter workouts by type', () => {
    component.workouts = mockWorkouts as any;
    component.selectedType = 'Running';
    component.applyFilters();
    expect(component.filteredWorkouts.length).toBe(1);
    expect(component.filteredWorkouts[0].exerciseType).toBe('Running');
  });

  it('should filter workouts by search query', () => {
    component.workouts = mockWorkouts as any;
    component.searchQuery = 'cycl';
    component.applyFilters();
    expect(component.filteredWorkouts.length).toBe(1);
    expect(component.filteredWorkouts[0].exerciseType).toBe('Cycling');
  });

  it('should filter workouts by minimum duration', () => {
    component.workouts = mockWorkouts as any;
    component.durationMin = 45;
    component.applyFilters();
    expect(component.filteredWorkouts.length).toBe(2);
    expect(component.filteredWorkouts.every(w => w.duration >= 45)).toBe(true);
  });

  it('should navigate to workout logging', () => {
    router.navigate.and.returnValue(Promise.resolve(true));
    component.startWorkout();
    expect(router.navigate).toHaveBeenCalledWith(['/workouts/log']);
  });
});
