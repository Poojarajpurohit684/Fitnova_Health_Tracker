import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the skeleton component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default variant of text', () => {
      expect(component.variant).toBe('text');
    });

    it('should have default aria-label of Loading', () => {
      expect(component.ariaLabel).toBe('Loading');
    });

    it('should not have width by default', () => {
      expect(component.width).toBeUndefined();
    });

    it('should not have height by default', () => {
      expect(component.height).toBeUndefined();
    });
  });

  describe('Variant Rendering', () => {
    it('should render with text variant class', () => {
      component.variant = 'text';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-text');
      expect(skeleton).toBeTruthy();
    });

    it('should render with heading variant class', () => {
      component.variant = 'heading';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-heading');
      expect(skeleton).toBeTruthy();
    });

    it('should render with card variant class', () => {
      component.variant = 'card';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-card');
      expect(skeleton).toBeTruthy();
    });

    it('should render with avatar variant class', () => {
      component.variant = 'avatar';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-avatar');
      expect(skeleton).toBeTruthy();
    });

    it('should render with button variant class', () => {
      component.variant = 'button';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-button');
      expect(skeleton).toBeTruthy();
    });
  });

  describe('Variant Dimensions', () => {
    it('should have correct height for text variant', () => {
      component.variant = 'text';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-text');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.height).toBe('16px');
    });

    it('should have correct height for heading variant', () => {
      component.variant = 'heading';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-heading');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.height).toBe('28px');
    });

    it('should have correct height for card variant', () => {
      component.variant = 'card';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-card');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.height).toBe('200px');
    });

    it('should have correct dimensions for avatar variant', () => {
      component.variant = 'avatar';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-avatar');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.width).toBe('48px');
      expect(styles.height).toBe('48px');
    });

    it('should have correct height for button variant', () => {
      component.variant = 'button';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-button');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.height).toBe('44px');
    });
  });

  describe('Custom Dimensions', () => {
    it('should apply custom width', () => {
      component.width = '200px';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.width).toBe('200px');
    });

    it('should apply custom height', () => {
      component.height = '100px';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.height).toBe('100px');
    });

    it('should apply both custom width and height', () => {
      component.width = '300px';
      component.height = '150px';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.width).toBe('300px');
      expect(skeleton.style.height).toBe('150px');
    });

    it('should support percentage width', () => {
      component.width = '100%';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.width).toBe('100%');
    });

    it('should support percentage height', () => {
      component.height = '50%';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.height).toBe('50%');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('role')).toBe('status');
    });

    it('should have aria-busy="true"', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('aria-busy')).toBe('true');
    });

    it('should have aria-label attribute', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('aria-label')).toBe('Loading');
    });

    it('should update aria-label when input changes', () => {
      component.ariaLabel = 'Loading content...';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('aria-label')).toBe('Loading content...');
    });

    it('should support custom aria-label', () => {
      component.ariaLabel = 'Loading user profile';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('aria-label')).toBe('Loading user profile');
    });
  });

  describe('Styling', () => {
    it('should have skeleton class', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.classList.contains('skeleton')).toBeTruthy();
    });

    it('should have display inline-block', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.display).toBe('inline-block');
    });

    it('should have border-radius', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.borderRadius).toBeTruthy();
    });

    it('should have gradient background', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.backgroundImage).toContain('gradient');
    });
  });

  describe('Animation', () => {
    it('should have shimmer animation', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.animation).toContain('shimmer');
    });

    it('should have 2s animation duration', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.animationDuration).toBe('2s');
    });

    it('should have infinite animation iteration', () => {
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.animationIterationCount).toBe('infinite');
    });
  });

  describe('Avatar Variant Specifics', () => {
    it('should have circular shape for avatar', () => {
      component.variant = 'avatar';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-avatar');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.borderRadius).toBe('50%');
    });

    it('should maintain square aspect ratio for avatar', () => {
      component.variant = 'avatar';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-avatar');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.width).toBe(styles.height);
    });
  });

  describe('Text Variant Specifics', () => {
    it('should have full width for text variant', () => {
      component.variant = 'text';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-text');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.width).toBe('100%');
    });
  });

  describe('Card Variant Specifics', () => {
    it('should have full width for card variant', () => {
      component.variant = 'card';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton-card');
      const styles = window.getComputedStyle(skeleton);
      expect(styles.width).toBe('100%');
    });
  });

  describe('Dynamic Input Changes', () => {
    it('should update variant dynamically', () => {
      component.variant = 'text';
      fixture.detectChanges();
      let skeleton = fixture.nativeElement.querySelector('.skeleton-text');
      expect(skeleton).toBeTruthy();

      component.variant = 'heading';
      fixture.detectChanges();
      skeleton = fixture.nativeElement.querySelector('.skeleton-heading');
      expect(skeleton).toBeTruthy();
    });

    it('should update width dynamically', () => {
      component.width = '100px';
      fixture.detectChanges();
      let skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.width).toBe('100px');

      component.width = '200px';
      fixture.detectChanges();
      skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.width).toBe('200px');
    });

    it('should update height dynamically', () => {
      component.height = '50px';
      fixture.detectChanges();
      let skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.height).toBe('50px');

      component.height = '100px';
      fixture.detectChanges();
      skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.height).toBe('100px');
    });
  });

  describe('CSS Classes', () => {
    it('should compute correct skeleton classes for text', () => {
      component.variant = 'text';
      expect(component.skeletonClasses).toBe('skeleton-text');
    });

    it('should compute correct skeleton classes for heading', () => {
      component.variant = 'heading';
      expect(component.skeletonClasses).toBe('skeleton-heading');
    });

    it('should compute correct skeleton classes for card', () => {
      component.variant = 'card';
      expect(component.skeletonClasses).toBe('skeleton-card');
    });

    it('should compute correct skeleton classes for avatar', () => {
      component.variant = 'avatar';
      expect(component.skeletonClasses).toBe('skeleton-avatar');
    });

    it('should compute correct skeleton classes for button', () => {
      component.variant = 'button';
      expect(component.skeletonClasses).toBe('skeleton-button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty aria-label', () => {
      component.ariaLabel = '';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('aria-label')).toBe('');
    });

    it('should handle very long aria-label', () => {
      const longLabel = 'A'.repeat(100);
      component.ariaLabel = longLabel;
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.getAttribute('aria-label')).toBe(longLabel);
    });

    it('should handle zero width', () => {
      component.width = '0px';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.width).toBe('0px');
    });

    it('should handle zero height', () => {
      component.height = '0px';
      fixture.detectChanges();
      const skeleton = fixture.nativeElement.querySelector('.skeleton');
      expect(skeleton.style.height).toBe('0px');
    });
  });
});
