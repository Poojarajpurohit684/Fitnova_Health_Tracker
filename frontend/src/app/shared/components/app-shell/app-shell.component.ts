import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

/**
 * App Shell Component - Professional Application Layout
 * 
 * Provides the main application layout structure with:
 * - Sticky navbar at top
 * - Main content area with proper spacing
 * - Footer at bottom
 * - Responsive design for all breakpoints
 * - Professional styling and spacing
 * 
 * Layout Structure:
 * ┌─────────────────────────────────┐
 * │         Navbar (sticky)         │
 * ├─────────────────────────────────┤
 * │                                 │
 * │      Main Content Area          │
 * │      (Router Outlet)            │
 * │                                 │
 * ├─────────────────────────────────┤
 * │           Footer                │
 * └─────────────────────────────────┘
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-shell">
      <!-- Sticky Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Content Area -->
      <main class="app-main" role="main">
        <div class="app-content">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host {
      --color-bg-primary: var(--color-bg-primary, #FFFFFF);
      --color-bg-secondary: var(--color-bg-secondary, #F8FAFC);
      --spacing-lg: 1rem;
      --spacing-xl: 1.5rem;
      --spacing-2xl: 2rem;
      --spacing-3xl: 3rem;
    }

    .app-shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-bg-secondary);
    }

    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg-secondary);
    }

    .app-content {
      flex: 1;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--spacing-2xl);
      animation: fadeIn 300ms ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ========================================================================
       Tablet Layout (769-1024px)
       ======================================================================== */
    @media (max-width: 1024px) {
      .app-content {
        max-width: 100%;
        padding: var(--spacing-xl);
      }
    }

    /* ========================================================================
       Mobile Layout (481-768px)
       ======================================================================== */
    @media (max-width: 768px) {
      .app-content {
        padding: var(--spacing-lg);
      }
    }

    /* ========================================================================
       Small Mobile Layout (480px-)
       ======================================================================== */
    @media (max-width: 480px) {
      .app-content {
        padding: var(--spacing-lg);
      }
    }

    /* ========================================================================
       Dark Mode Support
       ======================================================================== */
    @media (prefers-color-scheme: dark) {
      .app-shell {
        background-color: var(--color-bg-primary);
      }

      .app-main {
        background-color: var(--color-bg-secondary);
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */
    @media (prefers-reduced-motion: reduce) {
      .app-content {
        animation: none;
      }
    }
  `]
})
export class AppShellComponent implements OnInit {
  ngOnInit(): void {
    // Initialize app shell
  }
}
