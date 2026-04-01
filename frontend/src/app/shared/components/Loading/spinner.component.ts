import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Spinner size variants
 * - sm: 24px (small spinners)
 * - md: 40px (default, standard spinners)
 * - lg: 56px (large, prominent spinners)
 */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner Component
 * 
 * A reusable loading spinner component with continuous rotation animation.
 * Displays a circular loading indicator with a rotating border.
 * 
 * Features:
 * - 3 sizes: sm (24px), md (40px), lg (56px)
 * - Continuous rotation animation (1s, linear)
 * - Design tokens: Colors and effects from design system
 * - Accessibility: aria-label for screen readers
 * - Dark mode support via CSS custom properties
 * 
 * @example
 * // Default spinner (medium size)
 * <app-spinner></app-spinner>
 * 
 * @example
 * // Large spinner with custom label
 * <app-spinner size="lg" ariaLabel="Loading data..."></app-spinner>
 * 
 * @example
 * // Small spinner
 * <app-spinner size="sm"></app-spinner>
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="spinner"
      [class]="spinnerClasses"
      [attr.aria-label]="ariaLabel"
      role="status"
    ></div>
  `,
  styleUrls: ['./spinner.component.css'],
})
export class SpinnerComponent {
  /**
   * Spinner size (sm, md, lg)
   * @default 'md'
   */
  @Input() size: SpinnerSize = 'md';

  /**
   * Optional aria-label for accessibility
   * @default 'Loading'
   */
  @Input() ariaLabel: string = 'Loading';

  /**
   * Computed spinner CSS classes
   */
  get spinnerClasses(): string {
    return `spinner-${this.size}`;
  }
}
