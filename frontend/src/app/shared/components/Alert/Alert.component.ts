import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface AlertConfig {
  variant: AlertVariant;
  message: string;
  icon?: string;
  dismissible?: boolean;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert" [ngClass]="'alert-' + variant">
      <div class="alert-content">
        <div *ngIf="icon" class="alert-icon">
          {{ icon }}
        </div>
        <div class="alert-message">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-semantic-success-bg: #ECFDF5;
      --color-semantic-success-base: #10B981;
      --color-semantic-success-dark: #059669;
      
      --color-semantic-warning-bg: #FFFBEB;
      --color-semantic-warning-base: #F59E0B;
      --color-semantic-warning-dark: #D97706;
      
      --color-semantic-error-bg: #FEF2F2;
      --color-semantic-error-base: #EF4444;
      --color-semantic-error-dark: #DC2626;
      
      --color-semantic-info-bg: #EFF6FF;
      --color-semantic-info-base: #3B82F6;
      --color-semantic-info-dark: #1D4ED8;
      
      --spacing-lg: 1rem;
      --spacing-md: 0.75rem;
    }

    .alert {
      padding: var(--spacing-lg);
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      border-left: 4px solid;
    }

    .alert-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      width: 100%;
    }

    .alert-icon {
      flex-shrink: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-message {
      flex: 1;
      font-size: 1rem;
      line-height: 1.5;
    }

    /* Success Variant */
    .alert-success {
      background-color: var(--color-semantic-success-bg);
      border-left-color: var(--color-semantic-success-base);
      color: var(--color-semantic-success-dark);
    }

    /* Warning Variant */
    .alert-warning {
      background-color: var(--color-semantic-warning-bg);
      border-left-color: var(--color-semantic-warning-base);
      color: var(--color-semantic-warning-dark);
    }

    /* Error Variant */
    .alert-error {
      background-color: var(--color-semantic-error-bg);
      border-left-color: var(--color-semantic-error-base);
      color: var(--color-semantic-error-dark);
    }

    /* Info Variant */
    .alert-info {
      background-color: var(--color-semantic-info-bg);
      border-left-color: var(--color-semantic-info-base);
      color: var(--color-semantic-info-dark);
    }
  `]
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'info';
  @Input() message: string = '';
  @Input() icon?: string;
  @Input() dismissible: boolean = false;
}
