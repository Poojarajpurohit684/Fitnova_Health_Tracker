import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../services/modal.service';
import { trigger, transition, style, animate } from '@angular/animations';

/**
 * Modal Component
 * 
 * A reusable modal component with entrance/exit animations, backdrop overlay,
 * and accessibility features. Uses Angular animations API for smooth transitions.
 * 
 * Features:
 * - Backdrop with semi-transparent overlay (rgba(0, 0, 0, 0.5))
 * - Modal styling with design tokens (padding, border-radius, shadow)
 * - Entrance animation: slideIn (300ms ease-out)
 * - Exit animation: fadeOut (300ms ease-in)
 * - Close button with proper positioning (top 16px, right 16px)
 * - ARIA labels and semantic HTML for accessibility
 * - Support for modal types (success, error, warning, info)
 * - Action buttons with multiple variants
 * 
 * Design Tokens Used:
 * - Colors: --color-bg-primary, --color-text-primary, --color-border, semantic colors
 * - Spacing: --component-modal-padding, --spacing-lg, --spacing-md
 * - Effects: --shadow-xl, --radius-lg, --duration-standard-lg, --easing-entrance, --easing-exit
 * 
 * Accessibility:
 * - ARIA labels on close button
 * - Semantic HTML structure (header, body, footer)
 * - Focus management with close button
 * - Keyboard support (Escape key to close)
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="modal$ | async as modal" 
      class="modal-backdrop" 
      [@backdropAnimation]
      (click)="onBackdropClick()"
      role="presentation"
      aria-hidden="false"
    >
      <div 
        class="modal-container" 
        [ngClass]="'modal-' + modal.type"
        [@modalAnimation]
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="'modal-title-' + modal.type"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h2 class="modal-title" [id]="'modal-title-' + modal.type">{{ modal.title }}</h2>
          <button 
            class="modal-close" 
            (click)="close()"
            aria-label="Close modal"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-message">{{ modal.message }}</p>
        </div>
        <div *ngIf="modal.actions && modal.actions.length > 0" class="modal-footer">
          <button
            *ngFor="let action of modal.actions"
            class="modal-action"
            [ngClass]="'action-' + (action.type || 'primary')"
            (click)="executeAction(action)"
            type="button"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================================================
       Modal Backdrop - Fixed overlay with semi-transparent background
       ======================================================================== */
    
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    /* ========================================================================
       Modal Container - Main modal element with animations
       ======================================================================== */
    
    .modal-container {
      background-color: var(--color-bg-surface);
      border-radius: 20px;
      padding: var(--component-modal-padding);
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      border: 1px solid var(--color-border-strong);
      overflow: hidden;
      will-change: transform, opacity;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    /* ========================================================================
       Modal Header - Title and close button
       ======================================================================== */
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0 var(--spacing-lg) 0;
      border-bottom: 1px solid var(--color-border-subtle);
      margin-bottom: var(--spacing-lg);
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-main);
      margin: 0;
      flex: 1;
    }

    /* ========================================================================
       Modal Close Button - Positioned at top right
       ======================================================================== */
    
    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      transition: all var(--duration-fast) var(--easing-smooth);
      flex-shrink: 0;
      margin-left: var(--spacing-lg);
    }

    .modal-close:hover {
      background-color: var(--color-border-subtle);
      color: var(--color-text-main);
    }

    .modal-close:focus-visible {
      outline: 2px solid var(--color-primary-base);
      outline-offset: 2px;
    }

    /* ========================================================================
       Modal Body - Main content area
       ======================================================================== */
    
    .modal-body {
      padding: 0 0 var(--spacing-lg) 0;
    }

    .modal-message {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 1rem;
      line-height: 1.6;
    }

    /* ========================================================================
       Modal Footer - Action buttons
       ======================================================================== */
    
    .modal-footer {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg) 0 0 0;
      border-top: 1px solid var(--color-border-subtle);
      justify-content: flex-end;
    }

    .modal-action {
      padding: 10px 20px;
      border-radius: var(--radius-md);
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      min-height: 44px;
    }

    .modal-action:focus-visible {
      outline: 2px solid var(--color-primary-base);
      outline-offset: 2px;
    }

    /* Primary Action Button */
    .action-primary {
      background-color: var(--color-primary-base);
      color: #FFFFFF;
    }

    .action-primary:hover {
      background-color: var(--color-primary-light);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    /* Secondary Action Button - FIXED READABILITY */
    .action-secondary {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--color-text-main);
      border: 1px solid var(--color-border-strong);
    }

    .action-secondary:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: var(--color-border-active);
    }

    .action-secondary:active {
      background-color: rgba(255, 255, 255, 0.15);
    }

    /* Danger Action Button */
    .action-danger {
      background-color: var(--color-error);
      color: #FFFFFF;
    }

    .action-danger:hover {
      background-color: #ff5a5a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    /* ========================================================================
       Modal Type Styles - Success, Error, Warning, Info
       ======================================================================== */
    
    .modal-success .modal-header {
      border-bottom-color: var(--color-semantic-success-base);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent);
      padding: var(--spacing-lg) 0 var(--spacing-lg) 0;
      margin: calc(-1 * var(--component-modal-padding)) calc(-1 * var(--component-modal-padding)) var(--spacing-lg) calc(-1 * var(--component-modal-padding));
      padding: var(--spacing-lg) var(--component-modal-padding);
    }

    .modal-success .modal-title {
      color: var(--color-semantic-success-base);
    }

    .modal-error .modal-header {
      border-bottom-color: var(--color-semantic-error-base);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent);
      padding: var(--spacing-lg) 0 var(--spacing-lg) 0;
      margin: calc(-1 * var(--component-modal-padding)) calc(-1 * var(--component-modal-padding)) var(--spacing-lg) calc(-1 * var(--component-modal-padding));
      padding: var(--spacing-lg) var(--component-modal-padding);
    }

    .modal-error .modal-title {
      color: var(--color-semantic-error-base);
    }

    .modal-warning .modal-header {
      border-bottom-color: var(--color-semantic-warning-base);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent);
      padding: var(--spacing-lg) 0 var(--spacing-lg) 0;
      margin: calc(-1 * var(--component-modal-padding)) calc(-1 * var(--component-modal-padding)) var(--spacing-lg) calc(-1 * var(--component-modal-padding));
      padding: var(--spacing-lg) var(--component-modal-padding);
    }

    .modal-warning .modal-title {
      color: var(--color-semantic-warning-base);
    }

    .modal-info .modal-header {
      border-bottom-color: var(--color-semantic-info-base);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent);
      padding: var(--spacing-lg) 0 var(--spacing-lg) 0;
      margin: calc(-1 * var(--component-modal-padding)) calc(-1 * var(--component-modal-padding)) var(--spacing-lg) calc(-1 * var(--component-modal-padding));
      padding: var(--spacing-lg) var(--component-modal-padding);
    }

    .modal-info .modal-title {
      color: var(--color-semantic-info-base);
    }

    /* ========================================================================
       Responsive Design - Adjust modal sizing for different breakpoints
       ======================================================================== */
    
    /* Tablet (769-1024px) */
    @media (max-width: 1024px) {
      .modal-container {
        max-width: 400px;
        padding: var(--spacing-xl);
      }
    }

    /* Mobile (481-768px) */
    @media (max-width: 768px) {
      .modal-container {
        width: 90%;
        max-width: 100%;
        padding: var(--spacing-xl);
      }
    }

    /* Small Mobile (480px or less) */
    @media (max-width: 480px) {
      .modal-container {
        width: 95%;
        max-width: 100%;
        padding: var(--spacing-lg);
      }

      .modal-header {
        padding: 0 0 var(--spacing-md) 0;
        margin-bottom: var(--spacing-md);
      }

      .modal-body {
        padding: 0 0 var(--spacing-md) 0;
      }

      .modal-footer {
        gap: var(--spacing-md);
        padding: var(--spacing-md) 0 0 0;
      }

      .modal-title {
        font-size: 1.125rem;
      }

      .modal-close {
        width: 40px;
        height: 40px;
      }
    }

    /* ========================================================================
       Reduced Motion Support - Respect user preferences
       ======================================================================== */
    
    @media (prefers-reduced-motion: reduce) {
      .modal-backdrop,
      .modal-container {
        animation: none !important;
      }

      .modal-close,
      .modal-action {
        transition: none !important;
      }
    }
  `],
  animations: [
    /**
     * Backdrop Animation - Fade in/out
     * Duration: 300ms
     * Easing: ease-in-out
     */
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    /**
     * Modal Animation - Slide up from bottom with fade
     * Duration: 300ms
     * Easing: ease-out for entrance, ease-in for exit
     */
    // trigger('modalAnimation', [
    //   transition(':enter', [
    //     style({ 
    //       opacity: 0, 
    //       transform: 'translateY(20px)' 
    //     }),
    //     animate('var(--duration-standard-lg) var(--easing-entrance)', style({ 
    //       opacity: 1, 
    //       transform: 'translateY(0)' 
    //     })),
    //   ]),
    //   transition(':leave', [
    //     animate('var(--duration-standard-lg) var(--easing-exit)', style({ 
    //       opacity: 0, 
    //       transform: 'translateY(20px)' 
    //     })),
    //   ]),
    // ]),
    trigger('modalAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(20px)'
    }),
    animate('300ms ease-out', style({
      opacity: 1,
      transform: 'translateY(0)'
    })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({
      opacity: 0,
      transform: 'translateY(20px)'
    })),
  ]),
]),
  ],
})
export class ModalComponent implements OnInit, OnDestroy {
  modal$ = this.modalService.modal$;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    // Listen for Escape key to close modal
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  /**
   * Close the modal
   */
  close(): void {
    this.modalService.close();
  }

  /**
   * Handle backdrop click to close modal
   */
  onBackdropClick(): void {
    this.close();
  }

  /**
   * Handle Escape key press to close modal
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  /**
   * Execute action and close modal
   */
  executeAction(action: any): void {
    action.callback();
    this.close();
  }
}
