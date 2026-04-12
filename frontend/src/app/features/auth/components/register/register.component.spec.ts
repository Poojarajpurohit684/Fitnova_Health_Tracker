import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { StateService } from '../../../../core/services/state.service';
import { AuthFeatureService } from '../../services/auth-feature.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthFeatureService>;
  let stateService: jasmine.SpyObj<StateService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthFeatureService', ['register']);
    const stateServiceSpy = jasmine.createSpyObj('StateService', ['setUser']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [
        { provide: AuthFeatureService, useValue: authServiceSpy },
        { provide: StateService, useValue: stateServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthFeatureService) as jasmine.SpyObj<AuthFeatureService>;
    stateService = TestBed.inject(StateService) as jasmine.SpyObj<StateService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize required form controls', () => {
    expect(component.registerForm.get('firstName')).toBeTruthy();
    expect(component.registerForm.get('lastName')).toBeTruthy();
    expect(component.registerForm.get('email')).toBeTruthy();
    expect(component.registerForm.get('password')).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')).toBeTruthy();
    expect(component.registerForm.get('dateOfBirth')).toBeTruthy();
    expect(component.registerForm.get('gender')).toBeTruthy();
    expect(component.registerForm.get('height')).toBeTruthy();
    expect(component.registerForm.get('currentWeight')).toBeTruthy();
    expect(component.registerForm.get('terms')).toBeTruthy();
  });

  it('should calculate password strength', () => {
    component.onPasswordChange('weak');
    expect(component.passwordStrengthText).toBe('Weak');

    component.onPasswordChange('WeakPassword123!');
    expect(component.passwordStrengthText).toBe('Strong');
  });

  it('should not submit if form invalid', () => {
    component.registerForm.patchValue({
      firstName: '',
      lastName: '',
      email: 'invalid',
      password: 'short',
      confirmPassword: 'short',
      dateOfBirth: '',
      terms: false,
    });

    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should submit valid form and navigate to dashboard', () => {
    authService.register.and.returnValue(of({ userId: '123', user: { firstName: 'John' } } as any));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!@#',
      confirmPassword: 'Password123!@#',
      dateOfBirth: '1990-01-01',
      gender: 'M',
      height: 180,
      currentWeight: 75,
      terms: true,
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(stateService.setUser).toHaveBeenCalled();
  });
});
