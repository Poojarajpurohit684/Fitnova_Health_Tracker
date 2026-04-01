import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { AnalyticsService } from './services/analytics.service';
import { ModalService } from '../../shared/services/modal.service';
import { UserContextService } from '../../core/services/user-context.service';
import { of, throwError } from 'rxjs';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let userContextService: jasmine.SpyObj<UserContextService>;

  const mockAnalyticsData: any = {
    totalWorkouts: 12,
    totalCalories: 5000,
    averageDuration: 45,
    weeklyTrends: [
      { date: '2024-01-01', workouts: 2, calories: 500 },
      { date: '2024-01-02', workouts: 1, calories: 300 },
      { date: '2024-01-03', workouts: 3, calories: 800 }
    ],
    macroBreakdown: {
      protein: 150,
      carbohydrates: 200,
      fats: 50
    },
    workoutTypes: [
      { type: 'Running', count: 5 },
      { type: 'Strength', count: 4 },
      { type: 'Yoga', count: 3 }
    ],
    goals: [
      { name: 'Weekly Workouts', progress: 10, target: 12 },
      { name: 'Calories Burned', progress: 4500, target: 5000 }
    ]
  };

  beforeEach(async () => {
    const analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', [
      'getDashboard',
      'exportPDF',
      'exportCSV'
    ]);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', [
      'success',
      'error'
    ]);
    const userContextServiceSpy = jasmine.createSpyObj('UserContextService', [], {
      userId$: of('test-user-id')
    });

    await TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
      providers: [
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: UserContextService, useValue: userContextServiceSpy }
      ]
    }).compileComponents();

    analyticsService = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    userContextService = TestBed.inject(UserContextService) as jasmine.SpyObj<UserContextService>;

    analyticsService.getDashboard.and.returnValue(of(mockAnalyticsData));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load analytics on init', () => {
      fixture.detectChanges();
      expect(analyticsService.getDashboard).toHaveBeenCalled();
    });

    it('should set initial time range to month', () => {
      expect(component.timeRange).toBe('month');
    });

    it('should initialize with loading state', () => {
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });
  });

  describe('Analytics Data Processing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should process key statistics correctly', (done) => {
      setTimeout(() => {
        expect(component.totalWorkouts).toBe(12);
        expect(component.totalCalories).toBe(5000);
        expect(component.totalDuration).toBe(45);
        done();
      }, 100);
    });

    it('should calculate average intensity', (done) => {
      setTimeout(() => {
        const expectedIntensity = Math.round((5000 / 12) / 100);
        expect(component.avgIntensity).toBe(expectedIntensity);
        done();
      }, 100);
    });

    it('should process workout frequency data', (done) => {
      setTimeout(() => {
        expect(component.workoutFrequencyData.labels.length).toBe(3);
        expect(component.workoutFrequencyData.values.length).toBe(3);
        done();
      }, 100);
    });

    it('should process calories burned data', (done) => {
      setTimeout(() => {
        expect(component.caloriesBurnedData.labels.length).toBe(3);
        expect(component.caloriesBurnedData.values).toEqual([500, 300, 800]);
        done();
      }, 100);
    });

    it('should process workout type breakdown', (done) => {
      setTimeout(() => {
        expect(component.workoutTypeData.length).toBe(3);
        expect(component.workoutTypeData[0].type).toBe('Running');
        expect(component.workoutTypeData[0].count).toBe(5);
        expect(component.workoutTypeData[0].percentage).toBe(42); // 5/12 * 100
        done();
      }, 100);
    });

    it('should process goal progress data', (done) => {
      setTimeout(() => {
        expect(component.goalProgressData.length).toBe(2);
        expect(component.goalProgressData[0].name).toBe('Weekly Workouts');
        expect(component.goalProgressData[0].percentage).toBe(83); // 10/12 * 100
        done();
      }, 100);
    });
  });

  describe('Insights Generation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should generate insights based on data', (done) => {
      setTimeout(() => {
        expect(component.insights.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should include consistency insight when workouts exist', (done) => {
      setTimeout(() => {
        const consistencyInsight = component.insights.find(i => i.title === 'Great consistency!');
        expect(consistencyInsight).toBeTruthy();
        done();
      }, 100);
    });

    it('should include high calorie burn insight', (done) => {
      setTimeout(() => {
        const calorieInsight = component.insights.find(i => i.title === 'High calorie burn');
        expect(calorieInsight).toBeTruthy();
        done();
      }, 100);
    });
  });

  describe('Time Range Filter', () => {
    it('should update time range to week', () => {
      component.setTimeRange('week');
      expect(component.timeRange).toBe('week');
      expect(analyticsService.getDashboard).toHaveBeenCalled();
    });

    it('should update time range to month', () => {
      component.setTimeRange('month');
      expect(component.timeRange).toBe('month');
      expect(analyticsService.getDashboard).toHaveBeenCalled();
    });

    it('should update time range to year', () => {
      component.setTimeRange('year');
      expect(component.timeRange).toBe('year');
      expect(analyticsService.getDashboard).toHaveBeenCalled();
    });

    it('should update start date when changing time range', () => {
      const beforeWeek = component.startDate;
      component.setTimeRange('week');
      expect(component.startDate.getTime()).toBeLessThan(beforeWeek.getTime());
    });

    it('should reload analytics when time range changes', () => {
      analyticsService.getDashboard.calls.reset();
      component.setTimeRange('week');
      expect(analyticsService.getDashboard).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should export PDF', () => {
      const mockBlob = new Blob(['pdf content']);
      analyticsService.exportPDF.and.returnValue(of(mockBlob));

      component.exportPDF();

      expect(analyticsService.exportPDF).toHaveBeenCalledWith(
        component.startDate,
        component.endDate
      );
    });

    it('should export CSV', () => {
      const mockBlob = new Blob(['csv content']);
      analyticsService.exportCSV.and.returnValue(of(mockBlob));

      component.exportCSV();

      expect(analyticsService.exportCSV).toHaveBeenCalledWith(
        component.startDate,
        component.endDate
      );
    });

    it('should show success message on PDF export', (done) => {
      const mockBlob = new Blob(['pdf content']);
      analyticsService.exportPDF.and.returnValue(of(mockBlob));

      component.exportPDF();

      setTimeout(() => {
        expect(modalService.success).toHaveBeenCalledWith('PDF exported successfully');
        done();
      }, 100);
    });

    it('should show success message on CSV export', (done) => {
      const mockBlob = new Blob(['csv content']);
      analyticsService.exportCSV.and.returnValue(of(mockBlob));

      component.exportCSV();

      setTimeout(() => {
        expect(modalService.success).toHaveBeenCalledWith('CSV exported successfully');
        done();
      }, 100);
    });

    it('should handle PDF export error', (done) => {
      analyticsService.exportPDF.and.returnValue(throwError(() => new Error('Export failed')));

      component.exportPDF();

      setTimeout(() => {
        expect(modalService.error).toHaveBeenCalledWith('Failed to export PDF');
        done();
      }, 100);
    });

    it('should handle CSV export error', (done) => {
      analyticsService.exportCSV.and.returnValue(throwError(() => new Error('Export failed')));

      component.exportCSV();

      setTimeout(() => {
        expect(modalService.error).toHaveBeenCalledWith('Failed to export CSV');
        done();
      }, 100);
    });
  });

  describe('Error Handling', () => {
    it('should handle analytics load error', (done) => {
      analyticsService.getDashboard.and.returnValue(
        throwError(() => new Error('API error'))
      );

      fixture.detectChanges();

      setTimeout(() => {
        expect(component.error).toBe('Failed to load analytics data');
        expect(component.loading).toBe(false);
        done();
      }, 100);
    });

    it('should display error message when loading fails', (done) => {
      analyticsService.getDashboard.and.returnValue(
        throwError(() => new Error('API error'))
      );

      fixture.detectChanges();

      setTimeout(() => {
        const compiled = fixture.nativeElement;
        fixture.detectChanges();
        expect(compiled.querySelector('.error-alert')).toBeTruthy();
        done();
      }, 100);
    });
  });

  describe('Chart Helpers', () => {
    it('should calculate chart bar height correctly', () => {
      const height = component.getChartBarHeight(50, 100);
      expect(height).toBe(50);
    });

    it('should handle zero max value in chart bar height', () => {
      const height = component.getChartBarHeight(50, 0);
      expect(height).toBe(0);
    });

    it('should get max chart value', () => {
      const max = component.getMaxChartValue([10, 20, 30, 5]);
      expect(max).toBe(30);
    });

    it('should return 1 as minimum max chart value', () => {
      const max = component.getMaxChartValue([]);
      expect(max).toBe(1);
    });

    it('should get type color by index', () => {
      const color1 = component.getTypeColor(0);
      const color2 = component.getTypeColor(1);
      expect(color1).toBe('#3b82f6');
      expect(color2).toBe('#10b981');
    });

    it('should cycle through colors for type index', () => {
      const color6 = component.getTypeColor(6);
      const color0 = component.getTypeColor(0);
      expect(color6).toBe(color0);
    });

    it('should generate line points for chart', () => {
      const points = component.generateLinePoints([100, 50, 75]);
      expect(points).toBeTruthy();
      expect(points.split(' ').length).toBe(3);
    });

    it('should handle empty values in line points', () => {
      const points = component.generateLinePoints([]);
      expect(points).toBe('');
    });
  });

  describe('Responsive Layout', () => {
    it('should render statistics grid', () => {
      fixture.detectChanges();
      const grid = fixture.nativeElement.querySelector('.statistics-grid');
      expect(grid).toBeTruthy();
    });

    it('should render charts grid', () => {
      fixture.detectChanges();
      const grid = fixture.nativeElement.querySelector('.charts-grid');
      expect(grid).toBeTruthy();
    });

    it('should render insights grid', () => {
      fixture.detectChanges();
      const grid = fixture.nativeElement.querySelector('.insights-grid');
      expect(grid).toBeTruthy();
    });

    it('should render filter buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('.filter-btn');
      expect(buttons.length).toBe(3);
    });

    it('should render export buttons', () => {
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('.export-btn');
      expect(buttons.length).toBe(2);
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while loading', () => {
      component.loading = true;
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide loading spinner when done', () => {
      component.loading = false;
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner).toBeFalsy();
    });

    it('should disable export buttons while exporting', () => {
      component.exporting = true;
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('.export-btn');
      buttons.forEach((btn: HTMLButtonElement) => {
        expect(btn.disabled).toBe(true);
      });
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
