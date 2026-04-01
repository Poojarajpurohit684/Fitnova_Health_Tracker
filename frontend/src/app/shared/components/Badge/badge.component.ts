import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Badge color variants
 * - primary: Primary brand color
 * - secondary: Secondary brand color
 * - accent: Accent color
 * - success: Success semantic color
 * - warning: Warning semantic color
 * - error: Error semantic color
 * - info: Info semantic color
 */
export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

/**
 * Badge size variants
 * - sm: Small badge (20px height)
 * - md: Medium badge (24px height)
 * - lg: Large badge (28px height)
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * BadgeComponent
 * 
 * A reusable badge component for displaying labels, tags, and status indicators.
 * Supports multiple color variants, sizes, and optional close button.
 * 
 * Features:
 * - 7 color variants: primary, secondary, accent, success, warning, error, info
 * - 3 size variants: sm (20px), md (24px), lg (28px)
 * - Optional close button for dismissible badges
 * - Design tokens integration
 * - Dark mode support
 * - WCAG AA accessibility
 * 
 * @example
 * // Basic badge
 * <app-badge variant="primary" size="md">New</app-badge>
 * 
 * @example
 * // Dismissible badge
 * <app-badge
 *   variant="success"
 *   size="md"
 *   [closeable]="true"
 *   (onClose)="onBadgeClose()">
 *   Completed
 * </app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
})
export class BadgeComponent {
  /** Badge color variant */
  @Input() variant: BadgeVariant = 'primary';

  /** Badge size variant */
  @Input() size: BadgeSize = 'md';

  /** Whether the badge has a close button */
  @Input() closeable: boolean = false;

  /** Event emitted when close button is clicked */
  @Output() onClose = new EventEmitter<void>();

  /**
   * Get badge CSS classes
   */
  get badgeClasses(): string {
    const classes = [
      'badge',
      `badge-${this.variant}`,
      `badge-${this.size}`,
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }

  /**
   * Handle close button click
   */
  handleClose(event: MouseEvent): void {
    event.stopPropagation();
    this.onClose.emit();
  }
}
