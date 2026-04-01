import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * Toast type variants
 * - success: Success message (green)
 * - warning: Warning message (amber)
 * - error: Error message (red)
 * - info: Info message (blue)
 */
export type ToastType = 'success' | 'warning' | 'error' | 'info';

/**
 * Toast position variants
 * - top-right: Top right corner (desktop default)
 * - top-left: Top left corner
 * - bottom-right: Bottom right corner
 * - bottom-left: Bottom left corner
 * - bottom-center: Bottom center (mobile default)
 */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'bottom-center';

/**
 * ToastComponent
 * 
 * A reusable toast notification component for displaying temporary messages.
 * Supports multiple types, positions, and auto-dismiss functionality.
 * 
 * Features:
 * - 4 types: success, warning, error, info
 * - 5 positions: top-right, top-left, bottom-right, bottom-left, bottom-center
 * - Auto-dismiss after 4 seconds (configurable)
 * - Slide up + fade in animation (300ms)
 * - Close button for manual dismissal
 * - Design tokens integration
 * - Dark mode support
 * - WCAG AA accessibility
 * - Respects prefers-reduced-motion
 * 
 * @example
 * // Basic success toast
 * <app-toast type="success" message="Operation completed successfully"></app-toast>
 * 
 * @example
 * // Error toast with custom duration
 * <app-toast
 *   type="error"
 *   message="An error occurred"
 *   [autoDismissMs]="5000"
 *   (onClose)="onToastClose()">
 * </app-toast>
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toast"
      [ngClass]="'toast-' + type"
      [attr.role]="'alert'"
      [attr.aria-live]="'polite'"
      [attr.aria-atomic]="'true'"
      [@toastAnimation]
    >
      <div class="toast-content">
        <!-- Icon -->
        <div class="toast-icon" aria-hidden="true">
          <svg *ngIf="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg *ngIf="type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg *ngIf="type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <!-- Message -->
        <div class="toast-message">
          {{ message }}
        </div>
      </div>

      <!-- Close Button -->
      <button
        type="button"
        class="toast-close"
        [attr.aria-label]="'Close ' + type + ' notification'"
        (click)="handleClose()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host {
      --color-semantic-success-base: var(--color-semantic-success-base, #10B981);
      --color-semantic-success-bg: var(--color-semantic-success-bg, #ECFDF5);
      --color-semantic-warning-base: var(--color-semantic-warning-base, #F59E0B);
      --color-semantic-warning-bg: var(--color-semantic-warning-bg, #FFFBEB);
      --color-semantic-error-base: var(--color-semantic-error-base, #EF4444);
      --color-semantic-error-bg: var(--color-semantic-error-bg, #FEF2F2);
      --color-semantic-info-base: var(--color-semantic-info-base, #3B82F6);
      --color-semantic-info-bg: var(--color-semantic-info-bg, #EFF6FF);
      
      --color-text-primary: var(--color-text-primary, #111827);
      --color-neutral-100: var(--color-neutral-100, #F3F4F6);
      
      --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      background-color: var(--color-semantic-info-bg);
      color: var(--color-semantic-info-base);
      font-size: 14px;
      line-height: 1.5;
      max-width: 400px;
      will-change: transform, opacity;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }

    .toast-message {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .toast-close {
      background: none;
      border: none;
      padding: 4px;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      color: inherit;
      opacity: 0.7;
      transition: opacity 150ms ease-out;
      flex-shrink: 0;
      border-radius: 4px;
    }

    .toast-close:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }

    .toast-close:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 1px;
    }

    /* ========================================================================
       Type Variants
       ======================================================================== */

    .toast-success {
      background-color: var(--color-semantic-success-bg);
      color: var(--color-semantic-success-base);
    }

    .toast-warning {
      background-color: var(--color-semantic-warning-bg);
      color: var(--color-semantic-warning-base);
    }

    .toast-error {
      background-color: var(--color-semantic-error-bg);
      color: var(--color-semantic-error-base);
    }

    .toast-info {
      background-color: var(--color-semantic-info-bg);
      color: var(--color-semantic-info-base);
    }

    /* ========================================================================
       Responsive Design
       ======================================================================== */

    /* Mobile (480px or less) */
    @media (max-width: 480px) {
      .toast {
        max-width: 100%;
        width: calc(100% - 16px);
        padding: 12px;
        font-size: 13px;
      }

      .toast-content {
        gap: 10px;
      }

      .toast-message {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    /* ========================================================================
       Dark Mode Support
       ======================================================================== */

    @media (prefers-color-scheme: dark) {
      .toast {
        background-color: rgba(0, 0, 0, 0.8);
        color: #F3F4F6;
        box-shadow: var(--shadow-xl);
      }

      .toast-success {
        background-color: rgba(16, 185, 129, 0.15);
        color: #86EFAC;
      }

      .toast-warning {
        background-color: rgba(245, 158, 11, 0.15);
        color: #FCD34D;
      }

      .toast-error {
        background-color: rgba(239, 68, 68, 0.15);
        color: #FCA5A5;
      }

      .toast-info {
        background-color: rgba(59, 130, 246, 0.15);
        color: #93C5FD;
      }

      .toast-close:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */

    @media (prefers-reduced-motion: reduce) {
      .toast {
        animation: none !important;
      }

      .toast-close {
        transition: none;
      }
    }
  `],
  animations: [
    /**
     * Toast Animation - Slide up + fade in
     * Duration: 300ms
     * Easing: ease-out
     */
    trigger('toastAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px)',
        }),
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)',
        })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({
          opacity: 0,
          transform: 'translateY(20px)',
        })),
      ]),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  /** Toast type (success, warning, error, info) */
  @Input() type: ToastType = 'info';

  /** Toast message text */
  @Input() message: string = '';

  /** Toast position on screen */
  @Input() position: ToastPosition = 'bottom-right';

  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  @Input() autoDismissMs: number = 4000;

  /** Event emitted when toast is closed */
  @Output() onClose = new EventEmitter<void>();

  private autoDismissTimer?: number;

  ngOnInit(): void {
    // Auto-dismiss after specified duration
    if (this.autoDismissMs > 0) {
      this.autoDismissTimer = window.setTimeout(() => {
        this.handleClose();
      }, this.autoDismissMs);
    }
  }

  ngOnDestroy(): void {
    // Clear timer on component destroy
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }
  }

  /**
   * Handle close button click
   */
  handleClose(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }
    this.onClose.emit();
  }
}
