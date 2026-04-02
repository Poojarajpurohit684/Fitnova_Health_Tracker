import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateService } from '../../core/services/state.service';
import { NotificationService } from '../../core/services/notification.service';
import { CardComponent } from '../../shared/components/Card/card.component';
import { ButtonComponent } from '../../shared/components/Button/button.component';
import { FormInputComponent } from '../../shared/components/FormInput/form-input.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, FormInputComponent],
  template: `
    <div class="container">
      <header class="page-header flex-row justify-between items-end flex-stack">
        <div class="flex-column">
          <h1 class="page-title">User Settings</h1>
          <p class="page-subtitle">Personalize your FitNova experience and physical profile.</p>
        </div>
        <app-button 
          [variant]="isEditing ? 'glass' : 'primary'" 
          (click)="toggleEdit()"
          class="w-full-mobile">
          <span class="material-icons">{{ isEditing ? 'close' : 'edit' }}</span>
          {{ isEditing ? 'Cancel' : 'Edit Profile' }}
        </app-button>

        <div class="mobile-only-logout">
  <app-button 
    variant="glass" 
    class="w-full text-error" 
    (click)="logout()">
    <span class="material-icons">logout</span>
    Sign Out
  </app-button>
</div>
      </header>

      <div class="profile-layout-grid grid" style="gap: 2rem;">
        <!-- Left: Profile Summary -->
        <aside class="flex-column gap-lg">
          <app-card class="glass-card" [hoverable]="false">
            <div class="flex-column items-center text-center gap-md">
              <div class="avatar-wrapper">
                <span class="material-icons avatar-icon">person</span>
              </div>
              <div class="flex-column">
                <h2 class="text-xl font-black">{{ profileForm.get('firstName')?.value }} {{ profileForm.get('lastName')?.value }}</h2>
                <p class="text-xs text-primary font-bold uppercase tracking-widest">{{ profileForm.get('activityLevel')?.value }}</p>
              </div>
              <div class="flex-row gap-lg w-full" style="padding-top: 1rem; border-top: 1px solid var(--color-border-subtle);">
                <div class="flex-column flex-1">
                  <span class="text-lg font-black">{{ profileForm.get('height')?.value }}<small class="text-xs">cm</small></span>
                  <span class="text-xs text-dim uppercase font-bold">Height</span>
                </div>
                <div class="flex-column flex-1">
                  <span class="text-lg font-black">{{ profileForm.get('currentWeight')?.value }}<small class="text-xs"> kg</small></span>
                  <span class="text-xs text-dim uppercase font-bold">Weight</span>
                </div>
              </div>
            </div>
          </app-card>

          <app-card class="glass-card" [hoverable]="true">
            <h3 class="text-xs font-bold uppercase tracking-widest text-muted" style="margin-bottom: 1rem;">Quick Stats</h3>
            <div class="flex-column gap-md">
              <div class="flex-row justify-between">
                <span class="text-sm text-dim">BMI</span>
                <span class="text-sm font-bold">{{ calculateBMI() | number:'1.1-1' }}</span>
              </div>
              <div class="flex-row justify-between">
                <span class="text-sm text-dim">Target Weight</span>
                <span class="text-sm font-bold">75.0 kg</span>
              </div>
            </div>
          </app-card>
        </aside>

        <!-- Right: Profile Form -->
        <main>
          <app-card class="glass-card" [hoverable]="false">
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex-column gap-xl">
              <div class="grid grid-cols-2 mobile-stack-grid">
                <app-form-input
                  label="First Name"
                  type="text"
                  placeholder="First name"
                  formControlName="firstName"
                  [disabled]="!isEditing"
                ></app-form-input>
                <app-form-input
                  label="Last Name"
                  type="text"
                  placeholder="Last name"
                  formControlName="lastName"
                  [disabled]="!isEditing"
                ></app-form-input>
              </div>

              <app-form-input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                formControlName="email"
                [disabled]="true"
                helperText="Email cannot be changed"
              ></app-form-input>

              <div class="grid grid-cols-2 mobile-stack-grid">
                <app-form-input
                  label="Height (cm)"
                  type="number"
                  placeholder="175"
                  formControlName="height"
                  [disabled]="!isEditing"
                ></app-form-input>
                <app-form-input
                  label="Weight (kg)"
                  type="number"
                  placeholder="70"
                  formControlName="currentWeight"
                  [disabled]="!isEditing"
                ></app-form-input>
              </div>

              <div class="grid grid-cols-2 mobile-stack-grid">
                <div class="flex-column gap-xs">
                  <label class="text-muted text-xs font-bold uppercase tracking-wider">Gender</label>
                  <select 
                    class="custom-select"
                    formControlName="gender" 
                    [disabled]="!isEditing">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="flex-column gap-xs">
                  <label class="text-muted text-xs font-bold uppercase tracking-wider">Activity Level</label>
                  <select 
                    class="custom-select"
                    formControlName="activityLevel" 
                    [disabled]="!isEditing">
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="veryActive">Very Active</option>
                  </select>
                </div>
              </div>

              <div class="flex-row justify-end gap-md flex-stack" *ngIf="isEditing" style="margin-top: 1rem; padding-top: 2rem; border-top: 1px solid var(--color-border-subtle);">
                <app-button variant="glass" (click)="toggleEdit()" class="w-full-mobile">Cancel</app-button>
                <app-button 
                  type="submit" 
                  variant="primary" 
                  [loading]="isSubmitting"
                  [disabled]="!profileForm.valid || isSubmitting"
                  class="w-full-mobile">
                  Save Changes
                </app-button>
              </div>
            </form>
          </app-card>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .container { padding-top: var(--spacing-2xl); padding-bottom: var(--spacing-4xl); }
    
    .avatar-wrapper {
      width: 100px;
      height: 100px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary-base), var(--color-accent-base));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--glow-primary);
    }

    .avatar-icon {
      font-size: 4rem;
      color: white;
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

    .custom-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(255, 255, 255, 0.02);
    }

    .profile-layout-grid {
      grid-template-columns: 320px 1fr;
    }

    @media (max-width: 1024px) {
      .profile-layout-grid {
        grid-template-columns: 1fr;
      }
      
      aside { order: 2; }
      main { order: 1; }
    }

    @media (max-width: 768px) {
      .w-full-mobile { width: 100%; }
      
      .mobile-stack-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Add this to your ProfileComponent styles */
.mobile-only-logout {
  display: none; /* Hidden on Desktop */
  border-top: 1px solid var(--color-border-subtle);
}

.text-error {
  color: var(--color-error, #ef4444);
}

@media (max-width: 1024px) {
  .mobile-only-logout {
    display: block; /* Visible on Mobile/Tablet */
  }
  
  /* Ensure the logout button clears the bottom navbar height */
  .container {
    padding-bottom: 120px; 
  }
}

  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private stateService: StateService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
  }

  // Inside ProfileComponent
logout(): void {
  this.authService.logout().subscribe({
    next: () => {
      this.stateService.reset();
      this.router.navigate(['/auth/login']);
    }
  });
}


  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      height: ['', [Validators.required, Validators.min(50), Validators.max(300)]],
      currentWeight: ['', [Validators.required, Validators.min(20), Validators.max(500)]],
      gender: ['', [Validators.required]],
      activityLevel: ['', [Validators.required]],
    });
  }

  private loadUserData(): void {
    this.stateService.getUser().subscribe((user: any) => {
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          height: user.height || '',
          currentWeight: user.currentWeight || '',
          gender: user.gender || '',
          activityLevel: user.activityLevel || 'moderate',
        });
      }
    });
  }

  calculateBMI(): number {
    const height = this.profileForm.get('height')?.value / 100;
    const weight = this.profileForm.get('currentWeight')?.value;
    if (!height || !weight) return 0;
    return weight / (height * height);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData();
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.isEditing) {
      this.isSubmitting = true;
      const formData = this.profileForm.value;

      this.stateService.setUser(formData);
      this.notificationService.success('Profile updated successfully', 3000);
      this.isSubmitting = false;
      this.isEditing = false;
    }
  }
}
