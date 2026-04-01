import { Component, Input, HostListener, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tooltip position variants
 * - top: Tooltip above trigger element
 * - bottom: Tooltip below trigger element
 * - left: Tooltip to the left of trigger element
 * - right: Tooltip to the right of trigger element
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * TooltipComponent
 * 
 * A reusable tooltip component for displaying helpful information on hover.
 * Supports multiple positioning options and arrow pointing to trigger element.
 * 
 * Features:
 * - 4 positioning options: top, bottom, left, right
 * - Show/hide on hover
 * - Arrow pointing to trigger element
 * - ARIA attributes for accessibility
 * - Design tokens integration
 * - Dark mode support
 * - WCAG AA accessibility
 * 
 * @example
 * // Basic tooltip
 * <app-tooltip text="Save your changes" position="top">
 *   <button>Save</button>
 * </app-tooltip>
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css'],
})
export class TooltipComponent {
  /** Tooltip text content */
  @Input() text: string = '';

  /** Tooltip position relative to trigger element */
  @Input() position: TooltipPosition = 'top';

  /** Whether tooltip is currently visible */
  isVisible: boolean = false;

  @ViewChild('tooltipContent') tooltipContent?: ElementRef;

  /**
   * Get tooltip CSS classes
   */
  get tooltipClasses(): string {
    const classes = [
      'tooltip',
      `tooltip-${this.position}`,
      this.isVisible && 'tooltip-visible',
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }

  /**
   * Handle mouse enter - show tooltip
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isVisible = true;
  }

  /**
   * Handle mouse leave - hide tooltip
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isVisible = false;
  }

  /**
   * Handle focus - show tooltip
   */
  @HostListener('focus')
  onFocus(): void {
    this.isVisible = true;
  }

  /**
   * Handle blur - hide tooltip
   */
  @HostListener('blur')
  onBlur(): void {
    this.isVisible = false;
  }
}
