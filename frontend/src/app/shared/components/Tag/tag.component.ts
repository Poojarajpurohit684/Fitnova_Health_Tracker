import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tag color variants
 * - default: Neutral gray
 * - primary: Primary brand color
 * - secondary: Secondary brand color
 * - success: Success semantic color
 * - warning: Warning semantic color
 * - error: Error semantic color
 * - info: Info semantic color
 */
export type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Tag size variants
 * - sm: Small tag (24px height)
 * - md: Medium tag (28px height)
 * - lg: Large tag (32px height)
 */
export type TagSize = 'sm' | 'md' | 'lg';

/**
 * TagComponent
 * 
 * A reusable tag component for displaying labels and categories with optional close button.
 * Supports multiple color variants, sizes, and dismissible functionality.
 * 
 * Features:
 * - 7 color variants: default, primary, secondary, success, warning, error, info
 * - 3 size variants: sm (24px), md (28px), lg (32px)
 * - Optional close button for dismissible tags
 * - Design tokens integration
 * - Dark mode support
 * - WCAG AA accessibility
 * - Keyboard support (Enter/Space to close)
 * 
 * @example
 * // Basic tag
 * <app-tag variant="primary" size="md">JavaScript</app-tag>
 * 
 * @example
 * // Dismissible tag
 * <app-tag
 *   variant="success"
 *   size="md"
 *   [closeable]="true"
 *   (onClose)="onTagClose()">
 *   Active
 * </app-tag>
 */
@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tag" [ngClass]="tagClasses" role="status">
      <span class="tag-label">
        <ng-content></ng-content>
      </span>
      <button
        *ngIf="closeable"
        type="button"
        class="tag-close"
        [attr.aria-label]="'Remove ' + (label || 'tag')"
        (click)="handleClose($event)"
        (keydown.enter)="handleClose($event)"
        (keydown.space)="handleClose($event)"
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
      --color-neutral-50: var(--color-neutral-50, #F9FAFB);
      --color-neutral-100: var(--color-neutral-100, #F3F4F6);
      --color-neutral-200: var(--color-neutral-200, #E5E7EB);
      --color-neutral-400: var(--color-neutral-400, #9CA3AF);
      --color-neutral-700: var(--color-neutral-700, #374151);
      --color-neutral-900: var(--color-neutral-900, #111827);
      
      --color-primary-base: var(--color-primary-base, #00D084);
      --color-primary-light: var(--color-primary-light, #33E0A0);
      --color-secondary-base: var(--color-secondary-base, #0066CC);
      --color-secondary-light: var(--color-secondary-light, #3385E6);
      
      --color-semantic-success-base: var(--color-semantic-success-base, #10B981);
      --color-semantic-warning-base: var(--color-semantic-warning-base, #F59E0B);
      --color-semantic-error-base: var(--color-semantic-error-base, #EF4444);
      --color-semantic-info-base: var(--color-semantic-info-base, #3B82F6);
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;
      transition: all 150ms ease-out;
      background-color: var(--color-neutral-100);
      color: var(--color-neutral-700);
      border: 1px solid var(--color-neutral-200);
    }

    .tag-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tag-close {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: inherit;
      opacity: 0.7;
      transition: opacity 150ms ease-out;
      flex-shrink: 0;
    }

    .tag-close:hover {
      opacity: 1;
    }

    .tag-close:focus-visible {
      outline: 2px solid var(--color-primary-base);
      outline-offset: 1px;
      border-radius: 2px;
    }

    /* ========================================================================
       Size Variants
       ======================================================================== */

    .tag-sm {
      padding: 4px 8px;
      font-size: 11px;
      height: 24px;
    }

    .tag-md {
      padding: 6px 12px;
      font-size: 12px;
      height: 28px;
    }

    .tag-lg {
      padding: 8px 14px;
      font-size: 13px;
      height: 32px;
    }

    /* ========================================================================
       Color Variants
       ======================================================================== */

    /* Default Variant */
    .tag-default {
      background-color: var(--color-neutral-100);
      color: var(--color-neutral-700);
      border-color: var(--color-neutral-200);
    }

    .tag-default:hover {
      background-color: var(--color-neutral-200);
      border-color: var(--color-neutral-300);
    }

    /* Primary Variant */
    .tag-primary {
      background-color: rgba(0, 208, 132, 0.1);
      color: var(--color-primary-base);
      border-color: rgba(0, 208, 132, 0.3);
    }

    .tag-primary:hover {
      background-color: rgba(0, 208, 132, 0.15);
      border-color: var(--color-primary-base);
    }

    /* Secondary Variant */
    .tag-secondary {
      background-color: rgba(0, 102, 204, 0.1);
      color: var(--color-secondary-base);
      border-color: rgba(0, 102, 204, 0.3);
    }

    .tag-secondary:hover {
      background-color: rgba(0, 102, 204, 0.15);
      border-color: var(--color-secondary-base);
    }

    /* Success Variant */
    .tag-success {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--color-semantic-success-base);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .tag-success:hover {
      background-color: rgba(16, 185, 129, 0.15);
      border-color: var(--color-semantic-success-base);
    }

    /* Warning Variant */
    .tag-warning {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--color-semantic-warning-base);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .tag-warning:hover {
      background-color: rgba(245, 158, 11, 0.15);
      border-color: var(--color-semantic-warning-base);
    }

    /* Error Variant */
    .tag-error {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--color-semantic-error-base);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .tag-error:hover {
      background-color: rgba(239, 68, 68, 0.15);
      border-color: var(--color-semantic-error-base);
    }

    /* Info Variant */
    .tag-info {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--color-semantic-info-base);
      border-color: rgba(59, 130, 246, 0.3);
    }

    .tag-info:hover {
      background-color: rgba(59, 130, 246, 0.15);
      border-color: var(--color-semantic-info-base);
    }

    /* ========================================================================
       Dark Mode Support
       ======================================================================== */

    @media (prefers-color-scheme: dark) {
      .tag-default {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--color-neutral-200);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .tag-default:hover {
        background-color: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */

    @media (prefers-reduced-motion: reduce) {
      .tag,
      .tag-close {
        transition: none;
      }
    }
  `]
})
export class TagComponent {
  /** Tag color variant */
  @Input() variant: TagVariant = 'default';

  /** Tag size variant */
  @Input() size: TagSize = 'md';

  /** Whether the tag has a close button */
  @Input() closeable: boolean = false;

  /** Optional label for accessibility */
  @Input() label?: string;

  /** Event emitted when close button is clicked */
  @Output() onClose = new EventEmitter<void>();

  /**
   * Get tag CSS classes
   */
  get tagClasses(): string {
    const classes = [
      'tag',
      `tag-${this.variant}`,
      `tag-${this.size}`,
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }

  /**
   * Handle close button click or keyboard event
   */
  handleClose(event: Event): void {
    event.stopPropagation();
    this.onClose.emit();
  }
}
