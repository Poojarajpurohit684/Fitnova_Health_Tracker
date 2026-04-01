import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Logo component variants
 * - primary-mark: Logo mark alone (for favicons, app icons, small spaces)
 * - horizontal-lockup: Logo mark + "FitNova" text (for headers, hero sections)
 * - vertical-lockup: Logo mark stacked above "FitNova" text (for narrow spaces, mobile)
 */
export type LogoVariant = 'primary-mark' | 'horizontal-lockup' | 'vertical-lockup';

/**
 * Logo component sizes
 * - small: 32px (small UI elements)
 * - medium: 64px (medium UI elements)
 * - large: 128px (large UI elements)
 */
export type LogoSize = 'small' | 'medium' | 'large';

/**
 * Logo component colors
 * - primary: Primary color (#10B981 - green) with secondary accent (#3B82F6 - blue)
 * - monochrome: Black (#111827) and White (#FFFFFF)
 * - inverted: White/light version for dark backgrounds
 */
export type LogoColor = 'primary' | 'monochrome' | 'inverted';

/**
 * Logo Component
 * 
 * A reusable, accessible logo component that renders the FitNova brand mark.
 * Features a playful flame/lightning bolt with a friendly face in coral and yellow.
 * Supports multiple variants, sizes, and color schemes for different use cases.
 * 
 * Features:
 * - 3 variants: primary-mark, horizontal-lockup, vertical-lockup
 * - 3 sizes: small (32px), medium (64px), large (128px)
 * - 3 color schemes: primary (coral #FF6B6B), monochrome, inverted
 * - Light and dark mode support
 * - Full accessibility: ARIA labels, semantic HTML
 * - Responsive SVG rendering
 * 
 * @example
 * // Primary mark, medium size, primary color
 * <app-logo variant="primary-mark" size="medium" color="primary"></app-logo>
 * 
 * @example
 * // Horizontal lockup for header
 * <app-logo variant="horizontal-lockup" size="large" color="primary"></app-logo>
 * 
 * @example
 * // Vertical lockup for mobile
 * <app-logo variant="vertical-lockup" size="medium" color="inverted"></app-logo>
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="logoContainerClasses" [attr.role]="'img'" [attr.aria-label]="ariaLabel">
      <!-- Primary Mark SVG -->
      <svg
        *ngIf="variant === 'primary-mark'"
        [class]="logoSvgClasses"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Circular pulse element (outer ring) -->
        <circle cx="32" cy="32" r="28" [attr.stroke]="strokeColor" stroke-width="2" opacity="0.3"/>
        
        <!-- Circular pulse element (middle ring) -->
        <circle cx="32" cy="32" r="22" [attr.stroke]="strokeColor" stroke-width="2" opacity="0.5"/>
        
        <!-- Circular pulse element (inner ring) -->
        <circle cx="32" cy="32" r="16" [attr.stroke]="strokeColor" stroke-width="2.5"/>
        
        <!-- Upward arrow integrated within circle -->
        <g transform="translate(32, 32)">
          <!-- Arrow shaft -->
          <line x1="0" y1="8" x2="0" y2="-8" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round"/>
          
          <!-- Arrow head - left -->
          <line x1="0" y1="-8" x2="-4" y2="-2" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- Arrow head - right -->
          <line x1="0" y1="-8" x2="4" y2="-2" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>

      <!-- Horizontal Lockup SVG -->
      <svg
        *ngIf="variant === 'horizontal-lockup'"
        [class]="logoSvgClasses"
        viewBox="0 0 240 64"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Logo mark -->
        <g transform="translate(0, 0)">
          <!-- Circular pulse element (outer ring) -->
          <circle cx="32" cy="32" r="28" [attr.stroke]="strokeColor" stroke-width="2" opacity="0.3"/>
          
          <!-- Circular pulse element (middle ring) -->
          <circle cx="32" cy="32" r="22" [attr.stroke]="strokeColor" stroke-width="2" opacity="0.5"/>
          
          <!-- Circular pulse element (inner ring) -->
          <circle cx="32" cy="32" r="16" [attr.stroke]="strokeColor" stroke-width="2.5"/>
          
          <!-- Upward arrow integrated within circle -->
          <g transform="translate(32, 32)">
            <!-- Arrow shaft -->
            <line x1="0" y1="8" x2="0" y2="-8" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Arrow head - left -->
            <line x1="0" y1="-8" x2="-4" y2="-2" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Arrow head - right -->
            <line x1="0" y1="-8" x2="4" y2="-2" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </g>
        
        <!-- FitNova text -->
        <text x="76" y="42" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="32" font-weight="700" [attr.fill]="textColor" letter-spacing="-0.5">FitNova</text>
      </svg>

      <!-- Vertical Lockup SVG -->
      <svg
        *ngIf="variant === 'vertical-lockup'"
        [class]="logoSvgClasses"
        viewBox="0 0 80 140"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Logo mark -->
        <g transform="translate(8, 0)">
          <!-- Circular pulse element (outer ring) -->
          <circle cx="32" cy="32" r="28" [attr.stroke]="strokeColor" stroke-width="2" opacity="0.3"/>
          
          <!-- Circular pulse element (middle ring) -->
          <circle cx="32" cy="32" r="22" [attr.stroke]="strokeColor" stroke-width="2" opacity="0.5"/>
          
          <!-- Circular pulse element (inner ring) -->
          <circle cx="32" cy="32" r="16" [attr.stroke]="strokeColor" stroke-width="2.5"/>
          
          <!-- Upward arrow integrated within circle -->
          <g transform="translate(32, 32)">
            <!-- Arrow shaft -->
            <line x1="0" y1="8" x2="0" y2="-8" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round"/>
            
            <!-- Arrow head - left -->
            <line x1="0" y1="-8" x2="-4" y2="-2" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Arrow head - right -->
            <line x1="0" y1="-8" x2="4" y2="-2" [attr.stroke]="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </g>
        
        <!-- FitNova text -->
        <text x="40" y="125" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="20" font-weight="700" [attr.fill]="textColor" letter-spacing="-0.5" text-anchor="middle">FitNova</text>
      </svg>
    </div>
  `,
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent {
  /**
   * Logo variant (primary-mark, horizontal-lockup, vertical-lockup)
   * @default 'primary-mark'
   */
  @Input() variant: LogoVariant = 'primary-mark';

  /**
   * Logo size (small, medium, large)
   * @default 'medium'
   */
  @Input() size: LogoSize = 'medium';

  /**
   * Logo color scheme (primary, monochrome, inverted)
   * @default 'primary'
   */
  @Input() color: LogoColor = 'primary';

  /**
   * Optional custom aria-label for accessibility
   */
  @Input() ariaLabel: string = 'FitNova logo';

  /**
   * Get the size in pixels based on the size prop
   */
  get sizeInPixels(): number {
    switch (this.size) {
      case 'small':
        return 32;
      case 'medium':
        return 64;
      case 'large':
        return 128;
      default:
        return 64;
    }
  }

  /**
   * Get the stroke color based on the color scheme
   */
  get strokeColor(): string {
    switch (this.color) {
      case 'primary':
        return '#10B981';
      case 'monochrome':
        return '#111827';
      case 'inverted':
        return '#FFFFFF';
      default:
        return '#10B981';
    }
  }

  /**
   * Get the text color based on the color scheme
   */
  get textColor(): string {
    switch (this.color) {
      case 'primary':
        return '#10B981';
      case 'monochrome':
        return '#111827';
      case 'inverted':
        return '#FFFFFF';
      default:
        return '#10B981';
    }
  }

  /**
   * Computed logo container CSS classes
   */
  get logoContainerClasses(): string {
    return [
      'logo-container',
      `logo-${this.variant}`,
      `logo-${this.size}`,
      `logo-${this.color}`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Computed SVG CSS classes
   */
  get logoSvgClasses(): string {
    return 'logo-svg';
  }
}
