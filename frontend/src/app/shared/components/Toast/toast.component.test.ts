import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastComponent, ToastType, ToastPosition } from './toast.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render toast with default type and message', () => {
      component.message = 'Test message';
      fixture.detectChanges();
      const toastElement = fixture.nativeElement.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      expect(toastElement.classList.contains('toast-info')).toBe(true);
    });

    it('should display message text', () => {
      component.message = 'Test notification';
      fixture.detectChanges();
      const messageElement = fixture.nativeElement.querySelector('.toast-message');
      expect(messageElement.textContent).toContain('Test notification');
    });

    it('should render close button', () => {
      const closeButton = fixture.nativeElement.querySelector('.toast-close');
      expect(closeButton).toBeTruthy();
    });

    it('should render correct icon for type', () => {
      const types: ToastType[] = ['success', 'error', 'warning', 'info'];
      types.forEach((type) => {
        component.type = type;
        fixture.detectChanges();
        const icon = fixture.nativeElement.querySelector('.toast-icon svg');
        expect(icon).toBeTruthy();
      });
    });
  });

  describe('Types', () => {
    const types: ToastType[] = ['success', 'warning', 'error', 'info'];

    types.forEach((type) => {
      it(`should render ${type} type`, () => {
        component.type = type;
        fixture.detectChanges();
        const toastElement = fixture.nativeElement.querySelector('.toast');
        expect(toastElement.classList.contains(`toast-${type}`)).toBe(true);
      });
    });
  });

  describe('Positions', () => {
    const positions: ToastPosition[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'bottom-center'];

    positions.forEach((position) => {
      it(`should accept ${position} position`, () => {
        component.position = position;
        expect(component.position).toBe(position);
      });
    });
  });

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after specified duration', fakeAsync(() => {
      spyOn(component.onClose, 'emit');
      component.autoDismissMs = 1000;
      component.ngOnInit();
      tick(1000);
      expect(component.onClose.emit).toHaveBeenCalled();
    }));

    it('should not auto-dismiss when autoDismissMs is 0', fakeAsync(() => {
      spyOn(component.onClose, 'emit');
      component.autoDismissMs = 0;
      component.ngOnInit();
      tick(5000);
      expect(component.onClose.emit).not.toHaveBeenCalled();
    }));

    it('should use default auto-dismiss duration of 4000ms', fakeAsync(() => {
      spyOn(component.onClose, 'emit');
      component.ngOnInit();
      tick(4000);
      expect(component.onClose.emit).toHaveBeenCalled();
    }));

    it('should clear timer on component destroy', fakeAsync(() => {
      spyOn(component.onClose, 'emit');
      component.autoDismissMs = 5000;
      component.ngOnInit();
      tick(2000);
      component.ngOnDestroy();
      tick(3000);
      expect(component.onClose.emit).not.toHaveBeenCalled();
    }));
  });

  describe('Close Button', () => {
    it('should emit onClose event when close button is clicked', () => {
      spyOn(component.onClose, 'emit');
      const closeButton = fixture.nativeElement.querySelector('.toast-close');
      closeButton.click();
      expect(component.onClose.emit).toHaveBeenCalled();
    });

    it('should have proper aria-label on close button', () => {
      component.type = 'success';
      fixture.detectChanges();
      const closeButton = fixture.nativeElement.querySelector('.toast-close');
      expect(closeButton.getAttribute('aria-label')).toContain('success');
    });

    it('should clear auto-dismiss timer when close button is clicked', fakeAsync(() => {
      spyOn(component.onClose, 'emit');
      component.autoDismissMs = 5000;
      component.ngOnInit();
      tick(2000);
      component.handleClose();
      tick(3000);
      expect(component.onClose.emit).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      const toastElement = fixture.nativeElement.querySelector('.toast');
      expect(toastElement.getAttribute('role')).toBe('alert');
    });

    it('should have aria-live="polite"', () => {
      const toastElement = fixture.nativeElement.querySelector('.toast');
      expect(toastElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-atomic="true"', () => {
      const toastElement = fixture.nativeElement.querySelector('.toast');
      expect(toastElement.getAttribute('aria-atomic')).toBe('true');
    });

    it('should have aria-hidden on icon', () => {
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('.toast-icon svg');
      expect(icon.parentElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have aria-label on close button', () => {
      const closeButton = fixture.nativeElement.querySelector('.toast-close');
      expect(closeButton.hasAttribute('aria-label')).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should have default values', () => {
      expect(component.type).toBe('info');
      expect(component.message).toBe('');
      expect(component.position).toBe('bottom-right');
      expect(component.autoDismissMs).toBe(4000);
    });

    it('should accept custom type', () => {
      component.type = 'error';
      expect(component.type).toBe('error');
    });

    it('should accept custom message', () => {
      component.message = 'Custom message';
      expect(component.message).toBe('Custom message');
    });

    it('should accept custom position', () => {
      component.position = 'top-left';
      expect(component.position).toBe('top-left');
    });

    it('should accept custom autoDismissMs', () => {
      component.autoDismissMs = 2000;
      expect(component.autoDismissMs).toBe(2000);
    });
  });

  describe('Event Handling', () => {
    it('should emit onClose event', () => {
      spyOn(component.onClose, 'emit');
      component.handleClose();
      expect(component.onClose.emit).toHaveBeenCalled();
    });

    it('should handle multiple close events', () => {
      spyOn(component.onClose, 'emit');
      component.handleClose();
      component.handleClose();
      expect(component.onClose.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('Animation', () => {
    it('should have animation trigger', () => {
      const toastElement = fixture.nativeElement.querySelector('.toast');
      expect(toastElement).toBeTruthy();
      // Animation is applied via @toastAnimation trigger
    });
  });

  describe('Message Display', () => {
    it('should display long messages', () => {
      const longMessage = 'This is a very long message that should be displayed in the toast notification component';
      component.message = longMessage;
      fixture.detectChanges();
      const messageElement = fixture.nativeElement.querySelector('.toast-message');
      expect(messageElement.textContent).toContain(longMessage);
    });

    it('should display empty message', () => {
      component.message = '';
      fixture.detectChanges();
      const messageElement = fixture.nativeElement.querySelector('.toast-message');
      expect(messageElement.textContent).toBe('');
    });

    it('should display special characters in message', () => {
      component.message = 'Error: @#$%^&*()';
      fixture.detectChanges();
      const messageElement = fixture.nativeElement.querySelector('.toast-message');
      expect(messageElement.textContent).toContain('Error: @#$%^&*()');
    });
  });

  describe('Type-specific Behavior', () => {
    it('should render success icon for success type', () => {
      component.type = 'success';
      fixture.detectChanges();
      const successIcon = fixture.nativeElement.querySelector('.toast-success svg');
      expect(successIcon).toBeTruthy();
    });

    it('should render error icon for error type', () => {
      component.type = 'error';
      fixture.detectChanges();
      const errorIcon = fixture.nativeElement.querySelector('.toast-error svg');
      expect(errorIcon).toBeTruthy();
    });

    it('should render warning icon for warning type', () => {
      component.type = 'warning';
      fixture.detectChanges();
      const warningIcon = fixture.nativeElement.querySelector('.toast-warning svg');
      expect(warningIcon).toBeTruthy();
    });

    it('should render info icon for info type', () => {
      component.type = 'info';
      fixture.detectChanges();
      const infoIcon = fixture.nativeElement.querySelector('.toast-info svg');
      expect(infoIcon).toBeTruthy();
    });
  });
});
