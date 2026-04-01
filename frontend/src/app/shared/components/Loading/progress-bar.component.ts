import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Progress bar size variants
 * - sm: 2px (small progress bars)
 * - md: 4px (default, standard progress bars)
 * - lg: 8px (large, prominent progress bars)
 */
export type ProgressBarSize = 'sm' | 'md' | 'lg';

/**
 * Progress bar animation modes
 * - determinate: Shows specific progress percentage (0-100)
 * - indeterminate: Continuous animation (unknown progress)
 */
export type ProgressBarMode = 'determinate' | 'indeterminate';

/**
 * ProgressBar Component
 * 
 * A reusable progress bar component for displaying loading progress.
 * Supports both determinate (with percentage) and indeterminate (continuous) modes.
 * 
 * Features:
 * - 3 sizes: sm (2px), md (4px), lg (8px)
 * - 2 modes: determinate (with %), indeterminate (continuous)
 * - Smooth fill animation
 * - Design tokens: Colors and effects from design system
 * - Dark mode support via CSS custom properties
 * - Accessibility: aria-label and aria-valuenow for screen readers
 * 
 * @example
 * // Indeterminate progress bar (default)
 * <app-progress-bar></app-progress-bar>
 * 
 * @example
 * // Determinate progress bar at 65%
 * <app-progress-bar mode="determinate" [value]="65"></app-progress-bar>
 * 
 * @example
 * // Large progress bar
 * <app-progress-bar size="lg" mode="determinate" [value]="45"></app-progress-bar>
 */
@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="progress-bar"
      [class]="progressBarClasses"
      [attr.aria-label]="ariaLabel"
      [attr.aria-valuenow]="mode === 'determinate' ? value : null"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="100"
      role="progressbar"
    >
      <div
        class="progress-bar-fill"
        [style.width]="mode === 'determinate' ? value + '%' : '100%'"
      ></div>
    </div>
  `,
  styleUrls: ['./progress-bar.component.css'],
})
export class ProgressBarComponent {
  /**
   * Progress bar size (sm, md, lg)
   * @default 'md'
   */
  @Input() size: ProgressBarSize = 'md';

  /**
   * Progress bar mode (determinate, indeterminate)
   * @default 'indeterminate'
   */
  @Input() mode: ProgressBarMode = 'indeterminate';

  /**
   * Progress value (0-100) for determinate mode
   * @default 0
   */
  @Input() value: number = 0;

  /**
   * Optional aria-label for accessibility
   * @default 'Loading'
   */
  @Input() ariaLabel: string = 'Loading';

  /**
   * Computed progress bar CSS classes
   */
  get progressBarClasses(): string {
    const classes = [
      `progress-bar-${this.size}`,
      `progress-bar-${this.mode}`,
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }
}
