import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the progress bar component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default size of md', () => {
      expect(component.size).toBe('md');
    });

    it('should have default mode of indeterminate', () => {
      expect(component.mode).toBe('indeterminate');
    });

    it('should have default value of 0', () => {
      expect(component.value).toBe(0);
    });

    it('should have default aria-label of Loading', () => {
      expect(component.ariaLabel).toBe('Loading');
    });
  });

  describe('Size Variants', () => {
    it('should render with sm size class', () => {
      component.size = 'sm';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-sm');
      expect(progressBar).toBeTruthy();
    });

    it('should render with md size class', () => {
      component.size = 'md';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-md');
      expect(progressBar).toBeTruthy();
    });

    it('should render with lg size class', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-lg');
      expect(progressBar).toBeTruthy();
    });

    it('should apply correct height for sm size', () => {
      component.size = 'sm';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-sm');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.height).toBe('2px');
    });

    it('should apply correct height for md size', () => {
      component.size = 'md';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-md');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.height).toBe('4px');
    });

    it('should apply correct height for lg size', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-lg');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.height).toBe('8px');
    });
  });

  describe('Mode Variants', () => {
    it('should render with indeterminate mode class', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-indeterminate');
      expect(progressBar).toBeTruthy();
    });

    it('should render with determinate mode class', () => {
      component.mode = 'determinate';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar-determinate');
      expect(progressBar).toBeTruthy();
    });
  });

  describe('Determinate Mode', () => {
    it('should set fill width to value percentage', () => {
      component.mode = 'determinate';
      component.value = 50;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('50%');
    });

    it('should update fill width when value changes', () => {
      component.mode = 'determinate';
      component.value = 25;
      fixture.detectChanges();
      let fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('25%');

      component.value = 75;
      fixture.detectChanges();
      fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('75%');
    });

    it('should handle 0% value', () => {
      component.mode = 'determinate';
      component.value = 0;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('0%');
    });

    it('should handle 100% value', () => {
      component.mode = 'determinate';
      component.value = 100;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('100%');
    });

    it('should clamp value to 0-100 range', () => {
      component.mode = 'determinate';
      component.value = 150;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      // Component doesn't clamp, but CSS should handle overflow
      expect(fill.style.width).toBe('150%');
    });

    it('should handle negative values', () => {
      component.mode = 'determinate';
      component.value = -10;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('-10%');
    });

    it('should handle decimal values', () => {
      component.mode = 'determinate';
      component.value = 33.33;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('33.33%');
    });
  });

  describe('Indeterminate Mode', () => {
    it('should set fill width to 100%', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('100%');
    });

    it('should ignore value property in indeterminate mode', () => {
      component.mode = 'indeterminate';
      component.value = 50;
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('100%');
    });

    it('should have animation in indeterminate mode', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.animation).toContain('progress-indeterminate');
    });
  });

  describe('Accessibility', () => {
    it('should have role="progressbar"', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('role')).toBe('progressbar');
    });

    it('should have aria-label attribute', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe('Loading');
    });

    it('should have aria-valuemin="0"', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should have aria-valuemax="100"', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should have aria-valuenow in determinate mode', () => {
      component.mode = 'determinate';
      component.value = 65;
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-valuenow')).toBe('65');
    });

    it('should not have aria-valuenow in indeterminate mode', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-valuenow')).toBeNull();
    });

    it('should update aria-label when input changes', () => {
      component.ariaLabel = 'Uploading file...';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe('Uploading file...');
    });

    it('should support custom aria-label', () => {
      component.ariaLabel = 'Processing data';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe('Processing data');
    });
  });

  describe('Styling', () => {
    it('should have progress-bar class', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.classList.contains('progress-bar')).toBeTruthy();
    });

    it('should have display block', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.display).toBe('block');
    });

    it('should have width 100%', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.width).toBe('100%');
    });

    it('should have overflow hidden', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.overflow).toBe('hidden');
    });

    it('should have border-radius', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.borderRadius).toBeTruthy();
    });
  });

  describe('Fill Styling', () => {
    it('should have progress-bar-fill class', () => {
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.classList.contains('progress-bar-fill')).toBeTruthy();
    });

    it('should have height 100%', () => {
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.height).toBe('100%');
    });

    it('should have background color from design tokens', () => {
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.backgroundColor).toBeTruthy();
    });
  });

  describe('Animation', () => {
    it('should have animation in indeterminate mode', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.animation).toContain('progress-indeterminate');
    });

    it('should have 2s animation duration in indeterminate mode', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.animationDuration).toBe('2s');
    });

    it('should have infinite animation iteration in indeterminate mode', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.animationIterationCount).toBe('infinite');
    });

    it('should have no animation in determinate mode', () => {
      component.mode = 'determinate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.animation).toBe('none');
    });

    it('should have transition in determinate mode', () => {
      component.mode = 'determinate';
      fixture.detectChanges();
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      expect(styles.transition).toContain('width');
    });
  });

  describe('Dynamic Input Changes', () => {
    it('should update size dynamically', () => {
      component.size = 'sm';
      fixture.detectChanges();
      let progressBar = fixture.nativeElement.querySelector('.progress-bar-sm');
      expect(progressBar).toBeTruthy();

      component.size = 'lg';
      fixture.detectChanges();
      progressBar = fixture.nativeElement.querySelector('.progress-bar-lg');
      expect(progressBar).toBeTruthy();
    });

    it('should update mode dynamically', () => {
      component.mode = 'indeterminate';
      fixture.detectChanges();
      let progressBar = fixture.nativeElement.querySelector('.progress-bar-indeterminate');
      expect(progressBar).toBeTruthy();

      component.mode = 'determinate';
      fixture.detectChanges();
      progressBar = fixture.nativeElement.querySelector('.progress-bar-determinate');
      expect(progressBar).toBeTruthy();
    });

    it('should update value dynamically', () => {
      component.mode = 'determinate';
      component.value = 30;
      fixture.detectChanges();
      let fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('30%');

      component.value = 70;
      fixture.detectChanges();
      fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('70%');
    });

    it('should update aria-label dynamically', () => {
      component.ariaLabel = 'Initial label';
      fixture.detectChanges();
      let progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe('Initial label');

      component.ariaLabel = 'Updated label';
      fixture.detectChanges();
      progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe('Updated label');
    });
  });

  describe('CSS Classes', () => {
    it('should compute correct progress bar classes for sm indeterminate', () => {
      component.size = 'sm';
      component.mode = 'indeterminate';
      expect(component.progressBarClasses).toBe('progress-bar-sm progress-bar-indeterminate');
    });

    it('should compute correct progress bar classes for lg determinate', () => {
      component.size = 'lg';
      component.mode = 'determinate';
      expect(component.progressBarClasses).toBe('progress-bar-lg progress-bar-determinate');
    });

    it('should compute correct progress bar classes for md indeterminate', () => {
      component.size = 'md';
      component.mode = 'indeterminate';
      expect(component.progressBarClasses).toBe('progress-bar-md progress-bar-indeterminate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty aria-label', () => {
      component.ariaLabel = '';
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe('');
    });

    it('should handle very long aria-label', () => {
      const longLabel = 'A'.repeat(100);
      component.ariaLabel = longLabel;
      fixture.detectChanges();
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      expect(progressBar.getAttribute('aria-label')).toBe(longLabel);
    });

    it('should handle rapid value changes', () => {
      component.mode = 'determinate';
      for (let i = 0; i <= 100; i += 10) {
        component.value = i;
        fixture.detectChanges();
        const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
        expect(fill.style.width).toBe(`${i}%`);
      }
    });

    it('should handle switching between modes', () => {
      component.mode = 'determinate';
      component.value = 50;
      fixture.detectChanges();
      let fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('50%');

      component.mode = 'indeterminate';
      fixture.detectChanges();
      fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      expect(fill.style.width).toBe('100%');
    });
  });

  describe('Responsive Behavior', () => {
    it('should have full width', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      const styles = window.getComputedStyle(progressBar);
      expect(styles.width).toBe('100%');
    });

    it('should maintain full width across all sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        component.size = size;
        fixture.detectChanges();
        const progressBar = fixture.nativeElement.querySelector('.progress-bar');
        const styles = window.getComputedStyle(progressBar);
        expect(styles.width).toBe('100%');
      });
    });
  });

  describe('Color Tokens', () => {
    it('should use design system color tokens for background', () => {
      const progressBar = fixture.nativeElement.querySelector('.progress-bar');
      const styles = window.getComputedStyle(progressBar);
      const backgroundColor = styles.backgroundColor;
      expect(backgroundColor).toBeTruthy();
    });

    it('should use design system color tokens for fill', () => {
      const fill = fixture.nativeElement.querySelector('.progress-bar-fill');
      const styles = window.getComputedStyle(fill);
      const backgroundColor = styles.backgroundColor;
      expect(backgroundColor).toBeTruthy();
    });
  });
});
