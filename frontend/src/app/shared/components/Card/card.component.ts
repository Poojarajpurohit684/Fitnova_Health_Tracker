import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card Component - Professional Content Container
 * 
 * Provides a consistent container for content with various visual variants.
 * Supports glassmorphism, surface, and primary gradient styles.
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class.hoverable]="hoverable"
      [class.clickable]="clickable"
      [ngClass]="'variant-' + variant"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .card {
      border-radius: var(--radius-lg);
      padding: var(--padding-card);
      transition: all var(--duration-normal) var(--easing-standard);
      position: relative;
      overflow: hidden;
      border: 1px solid transparent;
    }

    /* VARIANTS */
    .variant-surface {
      background: var(--color-bg-surface);
      border-color: var(--color-border-subtle);
      box-shadow: var(--shadow-md);
    }

    .variant-glass {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: var(--glass-border);
      box-shadow: var(--shadow-lg);
    }

    .variant-primary {
      background: linear-gradient(135deg, var(--color-primary-base), var(--color-primary-dark));
      color: white;
      box-shadow: var(--shadow-lg), var(--glow-primary);
    }

    /* INTERACTIONS */
    .hoverable:hover {
      transform: translateY(-4px);
      border-color: var(--color-border-strong);
      box-shadow: var(--shadow-xl);
    }

    .variant-glass.hoverable:hover {
      background: rgba(15, 23, 42, 0.75);
      box-shadow: var(--shadow-xl), var(--glow-primary);
    }

    .clickable {
      cursor: pointer;
    }

    .clickable:active {
      transform: translateY(-1px) scale(0.985);
    }

    @media (max-width: 768px) {
      .card {
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
      }
    }
  `]
})
export class CardComponent {
  /** Whether the card should show a hover animation */
  @Input() hoverable: boolean = true;
  /** Whether the card should show a pointer cursor and active scale effect */
  @Input() clickable: boolean = false;
  /** Visual style variant of the card */
  @Input() variant: 'surface' | 'glass' | 'primary' = 'glass';
}
