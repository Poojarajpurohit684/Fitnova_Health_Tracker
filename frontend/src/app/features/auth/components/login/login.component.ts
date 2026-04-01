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
  selector: 'app-login',
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
          <h1 class="text-4xl font-black" style="margin-top: 1.5rem;">Welcome Back</h1>
          <p class="text-muted text-lg">Continue your peak performance journey.</p>
        </div>

        <!-- Login Card -->
        <app-card class="glass-card auth-card" [hoverable]="false">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex-column gap-lg">
            <app-form-input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              formControlName="email"
              [validationState]="getValidationState('email')"
              [errorMessage]="getErrorMessage('email')"
            ></app-form-input>

            <app-form-input
              label="Password"
              type="password"
              placeholder="••••••••"
              formControlName="password"
              [validationState]="getValidationState('password')"
              [errorMessage]="getErrorMessage('password')"
            ></app-form-input>

            <div *ngIf="error" class="error-banner">
              <span class="material-icons">error_outline</span>
              <span>{{ error }}</span>
            </div>

            <app-button 
              type="submit" 
              variant="primary" 
              [fullWidth]="true" 
              [loading]="loading"
              [disabled]="!loginForm.valid || loading">
              Sign In
            </app-button>
          </form>

          <div class="auth-footer">
            <p class="text-sm text-muted">
              New to FitNova? 
              <a routerLink="/auth/register" class="text-primary font-bold no-underline hover:underline">Create an account</a>
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
      gap: var(--spacing-3xl);
    }

    .brand-section {
      text-align: center;
    }

    .auth-card {
      padding: var(--spacing-3xl) !important;
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

    @media (max-width: 640px) {
      .auth-container {
        gap: var(--spacing-2xl);
      }
      .auth-card {
        padding: var(--spacing-xl) !important;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthFeatureService,
    private stateService: StateService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  getValidationState(fieldName: string): 'default' | 'valid' | 'invalid' {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.touched) return 'default';
    return field.valid ? 'valid' : 'invalid';
  }

  getErrorMessage(fieldName: string): string | undefined {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.touched || field.valid) return undefined;

    if (fieldName === 'email' && field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (fieldName === 'password' && field.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    return 'This field is required';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response: any) => {
          if (response?.user) {
            this.stateService.setUser(response.user);
          }
          this.notificationService.success(`Welcome back! 👋`, 3000);
          this.loading = false;
          
          this.router.navigate(['/dashboard']).then(success => {
            if (!success) {
              this.error = 'Navigation to dashboard failed. Please try refreshing.';
            }
          });
        },
        error: (err) => {
          this.error = err.message || 'Invalid email or password';
          this.notificationService.error(this.error || 'Login failed', 4000);
          this.loading = false;
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
