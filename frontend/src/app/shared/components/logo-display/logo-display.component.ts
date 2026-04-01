import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LogoDisplayComponent - Reusable Logo Component
 * 
 * Displays the FitNova logo exactly as shown on signup page
 * Used across all pages for consistency
 */
@Component({
  selector: 'app-logo-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-section" [ngClass]="'logo-' + size">
      <div class="logo-icon">
        <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L28 8V16C28 24 16 30 16 30S4 24 4 16V8L16 2Z" fill="currentColor" opacity="0.8"/>
          <path d="M16 8V22M12 14H20" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="logo-text">FitNova</h1>
    </div>
  `,
  styles: [`
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .logo-small {
      gap: 8px;
    }

    .logo-medium {
      gap: 12px;
    }

    .logo-large {
      gap: 16px;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #10B981, #3B82F6);
      border-radius: 10px;
      color: white;
      flex-shrink: 0;
    }

    .logo-icon svg {
      color: white;
      filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.15));
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #10B981, #3B82F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      margin: 0;
      line-height: 1.2;
    }

    .logo-small .logo-text {
      font-size: 1.125rem;
    }

    .logo-medium .logo-text {
      font-size: 1.5rem;
    }

    .logo-large .logo-text {
      font-size: 1.875rem;
    }
  `]
})
export class LogoDisplayComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get iconSize(): number {
    switch (this.size) {
      case 'small':
        return 32;
      case 'large':
        return 48;
      default:
        return 40;
    }
  }
}
