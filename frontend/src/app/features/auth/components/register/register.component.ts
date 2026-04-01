import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthFeatureService } from '../../services/auth-feature.service';
import { StateService } from '../../../../core/services/state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FormInputComponent } from '../../../../shared/components/FormInput/form-input.component';
import { LogoDisplayComponent } from '../../../../shared/components/logo-display/logo-display.component';
import { CardComponent } from '../../../../shared/components/Card/card.component';
import { ButtonComponent } from '../../../../shared/components/Button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    FormInputComponent, 
    LogoDisplayComponent,
    CardComponent,
    ButtonComponent
  ],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <!-- Brand Section -->
        <div class="brand-section">
          <app-logo-display size="large"></app-logo-display>
          <h1 class="text-4xl font-black" style="margin-top: 1.5rem;">Join FitNova</h1>
          <p class="text-muted text-lg">Start your peak performance journey today.</p>
        </div>

        <!-- Register Card -->
        <app-card class="glass-card auth-card" [hoverable]="false">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex-column gap-lg">
            <div class="grid grid-cols-2 gap-md mobile-stack-grid">
              <app-form-input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                formControlName="name"
                [validationState]="getValidationState('name')"
                [errorMessage]="getErrorMessage('name')"
              ></app-form-input>

              <app-form-input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                formControlName="email"
                [validationState]="getValidationState('email')"
                [errorMessage]="getErrorMessage('email')"
              ></app-form-input>
            </div>

            <div class="grid grid-cols-2 gap-md mobile-stack-grid">
              <div class="flex-column gap-xs">
                <app-form-input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  formControlName="password"
                  [validationState]="getValidationState('password')"
                  [errorMessage]="getErrorMessage('password')"
                  (valueChange)="onPasswordChange($event)"
                ></app-form-input>
                
                <!-- Password Strength Indicator -->
                <div *ngIf="registerForm.get('password')?.value" class="password-strength">
                  <div class="strength-bar">
                    <div class="strength-fill" [style.width.%]="passwordStrengthPercent" [class]="'strength-' + passwordStrength"></div>
                  </div>
                  <span class="text-xs font-bold uppercase tracking-wider" [class]="'text-' + passwordStrength">
                    {{ passwordStrengthText }}
                  </span>
                </div>
              </div>

              <app-form-input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                formControlName="confirmPassword"
                [validationState]="getValidationState('confirmPassword')"
                [errorMessage]="getErrorMessage('confirmPassword')"
              ></app-form-input>
            </div>

            <div class="grid grid-cols-5 gap-md register-details-grid">
              <app-form-input
                label="Birth Date"
                type="date"
                formControlName="dateOfBirth"
                [validationState]="getValidationState('dateOfBirth')"
                class="col-span-2-mobile"
              ></app-form-input>

              <div class="flex-column gap-xs col-span-1-mobile">
                <label class="text-xs font-bold uppercase tracking-wider text-muted">Gender</label>
                <select formControlName="gender" class="custom-select">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-xs col-span-2-mobile">
                <app-form-input
                  label="Height"
                  type="number"
                  placeholder="cm"
                  formControlName="height"
                ></app-form-input>
                <app-form-input
                  label="Weight"
                  type="number"
                  placeholder="kg"
                  formControlName="currentWeight"
                ></app-form-input>
              </div>
            </div>

            <div class="terms-group">
              <input type="checkbox" id="terms" formControlName="terms" class="custom-checkbox">
              <label for="terms" class="text-xs text-muted">
                I agree to the <a routerLink="/terms" class="text-primary no-underline hover:underline">Terms of Service</a>
              </label>
            </div>

            <div *ngIf="error" class="error-banner">
              <span class="material-icons">error_outline</span>
              <span>{{ error }}</span>
            </div>

            <app-button 
              type="submit" 
              variant="primary" 
              [fullWidth]="true" 
              [loading]="loading"
              [disabled]="!registerForm.valid || loading">
              Create Account
            </app-button>
          </form>

          <div class="auth-footer">
            <p class="text-sm text-muted">
              Already have an account? 
              <a routerLink="/auth/login" class="text-primary font-bold no-underline hover:underline">Sign In</a>
            </p>
          </div>
        </app-card>
      </div>

      <!-- Decorative Background Elements -->
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      background: var(--color-bg-main);
      position: relative;
      overflow: hidden;
    }

    .auth-container {
      width: 100%;
      max-width: 480px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }

    .brand-section {
      text-align: center;
    }

    .auth-card {
      padding: var(--spacing-3xl) !important;
    }

    .custom-select {
      width: 100%;
      padding: var(--padding-input);
      min-height: 48px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      color: var(--color-text-main);
      font-family: var(--font-family-sans);
      outline: none;
      transition: all var(--duration-normal) var(--easing-smooth);
    }

    .custom-select:focus {
      border-color: var(--color-primary-base);
      box-shadow: var(--glow-primary);
    }

    .password-strength {
      padding: var(--spacing-sm);
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border-subtle);
    }

    .strength-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .strength-weak { background: var(--color-error); }
    .strength-fair { background: var(--color-warning); }
    .strength-good { background: var(--color-info); }
    .strength-strong { background: var(--color-success); }

    .text-weak { color: var(--color-error); }
    .text-fair { color: var(--color-warning); }
    .text-good { color: var(--color-info); }
    .text-strong { color: var(--color-success); }

    .terms-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .custom-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--color-primary-base);
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-md);
      color: var(--color-error);
      font-size: var(--typography-body-sm-size);
      font-weight: var(--typography-weight-medium);
    }

    .auth-footer {
      margin-top: var(--spacing-xl);
      text-align: center;
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-border-subtle);
    }

    /* Decorative Backgrounds */
    .bg-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      z-index: 1;
      opacity: 0.15;
      pointer-events: none;
    }

    .bg-glow-1 {
      width: 500px;
      height: 500px;
      background: var(--color-primary-base);
      top: -100px;
      right: -100px;
    }

    .bg-glow-2 {
      width: 400px;
      height: 400px;
      background: var(--color-accent-base);
      bottom: -100px;
      left: -100px;
    }

    @media (max-width: 768px) {
      .auth-page {
        padding: 1rem;
      }
      .auth-card {
        padding: 1.5rem !important;
      }
      .mobile-stack-grid {
        grid-template-columns: 1fr;
      }
      .register-details-grid {
        grid-template-columns: 1fr 1fr;
      }
      .col-span-2-mobile { grid-column: span 2; }
    }

    @media (max-width: 480px) {
      .register-details-grid {
        grid-template-columns: 1fr;
      }
      .col-span-2-mobile, .col-span-1-mobile { grid-column: span 1; }
      
      .brand-section h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error: string | null = null;
  passwordStrength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  passwordStrengthPercent = 0;
  passwordStrengthText = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthFeatureService,
    private stateService: StateService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['M', [Validators.required]],
      height: [175, [Validators.required, Validators.min(50), Validators.max(300)]],
      currentWeight: [70, [Validators.required, Validators.min(20), Validators.max(500)]],
      terms: [false, [Validators.requiredTrue]],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  getValidationState(fieldName: string): 'default' | 'valid' | 'invalid' {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.touched) return 'default';
    return field.valid ? 'valid' : 'invalid';
  }

  getErrorMessage(fieldName: string): string | undefined {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.touched || field.valid) return undefined;
    if (fieldName === 'name' && field.hasError('required')) return 'Full name is required';
    if (fieldName === 'email' && field.hasError('email')) return 'Please enter a valid email address';
    if (fieldName === 'password' && field.hasError('minlength')) return 'Password must be at least 12 characters';
    if (fieldName === 'confirmPassword' && field.hasError('passwordMismatch')) return 'Passwords do not match';
    if (fieldName === 'dateOfBirth' && field.hasError('required')) return 'Birth date is required';
    return 'This field is required';
  }

  onPasswordChange(password: string): void {
    const strength = this.calculatePasswordStrength(password);
    this.passwordStrength = strength.level;
    this.passwordStrengthPercent = strength.percent;
    this.passwordStrengthText = strength.text;
  }

  private calculatePasswordStrength(password: string): { level: 'weak' | 'fair' | 'good' | 'strong'; percent: number; text: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (score <= 3) return { level: 'weak', percent: 25, text: 'Weak' };
    if (score <= 4) return { level: 'fair', percent: 50, text: 'Fair' };
    if (score <= 5) return { level: 'good', percent: 75, text: 'Good' };
    return { level: 'strong', percent: 100, text: 'Strong' };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = null;
      const { name, email, password, dateOfBirth, gender, height, currentWeight } = this.registerForm.value;
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Format date to ISO string for backend
      const formattedDate = new Date(dateOfBirth).toISOString();

      this.authService.register(firstName, lastName, email, password, formattedDate, gender, height, currentWeight).subscribe({
        next: (response: any) => {
          if (response.user) {
            this.stateService.setUser(response.user);
            this.notificationService.success(`Welcome ${firstName}! 🎉`, 4000);
          }
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          this.error = err?.message || 'Registration failed';
          this.notificationService.error(this.error || 'Registration failed', 3000);
          this.loading = false;
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
