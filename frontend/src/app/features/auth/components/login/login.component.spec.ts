import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthFeatureService } from '../../services/auth-feature.service';
import { StateService } from '../../../../core/services/state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthFeatureService>;
  let stateService: jasmine.SpyObj<StateService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthFeatureService', ['login']);
    const stateServiceSpy = jasmine.createSpyObj('StateService', ['setUser']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: {} },
    });
    routerSpy.routerState = { root: { component: null } } as any;
    routerSpy.config = [];
    routerSpy.errorHandler = () => {};
    routerSpy.malformedUriErrorHandler = () => {};
    routerSpy.navigated = true;
    routerSpy.urlHandlingStrategy = 'deferred' as any;
    routerSpy.routeReuseStrategy = {} as any;
    routerSpy.titleStrategy = {} as any;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthFeatureService, useValue: authServiceSpy },
        { provide: StateService, useValue: stateServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthFeatureService) as jasmine.SpyObj<AuthFeatureService>;
    stateService = TestBed.inject(StateService) as jasmine.SpyObj<StateService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize login form with email and password controls', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')).toBeDefined();
      expect(component.loginForm.get('password')).toBeDefined();
    });

    it('should have email and password as required fields', () => {
      const emailControl = component.loginForm.get('email');
      const passwordControl = component.loginForm.get('password');

      emailControl?.setValue('');
      passwordControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.loginForm.get('password');

      passwordControl?.setValue('short');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('validpassword123');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should initialize with loading false and no error', () => {
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: 'invalid',
        password: 'short',
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with valid credentials', () => {
      authService.login.and.returnValue(of({
        user: { firstName: 'John', email: 'john@example.com' },
      }));

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('john@example.com', 'validpassword123');
    });

    it('should store user in state on successful login', () => {
      const mockUser = { firstName: 'John', email: 'john@example.com' };
      authService.login.and.returnValue(of({ user: mockUser }));

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(stateService.setUser).toHaveBeenCalledWith(mockUser);
    });

    it('should show success notification on successful login', () => {
      const mockUser = { firstName: 'John', email: 'john@example.com' };
      authService.login.and.returnValue(of({ user: mockUser }));

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(notificationService.success).toHaveBeenCalledWith(
        'Welcome back, John! 👋',
        4000
      );
    });

    it('should navigate to dashboard on successful login', () => {
      authService.login.and.returnValue(of({
        user: { firstName: 'John', email: 'john@example.com' },
      }));

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle login error with invalid credentials', () => {
      authService.login.and.returnValue(
        throwError(() => ({ message: 'Invalid email or password' }))
      );

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

      component.onSubmit();

      expect(component.error).toBe('Invalid email or password');
      expect(component.loading).toBe(false);
    });

    it('should handle account locked error', () => {
      authService.login.and.returnValue(
        throwError(() => ({ message: 'Account is locked' }))
      );

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(component.error).toBe('Account is locked');
      expect(notificationService.error).toHaveBeenCalledWith('Account is locked', 5000);
    });

    it('should handle account disabled error', () => {
      authService.login.and.returnValue(
        throwError(() => ({ message: 'Account is disabled' }))
      );

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(component.error).toBe('Your account has been disabled. Please contact support.');
      expect(notificationService.error).toHaveBeenCalled();
    });

    it('should clear error on new submission attempt', () => {
      component.error = 'Previous error';

      authService.login.and.returnValue(of({
        user: { firstName: 'John', email: 'john@example.com' },
      }));

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(component.error).toBeNull();
    });
  });

  describe('Form State', () => {
    it('should disable submit button when form is invalid', () => {
      component.loginForm.patchValue({
        email: 'invalid',
        password: 'short',
      });

      expect(component.loginForm.valid).toBe(false);
    });

    it('should enable submit button when form is valid', () => {
      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      expect(component.loginForm.valid).toBe(true);
    });

    it('should disable submit button during loading', () => {
      component.loading = true;

      expect(component.loading).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', () => {
      authService.login.and.returnValue(
        throwError(() => ({ message: 'Network error' }))
      );

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(component.error).toBeTruthy();
    });

    it('should use default error message when no message provided', () => {
      authService.login.and.returnValue(throwError(() => ({})));

      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'validpassword123',
      });

      component.onSubmit();

      expect(component.error).toBe('Invalid email or password');
    });
  });
});
