import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Button component variants
 * - primary: Primary color background, white text (main actions)
 * - secondary: Secondary color background, white text (alternative actions)
 * - tertiary: Transparent background, primary color text and border (less important actions)
 * - destructive: Error color background, white text (destructive actions)
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'glass';

/**
 * Button component sizes
 * - small: 32px height (small buttons)
 * - medium: 40px height (default, standard)
 * - large: 48px height (large, prominent buttons)
 */
export type ButtonSize = 'small' | 'medium' | 'large' | 'sm';

/**
 * Button Component
 * 
 * A reusable, accessible button component with multiple variants and sizes.
 * Supports all button states (default, hover, active, disabled, loading) and icon combinations.
 * 
 * Features:
 * - 4 variants: primary, secondary, tertiary, destructive
 * - 3 sizes: small (32px), medium (40px), large (48px)
 * - All states: default, hover, active, disabled, loading
 * - Icon support: before and after text
 * - Full accessibility: ARIA labels, focus indicators, keyboard support
 * - Design tokens: All colors, spacing, and effects from design system
 * 
 * @example
 * // Primary button
 * <app-button variant="primary" size="medium">Click me</app-button>
 * 
 * @example
 * // Secondary button with icon
 * <app-button variant="secondary" size="large" [iconBefore]="saveIcon">
 *   Save
 * </app-button>
 * 
 * @example
 * // Destructive button, disabled
 * <app-button variant="destructive" [disabled]="true">Delete</app-button>
 * 
 * @example
 * // Loading button
 * <app-button [loading]="isLoading">Save Changes</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
      (click)="onClick.emit($event)"
      [type]="type"
    >
      <!-- Icon before text -->
      <span *ngIf="iconBefore" class="btn-icon btn-icon-before">
        <ng-container *ngTemplateOutlet="iconBefore"></ng-container>
      </span>

      <!-- Button text content -->
      <span class="btn-content">
        <ng-content></ng-content>
      </span>

      <!-- Icon after text -->
      <span *ngIf="iconAfter" class="btn-icon btn-icon-after">
        <ng-container *ngTemplateOutlet="iconAfter"></ng-container>
      </span>
    </button>
  `,
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  /**
   * Button variant (primary, secondary, tertiary, destructive)
   * @default 'primary'
   */
  @Input() variant: ButtonVariant = 'primary';

  /**
   * Button size (small, medium, large)
   * @default 'medium'
   */
  @Input() size: ButtonSize = 'medium';

  /**
   * Button type (button, submit, reset)
   * @default 'button'
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Whether the button is disabled
   * @default false
   */
  @Input() disabled: boolean = false;

  /**
   * Whether the button is in loading state
   * @default false
   */
  @Input() loading: boolean = false;

  /**
   * Optional template for icon to display before text
   */
  @Input() iconBefore: any = null;

  /**
   * Optional template for icon to display after text
   */
  @Input() iconAfter: any = null;

  /**
   * Optional aria-label for accessibility
   */
  @Input() ariaLabel: string | null = null;

  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  @Input() fullWidth: boolean = false;

  /**
   * Event emitted when button is clicked
   */
  @Output() onClick = new EventEmitter<MouseEvent>();

  /**
   * Computed button CSS classes
   */
  get buttonClasses(): string {
    const classes = [
      'btn',
      `btn-${this.variant}`,
      `btn-${this.size}`,
      (this.disabled || this.loading) && 'btn-disabled',
      this.loading && 'btn-loading',
      this.fullWidth && 'btn-full-width',
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }
}
