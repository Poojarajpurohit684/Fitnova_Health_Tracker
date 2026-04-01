import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton variant types
 * - text: Single line of text
 * - heading: Heading text (larger)
 * - card: Full card placeholder
 * - avatar: Circular avatar placeholder
 * - button: Button-sized placeholder
 */
export type SkeletonVariant = 'text' | 'heading' | 'card' | 'avatar' | 'button';

/**
 * Skeleton Component
 * 
 * A reusable skeleton screen component for loading states.
 * Displays a placeholder with shimmer animation while content loads.
 * 
 * Features:
 * - 5 variants: text, heading, card, avatar, button
 * - Shimmer animation (2s infinite)
 * - Customizable width and height
 * - Design tokens: Colors and effects from design system
 * - Dark mode support via CSS custom properties
 * - Accessibility: aria-label for screen readers
 * 
 * @example
 * // Text skeleton (default)
 * <app-skeleton></app-skeleton>
 * 
 * @example
 * // Heading skeleton
 * <app-skeleton variant="heading"></app-skeleton>
 * 
 * @example
 * // Card skeleton with custom dimensions
 * <app-skeleton variant="card" width="100%" height="200px"></app-skeleton>
 * 
 * @example
 * // Avatar skeleton
 * <app-skeleton variant="avatar"></app-skeleton>
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [class]="skeletonClasses"
      [style.width]="width"
      [style.height]="height"
      [attr.aria-label]="ariaLabel"
      role="status"
      aria-busy="true"
    ></div>
  `,
  styleUrls: ['./skeleton.component.css'],
})
export class SkeletonComponent {
  /**
   * Skeleton variant (text, heading, card, avatar, button)
   * @default 'text'
   */
  @Input() variant: SkeletonVariant = 'text';

  /**
   * Custom width for the skeleton
   * @default 'auto' (variant-dependent)
   */
  @Input() width?: string;

  /**
   * Custom height for the skeleton
   * @default 'auto' (variant-dependent)
   */
  @Input() height?: string;

  /**
   * Optional aria-label for accessibility
   * @default 'Loading'
   */
  @Input() ariaLabel: string = 'Loading';

  /**
   * Computed skeleton CSS classes
   */
  get skeletonClasses(): string {
    return `skeleton-${this.variant}`;
  }
}
