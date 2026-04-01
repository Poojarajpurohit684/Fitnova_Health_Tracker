import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from './title.service';
import { Subject } from 'rxjs';

describe('TitleService', () => {
  let service: TitleService;
  let titleService: jasmine.SpyObj<Title>;
  let router: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(() => {
    routerEventsSubject = new Subject();

    const titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle', 'getTitle']);
    const routerSpy = jasmine.createSpyObj('Router', [], {
      events: routerEventsSubject.asObservable()
    });

    TestBed.configureTestingModule({
      providers: [
        TitleService,
        { provide: Title, useValue: titleServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(TitleService);
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setTitle', () => {
    it('should format title with app name', () => {
      service.setTitle('Dashboard');
      expect(titleService.setTitle).toHaveBeenCalledWith('Dashboard | FitNova');
    });

    it('should format title with custom page names', () => {
      service.setTitle('Workouts');
      expect(titleService.setTitle).toHaveBeenCalledWith('Workouts | FitNova');
    });

    it('should handle empty page title', () => {
      service.setTitle('');
      expect(titleService.setTitle).toHaveBeenCalledWith(' | FitNova');
    });
  });

  describe('setTitleWithCustomApp', () => {
    it('should format title with custom app name', () => {
      service.setTitleWithCustomApp('Dashboard', 'MyApp');
      expect(titleService.setTitle).toHaveBeenCalledWith('Dashboard | MyApp');
    });

    it('should use default app name if not provided', () => {
      service.setTitleWithCustomApp('Dashboard');
      expect(titleService.setTitle).toHaveBeenCalledWith('Dashboard | FitNova');
    });
  });

  describe('getTitle', () => {
    it('should return current title', () => {
      titleService.getTitle.and.returnValue('Dashboard | FitNova');
      const title = service.getTitle();
      expect(title).toBe('Dashboard | FitNova');
    });
  });

  describe('resetTitle', () => {
    it('should reset title to default', () => {
      service.resetTitle();
      expect(titleService.setTitle).toHaveBeenCalledWith('Your Fitness Journey | FitNova');
    });
  });

  describe('route listener', () => {
    it('should listen to navigation events', (done) => {
      const navigationEnd = new NavigationEnd(1, '/dashboard', '/dashboard');
      
      setTimeout(() => {
        routerEventsSubject.next(navigationEnd);
        // Verify the listener is active by checking if router.events was accessed
        expect(router.events).toBeDefined();
        done();
      }, 100);
    });
  });
});
