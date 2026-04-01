import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card Component
 * 
 * A reusable card component with hover effects and responsive behavior.
 * Supports flexible content through ng-content projection.
 * 
 * Features:
 * - Base styling with padding, border-radius, shadow, and border
 * - Hover effects with shadow elevation and transform
 * - Responsive padding adjustments across breakpoints
 * - Design token integration for all styling
 * 
 * Usage:
 * <app-card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [ngClass]="{ 'card-interactive': interactive }">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .card {
      /* Base Styling */
      padding: var(--component-card-padding);
      border-radius: var(--radius-lg);
      background-color: var(--color-bg-primary);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      
      /* Transition for smooth hover effects */
      transition: all var(--duration-standard) var(--easing-smooth);
      
      /* GPU acceleration for better performance */
      will-change: transform, box-shadow;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    /* Hover Effects - Only apply when interactive */
    .card-interactive:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    /* Responsive Padding Adjustments */
    
    /* Tablet (769-1024px) */
    @media (max-width: 1024px) {
      .card {
        padding: 1.125rem; /* 18px */
      }
    }

    /* Mobile (481-768px) */
    @media (max-width: 768px) {
      .card {
        padding: 1rem; /* 16px */
      }
    }

    /* Small Mobile (480px or less) */
    @media (max-width: 480px) {
      .card {
        padding: 0.75rem; /* 12px */
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .card {
        transition: none;
      }

      .card-interactive:hover {
        transform: none;
      }
    }
  `],
})
export class CardComponent {
  /**
   * Whether the card should have interactive hover effects
   * Set to true for clickable cards or cards with interactive content
   * Set to false for static content cards
   */
  @Input() interactive: boolean = false;
}
