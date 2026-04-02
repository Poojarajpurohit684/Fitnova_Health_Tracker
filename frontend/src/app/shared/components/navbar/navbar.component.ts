import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StateService } from '../../../core/services/state.service';
import { LogoDisplayComponent } from '../logo-display/logo-display.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoDisplayComponent],
  template: `
    <!-- Desktop Navbar -->
    <header class="navbar-desktop" [class.scrolled]="isScrolled">
      <div class="container flex-row items-center justify-between">
        <div class="logo-section" routerLink="/">
          <app-logo-display size="small"></app-logo-display>
        </div>

        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Dashboard</a>
          <a routerLink="/workouts" routerLinkActive="active" class="nav-link">Workouts</a>
          <a routerLink="/nutrition" routerLinkActive="active" class="nav-link">Nutrition</a>
          <a routerLink="/goals" routerLinkActive="active" class="nav-link">Goals</a>
          <a routerLink="/analytics" routerLinkActive="active" class="nav-link">Analytics</a>
        </nav>

        <div class="user-section">
          <button (click)="goToProfile()" class="icon-btn" title="Profile">
            <span class="material-icons">account_circle</span>
          </button>
          <button (click)="logout()" class="icon-btn logout" title="Logout">
            <span class="material-icons">logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Bottom Navigation -->
    <nav class="navbar-mobile">
  <a routerLink="/dashboard" routerLinkActive="active" class="mobile-link">
    <span class="material-icons">dashboard</span>
    <span class="label">Home</span>
  </a>

  <a routerLink="/workouts" routerLinkActive="active" class="mobile-link">
    <span class="material-icons">fitness_center</span>
    <span class="label">Train</span>
  </a>

  <a routerLink="/nutrition" routerLinkActive="active" class="mobile-link">
    <span class="material-icons">restaurant</span>
    <span class="label">Eat</span>
  </a>

  <a routerLink="/analytics" routerLinkActive="active" class="mobile-link">
    <span class="material-icons">insights</span>
    <span class="label">Stats</span>
  </a>

  <a routerLink="/goals" routerLinkActive="active" class="mobile-link">
    <span class="material-icons">track_changes</span>
    <span class="label">Goals</span>
  </a>

  <a routerLink="/profile" routerLinkActive="active" class="mobile-link">
    <span class="material-icons">account_circle</span>
    <span class="label">Me</span>
  </a>
</nav>
  `,
  styles: [`
    /* Desktop Styles */
    .navbar-desktop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      z-index: 1000;
      display: flex;
      align-items: center;
      transition: all var(--duration-normal) var(--easing-standard);
      background: rgba(2, 6, 23, 0.5);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--color-border-subtle);
    }

    .navbar-desktop.scrolled {
      height: 64px;
      background: var(--color-bg-surface);
      border-bottom-color: var(--color-border-strong);
      box-shadow: var(--shadow-md);
    }

    .logo-section {
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .logo-section:hover { opacity: 0.8; }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      color: var(--color-text-muted);
      text-decoration: none;
      font-weight: var(--typography-weight-semibold);
      font-size: 0.9375rem;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .nav-link:hover {
      color: var(--color-text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-link.active {
      color: var(--color-primary-light);
      background: rgba(99, 102, 241, 0.1);
    }

    .user-section {
      display: flex;
      gap: 0.5rem;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      border: none;
      background: transparent;
      color: var(--color-text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--color-text-main);
    }

    .icon-btn.logout:hover { color: var(--color-error); }

    /* Mobile Styles */
    .navbar-mobile {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 72px;
      z-index: 1000;
      background: var(--color-bg-surface);
      border-top: 1px solid var(--color-border-subtle);
      justify-content: space-around;
      align-items: center;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .mobile-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--color-text-dim);
      text-decoration: none;
      transition: all 0.2s;
      flex: 1;
      min-height: 72px;
      justify-content: center;
      position: relative;
    }

    .mobile-link .material-icons { 
      font-size: 1.5rem;
      transition: transform 0.2s;
    }
    
    .mobile-link .label { 
      font-size: 0.625rem; 
      font-weight: 700; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .mobile-link.active {
      color: var(--color-primary-base);
    }

    .mobile-link.active .material-icons {
      transform: scale(1.1);
    }

    .mobile-link:active {
      background: rgba(255, 255, 255, 0.05);
    }

    @media (max-width: 1024px) {
      .navbar-desktop { display: none; }
      .navbar-mobile { display: flex; }
    }

    @media (max-width: 768px) {
      .navbar-mobile {
        height: 64px;
        height: auto;
      }

      .mobile-link {
        min-height: 64px;
        gap: 2px;
      }

      .mobile-link .material-icons { 
        font-size: 1.25rem;
      }

      .mobile-link .label { 
        font-size: 0.55rem;
      }
    }

    @media (max-width: 480px) {
      .navbar-mobile {
        height: 56px;
        height: auto;
      }

      .mobile-link {
        min-height: 56px;
        gap: 1px;
      }

      .mobile-link .material-icons { 
        font-size: 1.1rem;
      }

      .mobile-link .label { 
        font-size: 0.5rem;
        display: none;
      }
    }

    @media (orientation: landscape) and (max-height: 500px) {
      .navbar-mobile {
        height: 48px;
      }

      .mobile-link {
        min-height: 48px;
        gap: 0;
      }

      .mobile-link .label {
        display: none;
      }

      .mobile-link .material-icons {
        font-size: 1.25rem;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isScrolled = false;

  constructor(
    private authService: AuthService,
    private stateService: StateService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 20;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      complete: () => {
        this.stateService.reset();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.stateService.reset();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
