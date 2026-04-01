import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Grid Layout Component - Responsive Grid Container
 * 
 * Provides responsive grid layouts with:
 * - Automatic column adjustment based on breakpoints
 * - Consistent gap spacing
 * - Professional alignment
 * - Dark mode support
 * 
 * Usage:
 * <app-grid-layout [columns]="4" [gap]="'lg'">
 *   <app-card>Item 1</app-card>
 *   <app-card>Item 2</app-card>
 * </app-grid-layout>
 */
@Component({
  selector: 'app-grid-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-layout" [class]="'grid-' + columns + '-col'" [class]="'gap-' + gap">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      --spacing-md: 0.75rem;
      --spacing-lg: 1rem;
      --spacing-xl: 1.5rem;
    }

    .grid-layout {
      display: grid;
      width: 100%;
      animation: gridFadeIn 300ms ease-out;
    }

    /* Grid column configurations */
    .grid-1-col {
      grid-template-columns: 1fr;
    }

    .grid-2-col {
      grid-template-columns: repeat(2, 1fr);
    }

    .grid-3-col {
      grid-template-columns: repeat(3, 1fr);
    }

    .grid-4-col {
      grid-template-columns: repeat(4, 1fr);
    }

    /* Gap configurations */
    .gap-sm {
      gap: var(--spacing-md);
    }

    .gap-md {
      gap: var(--spacing-lg);
    }

    .gap-lg {
      gap: var(--spacing-xl);
    }

    @keyframes gridFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* ========================================================================
       Tablet Layout (769-1024px)
       ======================================================================== */
    @media (max-width: 1024px) {
      .grid-4-col {
        grid-template-columns: repeat(2, 1fr);
      }

      .grid-3-col {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* ========================================================================
       Mobile Layout (481-768px)
       ======================================================================== */
    @media (max-width: 768px) {
      .grid-4-col,
      .grid-3-col,
      .grid-2-col {
        grid-template-columns: 1fr;
      }

      .gap-lg {
        gap: var(--spacing-lg);
      }
    }

    /* ========================================================================
       Small Mobile Layout (480px-)
       ======================================================================== */
    @media (max-width: 480px) {
      .gap-md,
      .gap-lg {
        gap: var(--spacing-md);
      }
    }

    /* ========================================================================
       Reduced Motion Support
       ======================================================================== */
    @media (prefers-reduced-motion: reduce) {
      .grid-layout {
        animation: none;
      }
    }
  `]
})
export class GridLayoutComponent {
  @Input() columns: number = 4;
  @Input() gap: 'sm' | 'md' | 'lg' = 'md';
}
