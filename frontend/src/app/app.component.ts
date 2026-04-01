import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ToastComponent } from './shared/components/Toast/toast.component';
import { TitleService } from './core/services/title.service';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { StateService } from './core/services/state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ModalComponent, ToastComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    
    <main class="main-content" 
          [class.full-width]="!showNavbar" 
          [class.has-navbar]="showNavbar">
      <router-outlet></router-outlet>
    </main>

    <app-footer *ngIf="showFooter"></app-footer>
    <app-modal></app-modal>

    <!-- Global Toast Notifications -->
    <div class="toast-container">
      <app-toast
        *ngFor="let toast of (notifications$ | async)"
        [type]="toast.type"
        [message]="toast.message"
        [autoDismissMs]="toast.duration || 5000"
        (onClose)="removeNotification(toast.id)"
      ></app-toast>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--color-bg-main);
      color: var(--color-text-main);
    }

    .main-content {
      flex: 1;
      width: 100%;
      position: relative;
    }

    .main-content.has-navbar {
      padding: 100px 0 2rem 0;
    }

    .main-content.full-width {
      padding: 0;
    }

    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      max-width: calc(100% - 48px);
    }

    .toast-container > * {
      pointer-events: auto;
    }

    @media (max-width: 1024px) {
      .main-content.has-navbar {
        padding: 80px 0 100px 0;
      }
      .toast-container {
        top: auto;
        bottom: 120px;
        right: 16px;
        left: 16px;
        align-items: center;
        max-width: calc(100% - 32px);
      }
    }

    @media (max-width: 768px) {
      .main-content.has-navbar {
        padding: 70px 0 80px 0;
      }
      .toast-container {
        bottom: 100px;
        right: 12px;
        left: 12px;
        max-width: calc(100% - 24px);
      }
    }

    @media (max-width: 480px) {
      .main-content.has-navbar {
        padding: 60px 0 70px 0;
      }
      .toast-container {
        top: 12px;
        bottom: auto;
        right: 8px;
        left: 8px;
        max-width: calc(100% - 16px);
      }
    }
  `],
})
export class AppComponent implements OnInit {
  showNavbar = true;
  showFooter = false;
  notifications$ = this.stateService.getNotifications();

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        this.showNavbar = !this.isAuthRoute(url);
        this.showFooter = this.shouldShowFooter(url);
      });

    // Check initial route
    this.showNavbar = !this.isAuthRoute(this.router.url);
    this.showFooter = this.shouldShowFooter(this.router.url);
  }

  removeNotification(id: string) {
    this.stateService.removeNotification(id);
  }

  private isAuthRoute(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/register');
  }

  private shouldShowFooter(url: string): boolean {
    // Show footer on all pages except auth routes
    return !this.isAuthRoute(url);
  }
}

export function initializeApp(
  authService: AuthService,
  apiService: ApiService,
  stateService: StateService,
  titleService: TitleService
) {
  return () => {
    return new Promise<void>((resolve) => {
      resolve();
    });
  };
}
