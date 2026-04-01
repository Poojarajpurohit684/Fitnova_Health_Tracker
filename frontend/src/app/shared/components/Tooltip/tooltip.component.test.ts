import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent, TooltipPosition } from './tooltip.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render tooltip trigger', () => {
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      expect(trigger).toBeTruthy();
    });

    it('should render tooltip element', () => {
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip).toBeTruthy();
    });

    it('should have default position (top)', () => {
      expect(component.position).toBe('top');
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-top')).toBe(true);
    });

    it('should have role="tooltip"', () => {
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.getAttribute('role')).toBe('tooltip');
    });
  });

  describe('Tooltip Text', () => {
    it('should display tooltip text', () => {
      component.text = 'Save your changes';
      fixture.detectChanges();
      const tooltipText = compiled.query(By.css('.tooltip-text'));
      expect(tooltipText.nativeElement.textContent).toContain('Save your changes');
    });

    it('should update tooltip text dynamically', () => {
      component.text = 'Save your changes';
      fixture.detectChanges();
      let tooltipText = compiled.query(By.css('.tooltip-text'));
      expect(tooltipText.nativeElement.textContent).toContain('Save your changes');

      component.text = 'Delete this item';
      fixture.detectChanges();
      tooltipText = compiled.query(By.css('.tooltip-text'));
      expect(tooltipText.nativeElement.textContent).toContain('Delete this item');
    });

    it('should handle empty text', () => {
      component.text = '';
      fixture.detectChanges();
      const tooltipText = compiled.query(By.css('.tooltip-text'));
      expect(tooltipText).toBeTruthy();
    });
  });

  describe('Positions', () => {
    it('should render top position', () => {
      component.position = 'top';
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-top')).toBe(true);
    });

    it('should render bottom position', () => {
      component.position = 'bottom';
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-bottom')).toBe(true);
    });

    it('should render left position', () => {
      component.position = 'left';
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-left')).toBe(true);
    });

    it('should render right position', () => {
      component.position = 'right';
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-right')).toBe(true);
    });

    it('should update position dynamically', () => {
      const positions: TooltipPosition[] = ['top', 'bottom', 'left', 'right'];
      positions.forEach((position) => {
        component.position = position;
        fixture.detectChanges();
        const tooltip = compiled.query(By.css('.tooltip'));
        expect(tooltip.nativeElement.classList.contains(`tooltip-${position}`)).toBe(true);
      });
    });
  });

  describe('Visibility', () => {
    it('should be hidden by default', () => {
      expect(component.isVisible).toBe(false);
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-visible')).toBe(false);
    });

    it('should show on mouse enter', () => {
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(component.isVisible).toBe(true);
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-visible')).toBe(true);
    });

    it('should hide on mouse leave', () => {
      component.isVisible = true;
      fixture.detectChanges();
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();
      expect(component.isVisible).toBe(false);
    });

    it('should show on focus', () => {
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new FocusEvent('focus'));
      fixture.detectChanges();
      expect(component.isVisible).toBe(true);
    });

    it('should hide on blur', () => {
      component.isVisible = true;
      fixture.detectChanges();
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(component.isVisible).toBe(false);
    });
  });

  describe('Arrow', () => {
    it('should render arrow element', () => {
      const arrow = compiled.query(By.css('.tooltip-arrow'));
      expect(arrow).toBeTruthy();
    });

    it('should have correct arrow styling', () => {
      const arrow = compiled.query(By.css('.tooltip-arrow'));
      const styles = window.getComputedStyle(arrow.nativeElement);
      expect(styles.position).toBe('absolute');
    });
  });

  describe('Accessibility', () => {
    it('should have role="tooltip"', () => {
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.getAttribute('role')).toBe('tooltip');
    });

    it('should have aria-hidden when not visible', () => {
      component.isVisible = false;
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have aria-hidden="false" when visible', () => {
      component.isVisible = true;
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('CSS Classes', () => {
    it('should have tooltip class', () => {
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip')).toBe(true);
    });

    it('should have position class', () => {
      component.position = 'bottom';
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-bottom')).toBe(true);
    });

    it('should have tooltip-visible class when visible', () => {
      component.isVisible = true;
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-visible')).toBe(true);
    });

    it('should not have tooltip-visible class when hidden', () => {
      component.isVisible = false;
      fixture.detectChanges();
      const tooltip = compiled.query(By.css('.tooltip'));
      expect(tooltip.nativeElement.classList.contains('tooltip-visible')).toBe(false);
    });

    it('should have tooltip-text class', () => {
      const tooltipText = compiled.query(By.css('.tooltip-text'));
      expect(tooltipText.nativeElement.classList.contains('tooltip-text')).toBe(true);
    });

    it('should have tooltip-arrow class', () => {
      const arrow = compiled.query(By.css('.tooltip-arrow'));
      expect(arrow.nativeElement.classList.contains('tooltip-arrow')).toBe(true);
    });
  });

  describe('Tooltip Classes Getter', () => {
    it('should return correct classes when hidden', () => {
      component.position = 'top';
      component.isVisible = false;
      const classes = component.tooltipClasses;
      expect(classes).toContain('tooltip');
      expect(classes).toContain('tooltip-top');
      expect(classes).not.toContain('tooltip-visible');
    });

    it('should return correct classes when visible', () => {
      component.position = 'bottom';
      component.isVisible = true;
      const classes = component.tooltipClasses;
      expect(classes).toContain('tooltip');
      expect(classes).toContain('tooltip-bottom');
      expect(classes).toContain('tooltip-visible');
    });

    it('should update classes dynamically', () => {
      component.position = 'top';
      component.isVisible = false;
      let classes = component.tooltipClasses;
      expect(classes).toContain('tooltip-top');
      expect(classes).not.toContain('tooltip-visible');

      component.position = 'right';
      component.isVisible = true;
      classes = component.tooltipClasses;
      expect(classes).toContain('tooltip-right');
      expect(classes).toContain('tooltip-visible');
    });
  });

  describe('Event Handling', () => {
    it('should handle mouseenter event', () => {
      spyOn(component, 'onMouseEnter');
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      expect(component.onMouseEnter).toHaveBeenCalled();
    });

    it('should handle mouseleave event', () => {
      spyOn(component, 'onMouseLeave');
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
      expect(component.onMouseLeave).toHaveBeenCalled();
    });

    it('should handle focus event', () => {
      spyOn(component, 'onFocus');
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new FocusEvent('focus'));
      expect(component.onFocus).toHaveBeenCalled();
    });

    it('should handle blur event', () => {
      spyOn(component, 'onBlur');
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      trigger.nativeElement.dispatchEvent(new FocusEvent('blur'));
      expect(component.onBlur).toHaveBeenCalled();
    });
  });

  describe('Content Projection', () => {
    it('should project trigger content', () => {
      const testFixture = TestBed.createComponent(TooltipComponent);
      testFixture.componentInstance.text = 'Help text';
      testFixture.nativeElement.innerHTML = '<app-tooltip><button>Help</button></app-tooltip>';
      testFixture.detectChanges();
      expect(testFixture.nativeElement.textContent).toContain('Help');
    });
  });

  describe('Display and Layout', () => {
    it('should have inline-block display on trigger', () => {
      const trigger = compiled.query(By.css('.tooltip-trigger'));
      const styles = window.getComputedStyle(trigger.nativeElement);
      expect(styles.display).toBe('inline-block');
    });

    it('should have absolute positioning on tooltip', () => {
      const tooltip = compiled.query(By.css('.tooltip'));
      const styles = window.getComputedStyle(tooltip.nativeElement);
      expect(styles.position).toBe('absolute');
    });

    it('should have correct z-index', () => {
      const tooltip = compiled.query(By.css('.tooltip'));
      const styles = window.getComputedStyle(tooltip.nativeElement);
      expect(styles.zIndex).toBe('999');
    });
  });

  describe('Integration', () => {
    it('should render complete tooltip', () => {
      component.text = 'Save your changes';
      component.position = 'top';
      fixture.detectChanges();

      const trigger = compiled.query(By.css('.tooltip-trigger'));
      const tooltip = compiled.query(By.css('.tooltip'));
      const tooltipText = compiled.query(By.css('.tooltip-text'));
      const arrow = compiled.query(By.css('.tooltip-arrow'));

      expect(trigger).toBeTruthy();
      expect(tooltip).toBeTruthy();
      expect(tooltipText).toBeTruthy();
      expect(arrow).toBeTruthy();
    });

    it('should handle show/hide cycle', () => {
      component.text = 'Help text';
      fixture.detectChanges();

      expect(component.isVisible).toBe(false);

      component.onMouseEnter();
      fixture.detectChanges();
      expect(component.isVisible).toBe(true);

      component.onMouseLeave();
      fixture.detectChanges();
      expect(component.isVisible).toBe(false);
    });
  });
});
