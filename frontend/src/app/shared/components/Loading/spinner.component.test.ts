import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the spinner component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default size of md', () => {
      expect(component.size).toBe('md');
    });

    it('should have default aria-label of Loading', () => {
      expect(component.ariaLabel).toBe('Loading');
    });
  });

  describe('Size Variants', () => {
    it('should render with sm size class', () => {
      component.size = 'sm';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-sm');
      expect(spinner).toBeTruthy();
    });

    it('should render with md size class', () => {
      component.size = 'md';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-md');
      expect(spinner).toBeTruthy();
    });

    it('should render with lg size class', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-lg');
      expect(spinner).toBeTruthy();
    });

    it('should apply correct width for sm size', () => {
      component.size = 'sm';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-sm');
      const styles = window.getComputedStyle(spinner);
      expect(styles.width).toBe('24px');
    });

    it('should apply correct width for md size', () => {
      component.size = 'md';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-md');
      const styles = window.getComputedStyle(spinner);
      expect(styles.width).toBe('40px');
    });

    it('should apply correct width for lg size', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-lg');
      const styles = window.getComputedStyle(spinner);
      expect(styles.width).toBe('56px');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('role')).toBe('status');
    });

    it('should have aria-label attribute', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('Loading');
    });

    it('should update aria-label when input changes', () => {
      component.ariaLabel = 'Loading data...';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('Loading data...');
    });

    it('should support custom aria-label', () => {
      component.ariaLabel = 'Processing request';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('Processing request');
    });
  });

  describe('Styling', () => {
    it('should have spinner class', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.classList.contains('spinner')).toBeTruthy();
    });

    it('should have border-radius of 50%', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.borderRadius).toBe('50%');
    });

    it('should have display inline-block', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.display).toBe('inline-block');
    });

    it('should have 4px border', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.borderWidth).toBe('4px');
    });
  });

  describe('Animation', () => {
    it('should have spin animation', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.animation).toContain('spin');
    });

    it('should have 1s animation duration', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.animationDuration).toBe('1s');
    });

    it('should have linear animation timing', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.animationTimingFunction).toBe('linear');
    });

    it('should have infinite animation iteration', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.animationIterationCount).toBe('infinite');
    });
  });

  describe('GPU Acceleration', () => {
    it('should have will-change property', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.willChange).toBe('transform');
    });

    it('should have transform translateZ(0)', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.transform).toContain('translateZ');
    });

    it('should have backface-visibility hidden', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      expect(styles.backfaceVisibility).toBe('hidden');
    });
  });

  describe('Dynamic Input Changes', () => {
    it('should update size dynamically', () => {
      component.size = 'sm';
      fixture.detectChanges();
      let spinner = fixture.nativeElement.querySelector('.spinner-sm');
      expect(spinner).toBeTruthy();

      component.size = 'lg';
      fixture.detectChanges();
      spinner = fixture.nativeElement.querySelector('.spinner-lg');
      expect(spinner).toBeTruthy();
    });

    it('should update aria-label dynamically', () => {
      component.ariaLabel = 'Initial label';
      fixture.detectChanges();
      let spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('Initial label');

      component.ariaLabel = 'Updated label';
      fixture.detectChanges();
      spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('Updated label');
    });
  });

  describe('CSS Classes', () => {
    it('should compute correct spinner classes for sm', () => {
      component.size = 'sm';
      expect(component.spinnerClasses).toBe('spinner-sm');
    });

    it('should compute correct spinner classes for md', () => {
      component.size = 'md';
      expect(component.spinnerClasses).toBe('spinner-md');
    });

    it('should compute correct spinner classes for lg', () => {
      component.size = 'lg';
      expect(component.spinnerClasses).toBe('spinner-lg');
    });
  });

  describe('Color Tokens', () => {
    it('should use design system color tokens', () => {
      const spinner = fixture.nativeElement.querySelector('.spinner');
      const styles = window.getComputedStyle(spinner);
      const borderColor = styles.borderColor;
      // Verify border color is set (actual color depends on CSS variable resolution)
      expect(borderColor).toBeTruthy();
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain aspect ratio (square)', () => {
      component.size = 'md';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner-md');
      const styles = window.getComputedStyle(spinner);
      expect(styles.width).toBe(styles.height);
    });

    it('should maintain aspect ratio for all sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        component.size = size;
        fixture.detectChanges();
        const spinner = fixture.nativeElement.querySelector(`.spinner-${size}`);
        const styles = window.getComputedStyle(spinner);
        expect(styles.width).toBe(styles.height);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty aria-label', () => {
      component.ariaLabel = '';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('');
    });

    it('should handle very long aria-label', () => {
      const longLabel = 'A'.repeat(100);
      component.ariaLabel = longLabel;
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe(longLabel);
    });

    it('should handle special characters in aria-label', () => {
      component.ariaLabel = 'Loading... (50%)';
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.spinner');
      expect(spinner.getAttribute('aria-label')).toBe('Loading... (50%)');
    });
  });
});
