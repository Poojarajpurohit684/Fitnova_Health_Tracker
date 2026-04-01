import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * SidebarComponent - Responsive Side Navigation
 * 
 * Provides collapsible side navigation with:
 * - Logo and branding
 * - Navigation menu items
 * - Active state styling
 * - Responsive design (collapsible on mobile)
 * - Accessibility support (ARIA labels, keyboard navigation)
 * 
 * Features:
 * - Desktop: 240px width, always visible
 * - Tablet: Collapsible with toggle button
 * - Mobile: Slide-out drawer with overlay
 * - Active item highlighting
 * - Smooth animations
 * - Dark mode support
 * 
 * @example
 * <app-sidebar
 *   [isOpen]="sidebarOpen"
 *   (onToggle)="toggleSidebar()">
 * </app-sidebar>
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Overlay backdrop for mobile -->
    <div
      *ngIf="isOpen"
      class="sidebar-overlay"
      (click)="onToggle.emit()"
      role="presentation"
      aria-hidden="true"
    ></div>

    <!-- Sidebar container -->
    <aside
      class="sidebar"
      [class.sidebar-open]="isOpen"
      role="navigation"
      aria-label="Side navigation"
    >
      <!-- Sidebar header -->
      <div class="sidebar-header">
        <h2 class="sidebar-title">Menu</h2>
        <button
          type="button"
          class="sidebar-close"
          (click)="onToggle.emit()"
          aria-label="Close sidebar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Navigation menu -->
      <nav class="sidebar-nav" role="navigation">
        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="sidebar-item"
          title="Dashboard"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="sidebar-label">Dashboard</span>
        </a>

        <a
          routerLink="/workouts"
          routerLinkActive="active"
          class="sidebar-item"
          title="Workouts"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 4h12v2H6z"></path>
            <path d="M6 10h12v10H6z"></path>
            <path d="M9 14h6"></path>
          </svg>
          <span class="sidebar-label">Workouts</span>
        </a>

        <a
          routerLink="/nutrition"
          routerLinkActive="active"
          class="sidebar-item"
          title="Nutrition"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <span class="sidebar-label">Nutrition</span>
        </a>

        <a
          routerLink="/goals"
          routerLinkActive="active"
          class="sidebar-item"
          title="Goals"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <span class="sidebar-label">Goals</span>
        </a>

        <a
          routerLink="/analytics"
          routerLinkActive="active"
          class="sidebar-item"
          title="Analytics"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"></polyline>
            <polyline points="12 12 20 7.5"></polyline>
            <polyline points="12 12 12 21"></polyline>
            <polyline points="12 12 4 7.5"></polyline>
          </svg>
          <span class="sidebar-label">Analytics</span>
        </a>

        <a
          routerLink="/social"
          routerLinkActive="active"
          class="sidebar-item"
          title="Social"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="sidebar-label">Social</span>
        </a>
      </nav>

      <!-- Sidebar footer -->
      <div class="sidebar-footer">
        <a
          routerLink="/settings"
          routerLinkActive="active"
          class="sidebar-item"
          title="Settings"
        >
          <svg class="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
          </svg>
          <span class="sidebar-label">Settings</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      --color-bg-primary: var(--color-bg-primary, #FFFFFF);
      --color-bg-secondary: var(--color-bg-secondary, #F9FAFB);
      --color-text-primary: var(--color-text-primary, #111827);
      --color-text-secondary: var(--color-text-secondary, #6B7280);
      --color-border: var(--color-border, #E5E7EB);
      --color-primary-base: #10B981;
      --color-primary-light: #6EE7B7;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* ========================================================================
       Sidebar Overlay - Mobile backdrop
       ======================================================================== */

    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999;
      display: none;
    }

    /* ========================================================================
       Sidebar Container
       ======================================================================== */

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 240px;
      background-color: var(--color-bg-primary);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      z-index: 1000;
      transition: transform 300ms ease-out;
      box-shadow: var(--shadow-md);
    }

    /* ========================================================================
       Sidebar Header
       ======================================================================== */

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      height: 64px;
    }

    .sidebar-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }

    .sidebar-close {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--color-text-secondary);
      border-radius: 6px;
      transition: all 150ms ease-out;
    }

    .sidebar-close:hover {
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }

    .sidebar-close:focus-visible {
      outline: 2px solid var(--color-primary-base);
      outline-offset: 2px;
    }

    /* ========================================================================
       Sidebar Navigation
       ======================================================================== */

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      height: 40px;
      border-radius: 6px;
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 150ms ease-out;
      cursor: pointer;
      white-space: nowrap;
    }

    .sidebar-item:hover {
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }

    .sidebar-item.active {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10B981;
      font-weight: 600;
    }

    .sidebar-item:focus-visible {
      outline: 2px solid var(--color-primary-base);
      outline-offset: -2px;
    }

    .sidebar-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .sidebar-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ========================================================================
       Sidebar Footer
       ======================================================================== */

    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ========================================================================
       Responsive Design
       ======================================================================== */

    /* Desktop (1025px+) */
    @media (min-width: 1025px) {
      .sidebar {
        position: relative;
        height: auto;
        min-height: 100vh;
      }
    }

    /* Tablet (769-1024px) */
    @media (max-width: 1024px) {
      .sidebar {
        width: 200px;
      }

      .sidebar-label {
        display: none;
      }

      .sidebar-item {
        justify-content: center;
        padding: 12px;
        width: 40px;
        height: 40px;
      }

      .sidebar-header {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 56px;
        padding: 8px;
      }

      .sidebar-title {
        display: none;
      }

      .sidebar-close {
        display: flex;
      }
    }

    /* Mobile (481-768px) */
    @media (max-width: 768px) {
      .sidebar {
        width: 240px;
        transform: translateX(-100%);
      }

      .sidebar.sidebar-open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        display: block;
      }

      .sidebar-label {
        display: inline;
      }

      .sidebar-item {
        justify-content: flex-start;
        padding: 12px;
        width: auto;
        height: 40px;
      }

      .sidebar-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 64px;
        padding: 16px;
      }

      .sidebar-title {
        display: block;
      }

      .sidebar-close {
        display: flex;
      }
    }

    /* Small Mobile (480px or less) */
    @media (max-width: 480px) {
      .sidebar {
        width: 100%;
        max-width: 280px;
      }

      .sidebar-header {
        padding: 12px;
        height: 56px;
      }

      .sidebar-nav {
        padding: 4px;
        gap: 2px;
      }

      .sidebar-item {
        padding: 10px;
        height: 36px;
        font-size: 13px;
      }

      .sidebar-icon {
        width: 18px;
        height: 18px;
      }
    }

    /* ========================================================================
       Dark Mode Support
       ======================================================================== */

    @media (prefers-color-scheme: dark) {
      .sidebar {
        background-color: var(--color-bg-primary);
        border-right-color: var(--color-border);
      }

      .sidebar-item:hover {
        background-color: var(--color-bg-secondary);
      }

      .sidebar-item.active {
        background-color: rgba(255, 107, 107, 0.15);
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */

    @media (prefers-reduced-motion: reduce) {
      .sidebar,
      .sidebar-item,
      .sidebar-close {
        transition: none;
      }
    }
  `]
})
export class SidebarComponent {
  /** Whether sidebar is open (mobile) */
  @Input() isOpen: boolean = false;

  /** Event emitted when sidebar toggle is clicked */
  @Output() onToggle = new EventEmitter<void>();
}
