import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './Alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  describe('Success Variant', () => {
    it('should render success alert with correct background color', () => {
      component.variant = 'success';
      component.message = 'Operation successful';
      fixture.detectChanges();

      const alertElement = fixture.nativeElement.querySelector('.alert-success');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent).toContain('Operation successful');
    });

    it('should display success icon when provided', () => {
      component.variant = 'success';
      component.message = 'Success message';
      component.icon = '✓';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.alert-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement.textContent).toContain('✓');
    });

    it('should apply success styling with correct colors', () => {
      component.variant = 'success';
      component.message = 'Test';
      fixture.detectChanges();

      const alertElement = fixture.nativeElement.querySelector('.alert-success');
      const styles = window.getComputedStyle(alertElement);
      
      expect(alertElement.classList.contains('alert-success')).toBe(true);
    });
  });

  describe('Warning Variant', () => {
    it('should render warning alert with correct styling', () => {
      component.variant = 'warning';
      component.message = 'Warning message';
      fixture.detectChanges();

      const alertElement = fixture.nativeElement.querySelector('.alert-warning');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent).toContain('Warning message');
    });

    it('should display warning icon when provided', () => {
      component.variant = 'warning';
      component.message = 'Warning';
      component.icon = '⚠';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.alert-icon');
      expect(iconElement.textContent).toContain('⚠');
    });
  });

  describe('Error Variant', () => {
    it('should render error alert with correct styling', () => {
      component.variant = 'error';
      component.message = 'Error occurred';
      fixture.detectChanges();

      const alertElement = fixture.nativeElement.querySelector('.alert-error');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent).toContain('Error occurred');
    });

    it('should display error icon when provided', () => {
      component.variant = 'error';
      component.message = 'Error';
      component.icon = '✕';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.alert-icon');
      expect(iconElement.textContent).toContain('✕');
    });
  });

  describe('Info Variant', () => {
    it('should render info alert with correct styling', () => {
      component.variant = 'info';
      component.message = 'Information message';
      fixture.detectChanges();

      const alertElement = fixture.nativeElement.querySelector('.alert-info');
      expect(alertElement).toBeTruthy();
      expect(alertElement.textContent).toContain('Information message');
    });

    it('should display info icon when provided', () => {
      component.variant = 'info';
      component.message = 'Info';
      component.icon = 'ℹ';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.alert-icon');
      expect(iconElement.textContent).toContain('ℹ');
    });
  });

  describe('Icon Support', () => {
    it('should not display icon element when icon is not provided', () => {
      component.variant = 'success';
      component.message = 'No icon';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.alert-icon');
      expect(iconElement).toBeFalsy();
    });

    it('should display icon element when icon is provided', () => {
      component.variant = 'success';
      component.message = 'With icon';
      component.icon = '✓';
      fixture.detectChanges();

      const iconElement = fixture.nativeElement.querySelector('.alert-icon');
      expect(iconElement).toBeTruthy();
    });
  });

  describe('Message Display', () => {
    it('should display message text correctly', () => {
      component.variant = 'info';
      component.message = 'Test message content';
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('.alert-message');
      expect(messageElement.textContent).toContain('Test message content');
    });

    it('should handle long messages', () => {
      component.variant = 'warning';
      component.message = 'This is a very long warning message that should wrap properly and maintain readability';
      fixture.detectChanges();

      const messageElement = fixture.nativeElement.querySelector('.alert-message');
      expect(messageElement.textContent).toContain('This is a very long warning message');
    });
  });

  describe('Default Values', () => {
    it('should have info as default variant', () => {
      expect(component.variant).toBe('info');
    });

    it('should have empty message as default', () => {
      expect(component.message).toBe('');
    });

    it('should have no icon by default', () => {
      expect(component.icon).toBeUndefined();
    });

    it('should have dismissible as false by default', () => {
      expect(component.dismissible).toBe(false);
    });
  });
});
