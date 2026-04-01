import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Stat Card Component - Professional Statistics Display
 * 
 * Displays key metrics with:
 * - Large value display
 * - Label and description
 * - Icon support
 * - Trend indicator (optional)
 * - Color variants
 * 
 * Usage:
 * <app-stat-card 
 *   [value]="'1,234'" 
 *   [label]="'Total Workouts'"
 *   [trend]="'+12%'"
 *   [icon]="'dumbbell'">
 * </app-stat-card>
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-' + variant">
      <div class="stat-header">
        <div class="stat-icon" *ngIf="icon">
          <ng-content select="[icon]"></ng-content>
        </div>
        <div class="stat-trend" *ngIf="trend" [class.positive]="trendPositive">
          {{ trend }}
        </div>
      </div>
      
      <div class="stat-content">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <p class="stat-description" *ngIf="description">{{ description }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-bg-primary: var(--color-bg-primary, #FFFFFF);
      --color-border: var(--color-border, #E2E8F0);
      --color-primary-base: var(--color-primary-base, #0F172A);
      --color-secondary-base: var(--color-secondary-base, #06B6D4);
      --color-semantic-success-base: var(--color-semantic-success-base, #10B981);
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-card {
      background-color: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      animation: statCardFadeIn 300ms ease-out;
    }

    .stat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .stat-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(6, 182, 212, 0.1);
      color: var(--color-secondary-base);
      flex-shrink: 0;
    }

    .stat-trend {
      font-size: 0.875rem;
      font-weight: 700;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      background-color: rgba(239, 68, 68, 0.1);
      color: #EF4444;
    }

    .stat-trend.positive {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--color-semantic-success-base);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-primary-base);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-primary-base);
    }

    .stat-description {
      font-size: 0.85rem;
      color: #64748B;
      margin: 0;
      line-height: 1.5;
    }

    /* Stat variants */
    .stat-primary {
      border-color: var(--color-secondary-base);
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(34, 211, 238, 0.05) 100%);
    }

    .stat-primary .stat-icon {
      background-color: rgba(6, 182, 212, 0.15);
    }

    .stat-success {
      border-color: var(--color-semantic-success-base);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(110, 231, 183, 0.05) 100%);
    }

    .stat-success .stat-icon {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--color-semantic-success-base);
    }

    .stat-warning {
      border-color: #F59E0B;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(252, 211, 77, 0.05) 100%);
    }

    .stat-warning .stat-icon {
      background-color: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
    }

    @keyframes statCardFadeIn {
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
      .stat-card {
        padding: 1.25rem;
      }

      .stat-value {
        font-size: 1.75rem;
      }

      .stat-icon {
        width: 40px;
        height: 40px;
      }
    }

    /* ========================================================================
       Mobile Layout (481-768px)
       ======================================================================== */
    @media (max-width: 768px) {
      .stat-card {
        padding: 1rem;
      }

      .stat-value {
        font-size: 1.5rem;
      }

      .stat-label {
        font-size: 0.9rem;
      }

      .stat-icon {
        width: 36px;
        height: 36px;
      }
    }

    /* ========================================================================
       Small Mobile Layout (480px-)
       ======================================================================== */
    @media (max-width: 480px) {
      .stat-card {
        padding: 0.75rem;
      }

      .stat-value {
        font-size: 1.25rem;
      }

      .stat-label {
        font-size: 0.85rem;
      }

      .stat-description {
        font-size: 0.8rem;
      }

      .stat-icon {
        width: 32px;
        height: 32px;
      }

      .stat-trend {
        font-size: 0.8rem;
        padding: 0.4rem 0.6rem;
      }
    }

    /* ========================================================================
       Dark Mode Support
       ======================================================================== */
    @media (prefers-color-scheme: dark) {
      .stat-card {
        background-color: var(--color-bg-primary);
        border-color: var(--color-border);
      }

      .stat-description {
        color: #CBD5E1;
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */
    @media (prefers-reduced-motion: reduce) {
      .stat-card {
        animation: none;
        transition: none;
      }

      .stat-card:hover {
        transform: none;
      }
    }
  `]
})
export class StatCardComponent {
  @Input() value: string = '0';
  @Input() label: string = '';
  @Input() description: string = '';
  @Input() trend: string = '';
  @Input() trendPositive: boolean = false;
  @Input() icon: boolean = false;
  @Input() variant: 'primary' | 'success' | 'warning' = 'primary';
}
