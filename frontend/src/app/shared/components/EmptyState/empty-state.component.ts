import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../Button/button.component';

/**
 * EmptyStateComponent
 * 
 * A reusable empty state component for displaying when no content is available.
 * Displays an illustration, message, description, and call-to-action button.
 * 
 * Features:
 * - Responsive illustration sizing (200px desktop, 160px tablet, 120px mobile)
 * - Message and description text
 * - Call-to-action button
 * - Proper spacing and alignment
 * - Design tokens integration
 * - Dark mode support
 * - WCAG AA accessibility
 * 
 * @example
 * // Basic empty state
 * <app-empty-state
 *   illustration="assets/empty-box.svg"
 *   message="No workouts yet"
 *   description="Start tracking your fitness journey today"
 *   ctaText="Create Workout"
 *   (ctaClick)="onCreateWorkout()">
 * </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  /** URL or path to the illustration image */
  @Input() illustration: string = '';

  /** Alt text for the illustration */
  @Input() illustrationAlt: string = 'Empty state illustration';

  /** Main message text */
  @Input() message: string = '';

  /** Description text below the message */
  @Input() description: string = '';

  /** Call-to-action button text */
  @Input() ctaText: string = 'Get Started';

  /** Whether the CTA button is disabled */
  @Input() ctaDisabled: boolean = false;

  /** Event emitted when CTA button is clicked */
  @Output() ctaClick = new EventEmitter<void>();

  /**
   * Handle CTA button click
   */
  onCtaClick(): void {
    this.ctaClick.emit();
  }
}
