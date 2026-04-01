import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagComponent, TagVariant, TagSize } from './tag.component';

describe('TagComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render tag with default variant and size', () => {
      const tagElement = fixture.nativeElement.querySelector('.tag');
      expect(tagElement).toBeTruthy();
      expect(tagElement.classList.contains('tag-default')).toBe(true);
      expect(tagElement.classList.contains('tag-md')).toBe(true);
    });

    it('should render tag content', () => {
      fixture.nativeElement.innerHTML = '<app-tag>Test Tag</app-tag>';
      fixture.detectChanges();
      const tagLabel = fixture.nativeElement.querySelector('.tag-label');
      expect(tagLabel.textContent).toContain('Test Tag');
    });

    it('should apply variant class', () => {
      component.variant = 'primary';
      fixture.detectChanges();
      const tagElement = fixture.nativeElement.querySelector('.tag');
      expect(tagElement.classList.contains('tag-primary')).toBe(true);
    });

    it('should apply size class', () => {
      component.size = 'lg';
      fixture.detectChanges();
      const tagElement = fixture.nativeElement.querySelector('.tag');
      expect(tagElement.classList.contains('tag-lg')).toBe(true);
    });
  });

  describe('Variants', () => {
    const variants: TagVariant[] = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'];

    variants.forEach((variant) => {
      it(`should render ${variant} variant`, () => {
        component.variant = variant;
        fixture.detectChanges();
        const tagElement = fixture.nativeElement.querySelector('.tag');
        expect(tagElement.classList.contains(`tag-${variant}`)).toBe(true);
      });
    });
  });

  describe('Sizes', () => {
    const sizes: TagSize[] = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      it(`should render ${size} size`, () => {
        component.size = size;
        fixture.detectChanges();
        const tagElement = fixture.nativeElement.querySelector('.tag');
        expect(tagElement.classList.contains(`tag-${size}`)).toBe(true);
      });
    });
  });

  describe('Close Button', () => {
    it('should not render close button by default', () => {
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      expect(closeButton).toBeFalsy();
    });

    it('should render close button when closeable is true', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      expect(closeButton).toBeTruthy();
    });

    it('should emit onClose event when close button is clicked', () => {
      spyOn(component.onClose, 'emit');
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      closeButton.click();
      expect(component.onClose.emit).toHaveBeenCalled();
    });

    it('should have proper aria-label on close button', () => {
      component.closeable = true;
      component.label = 'JavaScript';
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      expect(closeButton.getAttribute('aria-label')).toBe('Remove JavaScript');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      const tagElement = fixture.nativeElement.querySelector('.tag');
      expect(tagElement.getAttribute('role')).toBe('status');
    });

    it('should have aria-label on close button', () => {
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      expect(closeButton.hasAttribute('aria-label')).toBe(true);
    });

    it('should support keyboard navigation on close button', () => {
      spyOn(component.onClose, 'emit');
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      
      // Simulate Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      closeButton.dispatchEvent(enterEvent);
      closeButton.click();
      expect(component.onClose.emit).toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('should generate correct CSS classes', () => {
      component.variant = 'success';
      component.size = 'lg';
      const classes = component.tagClasses;
      expect(classes).toContain('tag');
      expect(classes).toContain('tag-success');
      expect(classes).toContain('tag-lg');
    });

    it('should handle multiple class combinations', () => {
      const variants: TagVariant[] = ['primary', 'secondary', 'error'];
      const sizes: TagSize[] = ['sm', 'md', 'lg'];

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          component.variant = variant;
          component.size = size;
          const classes = component.tagClasses;
          expect(classes).toContain(`tag-${variant}`);
          expect(classes).toContain(`tag-${size}`);
        });
      });
    });
  });

  describe('Event Handling', () => {
    it('should stop event propagation on close', () => {
      spyOn(component.onClose, 'emit');
      component.closeable = true;
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.tag-close');
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.handleClose(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should emit onClose event on close', () => {
      spyOn(component.onClose, 'emit');
      component.closeable = true;
      fixture.detectChanges();
      const event = new MouseEvent('click');
      component.handleClose(event);
      expect(component.onClose.emit).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should have default values', () => {
      expect(component.variant).toBe('default');
      expect(component.size).toBe('md');
      expect(component.closeable).toBe(false);
    });

    it('should accept custom variant', () => {
      component.variant = 'warning';
      expect(component.variant).toBe('warning');
    });

    it('should accept custom size', () => {
      component.size = 'sm';
      expect(component.size).toBe('sm');
    });

    it('should accept closeable flag', () => {
      component.closeable = true;
      expect(component.closeable).toBe(true);
    });
  });
});
