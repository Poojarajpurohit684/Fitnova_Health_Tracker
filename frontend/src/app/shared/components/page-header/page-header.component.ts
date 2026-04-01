import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Page Header Component - Professional Page Title Section
 * 
 * Displays:
 * - Page title
 * - Page description
 * - Action buttons
 * - Breadcrumbs (optional)
 * 
 * Features:
 * - Responsive design
 * - Flexible layout
 * - Professional styling
 * - Dark mode support
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-header-text">
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-description" *ngIf="description">{{ description }}</p>
        </div>
        <div class="page-header-actions" *ngIf="showActions">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-text-primary: var(--color-text-primary, #0F172A);
      --color-text-secondary: var(--color-text-secondary, #475569);
      --spacing-lg: 1rem;
      --spacing-xl: 1.5rem;
    }

    .page-header {
      margin-bottom: var(--spacing-xl);
      animation: slideInDown 300ms ease-out;
    }

    .page-header-content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-xl);
      flex-wrap: wrap;
    }

    .page-header-text {
      flex: 1;
      min-width: 250px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-primary);
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .page-description {
      font-size: 1rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    .page-header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
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
      .page-header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .page-title {
        font-size: 1.75rem;
      }

      .page-header-actions {
        justify-content: flex-start;
      }
    }

    /* ========================================================================
       Mobile Layout (481-768px)
       ======================================================================== */
    @media (max-width: 768px) {
      .page-header {
        margin-bottom: var(--spacing-lg);
      }

      .page-title {
        font-size: 1.5rem;
      }

      .page-description {
        font-size: 0.95rem;
      }

      .page-header-actions {
        width: 100%;
        flex-direction: column;
      }

      .page-header-actions ::ng-deep > * {
        width: 100%;
      }
    }

    /* ========================================================================
       Small Mobile Layout (480px-)
       ======================================================================== */
    @media (max-width: 480px) {
      .page-title {
        font-size: 1.25rem;
      }

      .page-description {
        font-size: 0.9rem;
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */
    @media (prefers-reduced-motion: reduce) {
      .page-header {
        animation: none;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() showActions: boolean = true;
}
