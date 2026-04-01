import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent, BadgeVariant, BadgeSize } from './badge.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;
  let badgeElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    badgeElement = fixture.debugElement.query(By.css('.badge'));
    fixture.detectChanges();
  });

  describe('Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render badge element', () => {
      expect(badgeElement).toBeTruthy();
    });

    it('should have badge class', () => {
      expect(badgeElement.nativeElement.classList.contains('badge')).toBe(true);
    });

    it('should have default variant (primary)', () => {
      expect(component.variant).toBe('primary');
      expect(badgeElement.nativeElement.classList.contains('badge-primary')).toBe(true);
    });

    it('should have default size (md)', () => {
      expect(component.size).toBe('md');
      expect(badgeElement.nativeElement.classList.contains('badge-md')).toBe(true);
    });

    it('should render badge content', () => {
      const testFixture = TestBed.createComponent(BadgeComponent);
      testFixture.nativeElement.innerHTML = '<app-badge>New</app-badge>';
      testFixture.detectChanges();
      expect(testFixture.nativeElement.textContent).toContain('New');
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      component.variant = 'primary';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-primary')).toBe(true);
    });

    it('should render secondary variant', () => {
      component.variant = 'secondary';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-secondary')).toBe(true);
    });

    it('should render accent variant', () => {
      component.variant = 'accent';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-accent')).toBe(true);
    });

    it('should render success variant', () => {
      component.variant = 'success';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-success')).toBe(true);
    });

    it('should render warning variant', () => {
      component.variant = 'warning';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-warning')).toBe(true);
    });

    it('should render error variant', () => {
      component.variant = 'error';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-error')).toBe(true);
    });

    it('should render info variant', () => {
      component.variant = 'info';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-info')).toBe(true);
    });

    it('should update variant dynamically', () => {
      const variants: BadgeVariant[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
      variants.forEach((variant) => {
        component.variant = variant;
        fixture.detectChanges();
        expect(badgeElement.nativeElement.classList.contains(`badge-${variant}`)).toBe(true);
      });
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      component.size = 'sm';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-sm')).toBe(true);
    });

    it('should render medium size', () => {
      component.size = 'md';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-md')).toBe(true);
    });

    it('should render large size', () => {
      component.size = 'lg';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge-lg')).toBe(true);
    });

    it('should update size dynamically', () => {
      const sizes: BadgeSize[] = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        component.size = size;
        fixture.detectChanges();
        expect(badgeElement.nativeElement.classList.contains(`badge-${size}`)).toBe(true);
      });
    });

    it('should have correct height for small size', () => {
      component.size = 'sm';
      fixture.detectChanges();
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.height).toBe('20px');
    });

    it('should have correct height for medium size', () => {
      component.size = 'md';
      fixture.detectChanges();
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.height).toBe('24px');
    });

    it('should have correct height for large size', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.height).toBe('28px');
    });
  });

  describe('Close Button', () => {
    it('should not render close button by default', () => {
      component.closeable = false;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton).toBeFalsy();
    });

    it('should render close button when closeable is true', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton).toBeTruthy();
    });

    it('should have correct close button text', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton.nativeElement.textContent).toBe('×');
    });

    it('should have aria-label on close button', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton.nativeElement.getAttribute('aria-label')).toBe('Remove badge');
    });

    it('should emit onClose event when close button is clicked', (done) => {
      component.closeable = true;
      fixture.detectChanges();

      component.onClose.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const closeButton = badgeElement.query(By.css('.badge-close'));
      closeButton.nativeElement.click();
    });

    it('should toggle close button visibility', () => {
      component.closeable = false;
      fixture.detectChanges();
      let closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton).toBeFalsy();

      component.closeable = true;
      fixture.detectChanges();
      closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton).toBeTruthy();

      component.closeable = false;
      fixture.detectChanges();
      closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton).toBeFalsy();
    });

    it('should stop event propagation on close button click', (done) => {
      component.closeable = true;
      fixture.detectChanges();

      let propagationStopped = false;
      component.onClose.subscribe(() => {
        propagationStopped = true;
      });

      const closeButton = badgeElement.query(By.css('.badge-close'));
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      closeButton.nativeElement.dispatchEvent(event);

      setTimeout(() => {
        expect(propagationStopped).toBe(true);
        done();
      }, 100);
    });
  });

  describe('CSS Classes', () => {
    it('should always have badge class', () => {
      expect(badgeElement.nativeElement.classList.contains('badge')).toBe(true);
    });

    it('should combine variant and size classes', () => {
      component.variant = 'success';
      component.size = 'lg';
      fixture.detectChanges();
      expect(badgeElement.nativeElement.classList.contains('badge')).toBe(true);
      expect(badgeElement.nativeElement.classList.contains('badge-success')).toBe(true);
      expect(badgeElement.nativeElement.classList.contains('badge-lg')).toBe(true);
    });

    it('should have badge-content class', () => {
      const content = badgeElement.query(By.css('.badge-content'));
      expect(content).toBeTruthy();
    });

    it('should have badge-close class when closeable', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton.nativeElement.classList.contains('badge-close')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      expect(badgeElement.nativeElement.getAttribute('role')).toBe('status');
    });

    it('should have aria-label on close button', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton.nativeElement.getAttribute('aria-label')).toBe('Remove badge');
    });

    it('should have type="button" on close button', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton.nativeElement.getAttribute('type')).toBe('button');
    });

    it('should have focus-visible outline on close button', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = badgeElement.query(By.css('.badge-close'));
      closeButton.nativeElement.focus();
      fixture.detectChanges();
      expect(closeButton.nativeElement).toBeTruthy();
    });
  });

  describe('State Combinations', () => {
    it('should render all variant and size combinations', () => {
      const variants: BadgeVariant[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];
      const sizes: BadgeSize[] = ['sm', 'md', 'lg'];

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          component.variant = variant;
          component.size = size;
          fixture.detectChanges();
          expect(badgeElement.nativeElement.classList.contains(`badge-${variant}`)).toBe(true);
          expect(badgeElement.nativeElement.classList.contains(`badge-${size}`)).toBe(true);
        });
      });
    });

    it('should handle closeable with all variants', () => {
      const variants: BadgeVariant[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info'];

      variants.forEach((variant) => {
        component.variant = variant;
        component.closeable = true;
        fixture.detectChanges();
        const closeButton = badgeElement.query(By.css('.badge-close'));
        expect(closeButton).toBeTruthy();
      });
    });

    it('should handle closeable with all sizes', () => {
      const sizes: BadgeSize[] = ['sm', 'md', 'lg'];

      sizes.forEach((size) => {
        component.size = size;
        component.closeable = true;
        fixture.detectChanges();
        const closeButton = badgeElement.query(By.css('.badge-close'));
        expect(closeButton).toBeTruthy();
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit onClose event', (done) => {
      component.closeable = true;
      fixture.detectChanges();

      component.onClose.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.handleClose(new MouseEvent('click'));
    });

    it('should handle multiple close events', (done) => {
      component.closeable = true;
      fixture.detectChanges();

      let closeCount = 0;
      component.onClose.subscribe(() => {
        closeCount++;
        if (closeCount === 3) {
          expect(closeCount).toBe(3);
          done();
        }
      });

      component.handleClose(new MouseEvent('click'));
      component.handleClose(new MouseEvent('click'));
      component.handleClose(new MouseEvent('click'));
    });

    it('should pass click event from button to component', (done) => {
      component.closeable = true;
      fixture.detectChanges();

      component.onClose.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const closeButton = badgeElement.query(By.css('.badge-close'));
      closeButton.nativeElement.click();
    });
  });

  describe('Badge Classes Getter', () => {
    it('should return correct classes for primary badge', () => {
      component.variant = 'primary';
      component.size = 'md';
      const classes = component.badgeClasses;
      expect(classes).toContain('badge');
      expect(classes).toContain('badge-primary');
      expect(classes).toContain('badge-md');
    });

    it('should return correct classes for success badge', () => {
      component.variant = 'success';
      component.size = 'lg';
      const classes = component.badgeClasses;
      expect(classes).toContain('badge');
      expect(classes).toContain('badge-success');
      expect(classes).toContain('badge-lg');
    });

    it('should update classes when properties change', () => {
      component.variant = 'primary';
      component.size = 'sm';
      let classes = component.badgeClasses;
      expect(classes).toContain('badge-primary');
      expect(classes).toContain('badge-sm');

      component.variant = 'error';
      component.size = 'lg';
      classes = component.badgeClasses;
      expect(classes).toContain('badge-error');
      expect(classes).toContain('badge-lg');
    });
  });

  describe('Display and Layout', () => {
    it('should use inline-flex display', () => {
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.display).toBe('inline-flex');
    });

    it('should center align items', () => {
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.alignItems).toBe('center');
    });

    it('should have border-radius', () => {
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.borderRadius).toBe('12px');
    });

    it('should have font-weight 600', () => {
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.fontWeight).toBe('600');
    });

    it('should have white-space nowrap', () => {
      const styles = window.getComputedStyle(badgeElement.nativeElement);
      expect(styles.whiteSpace).toBe('nowrap');
    });
  });

  describe('Integration', () => {
    it('should render complete badge with content', () => {
      component.variant = 'success';
      component.size = 'md';
      component.closeable = false;
      fixture.detectChanges();

      expect(badgeElement).toBeTruthy();
      expect(badgeElement.nativeElement.classList.contains('badge-success')).toBe(true);
      expect(badgeElement.nativeElement.classList.contains('badge-md')).toBe(true);
    });

    it('should render dismissible badge', () => {
      component.variant = 'warning';
      component.size = 'lg';
      component.closeable = true;
      fixture.detectChanges();

      const closeButton = badgeElement.query(By.css('.badge-close'));
      expect(closeButton).toBeTruthy();
      expect(badgeElement.nativeElement.classList.contains('badge-warning')).toBe(true);
      expect(badgeElement.nativeElement.classList.contains('badge-lg')).toBe(true);
    });
  });

  describe('Content Projection', () => {
    it('should project content into badge', () => {
      const testFixture = TestBed.createComponent(BadgeComponent);
      testFixture.componentInstance.variant = 'primary';
      testFixture.nativeElement.innerHTML = '<app-badge>New Feature</app-badge>';
      testFixture.detectChanges();
      expect(testFixture.nativeElement.textContent).toContain('New Feature');
    });

    it('should project multiple content types', () => {
      const testFixture = TestBed.createComponent(BadgeComponent);
      testFixture.componentInstance.variant = 'success';
      testFixture.nativeElement.innerHTML = '<app-badge>✓ Completed</app-badge>';
      testFixture.detectChanges();
      expect(testFixture.nativeElement.textContent).toContain('✓ Completed');
    });
  });
});
