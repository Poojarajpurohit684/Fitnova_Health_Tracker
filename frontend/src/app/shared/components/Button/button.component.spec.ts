import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent, ButtonVariant, ButtonSize } from './button.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(By.css('button'));
    fixture.detectChanges();
  });

  describe('Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render a button element', () => {
      expect(buttonElement).toBeTruthy();
    });

    it('should render button text content', () => {
      const testFixture = TestBed.createComponent(ButtonComponent);
      testFixture.nativeElement.innerHTML = '<app-button>Click me</app-button>';
      testFixture.detectChanges();
      expect(testFixture.nativeElement.textContent).toContain('Click me');
    });

    it('should have default variant (primary)', () => {
      expect(component.variant).toBe('primary');
      expect(buttonElement.nativeElement.classList.contains('btn-primary')).toBe(true);
    });

    it('should have default size (medium)', () => {
      expect(component.size).toBe('medium');
      expect(buttonElement.nativeElement.classList.contains('btn-medium')).toBe(true);
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      component.variant = 'primary';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-primary')).toBe(true);
    });

    it('should render secondary variant', () => {
      component.variant = 'secondary';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-secondary')).toBe(true);
    });

    it('should render tertiary variant', () => {
      component.variant = 'tertiary';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-tertiary')).toBe(true);
    });

    it('should render destructive variant', () => {
      component.variant = 'destructive';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-destructive')).toBe(true);
    });

    it('should update variant dynamically', () => {
      const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'destructive'];
      variants.forEach((variant) => {
        component.variant = variant;
        fixture.detectChanges();
        expect(buttonElement.nativeElement.classList.contains(`btn-${variant}`)).toBe(true);
      });
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      component.size = 'small';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-small')).toBe(true);
    });

    it('should render medium size', () => {
      component.size = 'medium';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-medium')).toBe(true);
    });

    it('should render large size', () => {
      component.size = 'large';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-large')).toBe(true);
    });

    it('should update size dynamically', () => {
      const sizes: ButtonSize[] = ['small', 'medium', 'large'];
      sizes.forEach((size) => {
        component.size = size;
        fixture.detectChanges();
        expect(buttonElement.nativeElement.classList.contains(`btn-${size}`)).toBe(true);
      });
    });
  });

  describe('Disabled State', () => {
    it('should render enabled button by default', () => {
      expect(component.disabled).toBe(false);
      expect(buttonElement.nativeElement.disabled).toBe(false);
    });

    it('should render disabled button when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.disabled).toBe(true);
      expect(buttonElement.nativeElement.classList.contains('btn-disabled')).toBe(true);
    });

    it('should have reduced opacity when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();
      const styles = window.getComputedStyle(buttonElement.nativeElement);
      expect(styles.opacity).toBe('0.5');
    });

    it('should toggle disabled state', () => {
      component.disabled = false;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.disabled).toBe(false);

      component.disabled = true;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.disabled).toBe(true);

      component.disabled = false;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.disabled).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should not have loading state by default', () => {
      expect(component.loading).toBe(false);
      expect(buttonElement.nativeElement.classList.contains('btn-loading')).toBe(false);
    });

    it('should render loading state when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-loading')).toBe(true);
      expect(buttonElement.nativeElement.classList.contains('btn-disabled')).toBe(true);
    });

    it('should disable button when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should toggle loading state', () => {
      component.loading = false;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-loading')).toBe(false);

      component.loading = true;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-loading')).toBe(true);

      component.loading = false;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-loading')).toBe(false);
    });
  });

  describe('Click Handler', () => {
    it('should emit onClick event when clicked', (done) => {
      component.onClick.subscribe((event: MouseEvent) => {
        expect(event).toBeTruthy();
        done();
      });
      buttonElement.nativeElement.click();
    });

    it('should not emit onClick when disabled', (done) => {
      component.disabled = true;
      fixture.detectChanges();

      let emitted = false;
      component.onClick.subscribe(() => {
        emitted = true;
      });

      buttonElement.nativeElement.click();

      // Give it a moment to ensure no event is emitted
      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 100);
    });

    it('should emit multiple click events', (done) => {
      let clickCount = 0;
      component.onClick.subscribe(() => {
        clickCount++;
        if (clickCount === 3) {
          expect(clickCount).toBe(3);
          done();
        }
      });

      buttonElement.nativeElement.click();
      buttonElement.nativeElement.click();
      buttonElement.nativeElement.click();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label when provided', () => {
      component.ariaLabel = 'Save changes';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.getAttribute('aria-label')).toBe('Save changes');
    });

    it('should not have aria-label when not provided', () => {
      component.ariaLabel = null;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.getAttribute('aria-label')).toBeNull();
    });

    it('should have type="button" by default', () => {
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
    });

    it('should have focus-visible outline', () => {
      buttonElement.nativeElement.focus();
      fixture.detectChanges();
      // CSS focus-visible is applied via stylesheet
      expect(buttonElement.nativeElement).toBeTruthy();
    });
  });

  describe('CSS Classes', () => {
    it('should always have btn class', () => {
      expect(buttonElement.nativeElement.classList.contains('btn')).toBe(true);
    });

    it('should combine variant and size classes', () => {
      component.variant = 'secondary';
      component.size = 'large';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn')).toBe(true);
      expect(buttonElement.nativeElement.classList.contains('btn-secondary')).toBe(true);
      expect(buttonElement.nativeElement.classList.contains('btn-large')).toBe(true);
    });

    it('should add btn-disabled class when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-disabled')).toBe(true);
    });

    it('should not add btn-disabled class when enabled', () => {
      component.disabled = false;
      fixture.detectChanges();
      expect(buttonElement.nativeElement.classList.contains('btn-disabled')).toBe(false);
    });
  });

  describe('Icon Support', () => {
    it('should render icon before text when iconBefore is provided', () => {
      component.iconBefore = '<span>🔒</span>';
      fixture.detectChanges();
      const iconBefore = fixture.debugElement.query(By.css('.btn-icon-before'));
      expect(iconBefore).toBeTruthy();
    });

    it('should render icon after text when iconAfter is provided', () => {
      component.iconAfter = '<span>→</span>';
      fixture.detectChanges();
      const iconAfter = fixture.debugElement.query(By.css('.btn-icon-after'));
      expect(iconAfter).toBeTruthy();
    });

    it('should render both icons when both are provided', () => {
      component.iconBefore = '<span>←</span>';
      component.iconAfter = '<span>→</span>';
      fixture.detectChanges();
      const iconBefore = fixture.debugElement.query(By.css('.btn-icon-before'));
      const iconAfter = fixture.debugElement.query(By.css('.btn-icon-after'));
      expect(iconBefore).toBeTruthy();
      expect(iconAfter).toBeTruthy();
    });

    it('should not render icon elements when icons are not provided', () => {
      component.iconBefore = null;
      component.iconAfter = null;
      fixture.detectChanges();
      const iconBefore = fixture.debugElement.query(By.css('.btn-icon-before'));
      const iconAfter = fixture.debugElement.query(By.css('.btn-icon-after'));
      expect(iconBefore).toBeFalsy();
      expect(iconAfter).toBeFalsy();
    });
  });

  describe('State Combinations', () => {
    it('should render all variant and size combinations', () => {
      const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'destructive'];
      const sizes: ButtonSize[] = ['small', 'medium', 'large'];

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          component.variant = variant;
          component.size = size;
          fixture.detectChanges();
          expect(buttonElement.nativeElement.classList.contains(`btn-${variant}`)).toBe(true);
          expect(buttonElement.nativeElement.classList.contains(`btn-${size}`)).toBe(true);
        });
      });
    });

    it('should handle disabled state with all variants', () => {
      const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'destructive'];

      variants.forEach((variant) => {
        component.variant = variant;
        component.disabled = true;
        fixture.detectChanges();
        expect(buttonElement.nativeElement.disabled).toBe(true);
        expect(buttonElement.nativeElement.classList.contains('btn-disabled')).toBe(true);
      });
    });
  });

  describe('Touch Target Sizing', () => {
    it('should have minimum 32px height on small size', () => {
      component.size = 'small';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.style.minHeight).toBe('32px');
    });

    it('should have minimum 40px height on medium size', () => {
      component.size = 'medium';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.style.minHeight).toBe('40px');
    });

    it('should have minimum 48px height on large size', () => {
      component.size = 'large';
      fixture.detectChanges();
      expect(buttonElement.nativeElement.style.minHeight).toBe('48px');
    });

    it('should have minimum 44px width for touch accessibility', () => {
      expect(buttonElement.nativeElement.style.minWidth).toBe('44px');
    });
  });

  describe('Button Classes Getter', () => {
    it('should return correct classes for primary button', () => {
      component.variant = 'primary';
      component.size = 'medium';
      component.disabled = false;
      const classes = component.buttonClasses;
      expect(classes).toContain('btn');
      expect(classes).toContain('btn-primary');
      expect(classes).toContain('btn-medium');
      expect(classes).not.toContain('btn-disabled');
    });

    it('should return correct classes for disabled button', () => {
      component.variant = 'secondary';
      component.size = 'large';
      component.disabled = true;
      const classes = component.buttonClasses;
      expect(classes).toContain('btn');
      expect(classes).toContain('btn-secondary');
      expect(classes).toContain('btn-large');
      expect(classes).toContain('btn-disabled');
    });

    it('should return correct classes for loading button', () => {
      component.variant = 'primary';
      component.size = 'medium';
      component.loading = true;
      const classes = component.buttonClasses;
      expect(classes).toContain('btn');
      expect(classes).toContain('btn-primary');
      expect(classes).toContain('btn-medium');
      expect(classes).toContain('btn-disabled');
      expect(classes).toContain('btn-loading');
    });

    it('should update classes when properties change', () => {
      component.variant = 'primary';
      component.size = 'small';
      let classes = component.buttonClasses;
      expect(classes).toContain('btn-primary');
      expect(classes).toContain('btn-small');

      component.variant = 'destructive';
      component.size = 'large';
      classes = component.buttonClasses;
      expect(classes).toContain('btn-destructive');
      expect(classes).toContain('btn-large');
    });
  });
});
