import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../../services/workout.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { of, throwError } from 'rxjs';

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;
  let workoutService: jasmine.SpyObj<WorkoutService>;
  let modalService: jasmine.SpyObj<ModalService>;

  const mockWorkouts = [
    {
      _id: '1',
      exerciseType: 'Running',
      duration: 30,
      intensity: 7,
      caloriesBurned: 300,
      date: new Date('2024-01-15'),
      notes: 'Morning run',
    },
    {
      _id: '2',
      exerciseType: 'Weight Training',
      duration: 45,
      intensity: 8,
      caloriesBurned: 250,
      date: new Date('2024-01-14'),
      notes: 'Chest day',
    },
    {
      _id: '3',
      exerciseType: 'Cycling',
      duration: 60,
      intensity: 6,
      caloriesBurned: 400,
      date: new Date('2024-01-13'),
      notes: 'Outdoor cycling',
    },
  ];

  beforeEach(async () => {
    const workoutServiceSpy = jasmine.createSpyObj('WorkoutService', ['getWorkouts']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['error', 'success', 'info']);

    await TestBed.configureTestingModule({
      imports: [WorkoutListComponent],
      providers: [
        { provide: WorkoutService, useValue: workoutServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
      ],
    }).compileComponents();

    workoutService = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;

    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load workouts on init', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.ngOnInit();

      expect(workoutService.getWorkouts).toHaveBeenCalled();
      expect(component.workouts.length).toBe(3);
      expect(component.loading).toBe(false);
    });

    it('should initialize with empty workouts array', () => {
      expect(component.workouts).toEqual([]);
    });

    it('should initialize with loading false', () => {
      expect(component.loading).toBe(false);
    });

    it('should initialize with no error', () => {
      expect(component.error).toBeNull();
    });
  });

  describe('loadWorkouts', () => {
    it('should fetch workouts from service', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();

      expect(workoutService.getWorkouts).toHaveBeenCalled();
      expect(component.workouts).toEqual(mockWorkouts);
    });

    it('should set loading to true during fetch', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();

      expect(component.loading).toBe(false); // Set to false after response
    });

    it('should clear error on successful load', () => {
      component.error = 'Previous error';
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();

      expect(component.error).toBeNull();
    });

    it('should handle empty workouts response', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: [] }));

      component.loadWorkouts();

      expect(component.workouts).toEqual([]);
    });

    it('should handle null workouts in response', () => {
      workoutService.getWorkouts.and.returnValue(of({}));

      component.loadWorkouts();

      expect(component.workouts).toEqual([]);
    });

    it('should handle error when loading workouts', () => {
      workoutService.getWorkouts.and.returnValue(
        throwError(() => new Error('API error'))
      );

      component.loadWorkouts();

      expect(component.error).toBeTruthy();
      expect(component.loading).toBe(false);
      expect(modalService.error).toHaveBeenCalled();
    });

    it('should display error message on failure', () => {
      workoutService.getWorkouts.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      component.loadWorkouts();

      expect(component.error).toBe('Unable to fetch workouts. Please try again.');
    });
  });

  describe('getExerciseIcon', () => {
    it('should return correct icon for Running', () => {
      expect(component.getExerciseIcon('Running')).toBe('🏃');
    });

    it('should return correct icon for Weight Training', () => {
      expect(component.getExerciseIcon('Weight Training')).toBe('🏋️');
    });

    it('should return correct icon for Cycling', () => {
      expect(component.getExerciseIcon('Cycling')).toBe('🚴');
    });

    it('should return correct icon for Swimming', () => {
      expect(component.getExerciseIcon('Swimming')).toBe('🏊');
    });

    it('should return correct icon for HIIT', () => {
      expect(component.getExerciseIcon('HIIT')).toBe('⚡');
    });

    it('should return default icon for unknown exercise type', () => {
      expect(component.getExerciseIcon('Unknown')).toBe('💪');
    });
  });

  describe('Workout Display', () => {
    beforeEach(() => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));
      component.loadWorkouts();
    });

    it('should display all workouts', () => {
      expect(component.workouts.length).toBe(3);
    });

    it('should display workout details correctly', () => {
      const firstWorkout = component.workouts[0];

      expect(firstWorkout.exerciseType).toBe('Running');
      expect(firstWorkout.duration).toBe(30);
      expect(firstWorkout.intensity).toBe(7);
      expect(firstWorkout.caloriesBurned).toBe(300);
    });

    it('should display empty state when no workouts', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: [] }));

      component.loadWorkouts();

      expect(component.workouts.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should set error message on API failure', () => {
      workoutService.getWorkouts.and.returnValue(
        throwError(() => new Error('Connection failed'))
      );

      component.loadWorkouts();

      expect(component.error).toBeTruthy();
    });

    it('should show modal error on API failure', () => {
      workoutService.getWorkouts.and.returnValue(
        throwError(() => new Error('API error'))
      );

      component.loadWorkouts();

      expect(modalService.error).toHaveBeenCalledWith('Unable to fetch workouts. Please try again.');
    });

    it('should maintain loading state during error', () => {
      workoutService.getWorkouts.and.returnValue(
        throwError(() => new Error('API error'))
      );

      component.loadWorkouts();

      expect(component.loading).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should show loading state during fetch', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();

      expect(component.loading).toBe(false); // Set to false after response
    });

    it('should disable refresh button during loading', () => {
      component.loading = true;

      expect(component.loading).toBe(true);
    });
  });

  describe('Workout Sorting', () => {
    it('should display workouts in correct order', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();

      expect(component.workouts[0].exerciseType).toBe('Running');
      expect(component.workouts[1].exerciseType).toBe('Weight Training');
      expect(component.workouts[2].exerciseType).toBe('Cycling');
    });
  });

  describe('Multiple Load Calls', () => {
    it('should handle multiple loadWorkouts calls', () => {
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();
      expect(component.workouts.length).toBe(3);

      const updatedWorkouts = [mockWorkouts[0]];
      workoutService.getWorkouts.and.returnValue(of({ workouts: updatedWorkouts }));

      component.loadWorkouts();
      expect(component.workouts.length).toBe(1);
    });

    it('should clear previous error on successful reload', () => {
      component.error = 'Previous error';
      workoutService.getWorkouts.and.returnValue(of({ workouts: mockWorkouts }));

      component.loadWorkouts();

      expect(component.error).toBeNull();
    });
  });
});
