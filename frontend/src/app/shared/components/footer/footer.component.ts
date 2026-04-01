import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogoDisplayComponent } from '../logo-display/logo-display.component';

/**
 * Footer Component - Professional Application Footer
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LogoDisplayComponent],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-content grid grid-cols-4">
          <!-- Brand Section -->
          <div class="footer-section">
            <div class="footer-logo">
              <app-logo-display size="medium"></app-logo-display>
            </div>
            <p class="text-sm text-muted" style="margin-top: 1rem; line-height: 1.6;">
              Elevate your performance with our advanced tracking ecosystem. Designed for the modern athlete.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h4 class="text-xs font-bold uppercase tracking-widest text-main" style="margin-bottom: 1.25rem;">Legal</h4>
            <ul class="footer-links">
              <li><a (click)="navigateTo('/privacy')">Privacy Policy</a></li>
              <li><a (click)="navigateTo('/terms')">Terms of Service</a></li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="footer-section">
            <h4 class="text-xs font-bold uppercase tracking-widest text-main" style="margin-bottom: 1.25rem;">Resources</h4>
            <ul class="footer-links">
              <li><a (click)="navigateTo('/support')">Support Center</a></li>
              <li><a (click)="navigateTo('/contact')">Contact Us</a></li>
            </ul>
          </div>

          <!-- Contact Section -->
          <div class="footer-section">
            <h4 class="text-xs font-bold uppercase tracking-widest text-main" style="margin-bottom: 1.25rem;">Stay Connected</h4>
            <div class="footer-social flex-row gap-md">
              <a href="#" class="social-icon"><span class="material-icons">facebook</span></a>
              <a href="#" class="social-icon"><span class="material-icons">alternate_email</span></a>
              <a href="#" class="social-icon"><span class="material-icons">share</span></a>
            </div>
          </div>
        </div>

        <div class="footer-bottom flex-row justify-between flex-stack gap-md">
          <p class="text-xs text-dim">&copy; 2026 FitNova Pro. All rights reserved.</p>
          <div class="flex-row gap-md text-xs text-dim">
            <span>v1.2.0</span>
            <span>Made with precision</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-bg-surface);
      border-top: 1px solid var(--color-border-subtle);
      padding: var(--spacing-3xl) 0 var(--spacing-xl);
      margin-top: var(--spacing-4xl);
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .footer-links a {
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: var(--typography-body-sm-size);
      transition: color var(--duration-fast);
      cursor: pointer;
    }

    .footer-links a:hover {
      color: var(--color-primary-light);
    }

    .social-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      transition: all var(--duration-normal);
    }

    .social-icon:hover {
      background: rgba(99, 102, 241, 0.1);
      color: var(--color-primary-light);
      transform: translateY(-2px);
    }

    .footer-bottom {
      margin-top: var(--spacing-3xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--color-border-subtle);
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-xl);
      }
    }
  `]
})
export class FooterComponent {
  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
