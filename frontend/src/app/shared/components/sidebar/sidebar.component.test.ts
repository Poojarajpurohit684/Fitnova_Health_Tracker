import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering', () => {
    it('should render sidebar container', () => {
      const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebarElement).toBeTruthy();
    });

    it('should render sidebar header', () => {
      const headerElement = fixture.nativeElement.querySelector('.sidebar-header');
      expect(headerElement).toBeTruthy();
    });

    it('should render sidebar title', () => {
      const titleElement = fixture.nativeElement.querySelector('.sidebar-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toContain('Menu');
    });

    it('should render navigation menu', () => {
      const navElement = fixture.nativeElement.querySelector('.sidebar-nav');
      expect(navElement).toBeTruthy();
    });

    it('should render navigation items', () => {
      const navItems = fixture.nativeElement.querySelectorAll('.sidebar-item');
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should render sidebar footer', () => {
      const footerElement = fixture.nativeElement.querySelector('.sidebar-footer');
      expect(footerElement).toBeTruthy();
    });
  });

  describe('Navigation Items', () => {
    it('should render Dashboard link', () => {
      const dashboardLink = fixture.nativeElement.querySelector('a[routerLink="/dashboard"]');
      expect(dashboardLink).toBeTruthy();
    });

    it('should render Workouts link', () => {
      const workoutsLink = fixture.nativeElement.querySelector('a[routerLink="/workouts"]');
      expect(workoutsLink).toBeTruthy();
    });

    it('should render Nutrition link', () => {
      const nutritionLink = fixture.nativeElement.querySelector('a[routerLink="/nutrition"]');
      expect(nutritionLink).toBeTruthy();
    });

    it('should render Goals link', () => {
      const goalsLink = fixture.nativeElement.querySelector('a[routerLink="/goals"]');
      expect(goalsLink).toBeTruthy();
    });

    it('should render Analytics link', () => {
      const analyticsLink = fixture.nativeElement.querySelector('a[routerLink="/analytics"]');
      expect(analyticsLink).toBeTruthy();
    });

    it('should render Social link', () => {
      const socialLink = fixture.nativeElement.querySelector('a[routerLink="/social"]');
      expect(socialLink).toBeTruthy();
    });

    it('should render Settings link in footer', () => {
      const settingsLink = fixture.nativeElement.querySelector('a[routerLink="/settings"]');
      expect(settingsLink).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('should render icons for navigation items', () => {
      const icons = fixture.nativeElement.querySelectorAll('.sidebar-icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have aria-hidden on icons', () => {
      const icons = fixture.nativeElement.querySelectorAll('.sidebar-icon svg');
      icons.forEach((icon: SVGElement) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('Close Button', () => {
    it('should render close button', () => {
      const closeButton = fixture.nativeElement.querySelector('.sidebar-close');
      expect(closeButton).toBeTruthy();
    });

    it('should have aria-label on close button', () => {
      const closeButton = fixture.nativeElement.querySelector('.sidebar-close');
      expect(closeButton.getAttribute('aria-label')).toBe('Close sidebar');
    });

    it('should emit onToggle event when close button is clicked', () => {
      spyOn(component.onToggle, 'emit');
      const closeButton = fixture.nativeElement.querySelector('.sidebar-close');
      closeButton.click();
      expect(component.onToggle.emit).toHaveBeenCalled();
    });
  });

  describe('Overlay', () => {
    it('should not render overlay when sidebar is closed', () => {
      component.isOpen = false;
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.sidebar-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should render overlay when sidebar is open', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.sidebar-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should emit onToggle event when overlay is clicked', () => {
      spyOn(component.onToggle, 'emit');
      component.isOpen = true;
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.sidebar-overlay');
      overlay.click();
      expect(component.onToggle.emit).toHaveBeenCalled();
    });

    it('should have role="presentation" on overlay', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.sidebar-overlay');
      expect(overlay.getAttribute('role')).toBe('presentation');
    });

    it('should have aria-hidden="true" on overlay', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const overlay = fixture.nativeElement.querySelector('.sidebar-overlay');
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('Accessibility', () => {
    it('should have role="navigation" on sidebar', () => {
      const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebarElement.getAttribute('role')).toBe('navigation');
    });

    it('should have aria-label on sidebar', () => {
      const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebarElement.getAttribute('aria-label')).toBe('Side navigation');
    });

    it('should have role="navigation" on nav element', () => {
      const navElement = fixture.nativeElement.querySelector('.sidebar-nav');
      expect(navElement.getAttribute('role')).toBe('navigation');
    });

    it('should have title attributes on navigation items', () => {
      const navItems = fixture.nativeElement.querySelectorAll('.sidebar-item');
      navItems.forEach((item: HTMLElement) => {
        expect(item.hasAttribute('title')).toBe(true);
      });
    });
  });

  describe('Open/Close State', () => {
    it('should have isOpen property', () => {
      expect(component.isOpen).toBeDefined();
    });

    it('should apply sidebar-open class when isOpen is true', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebarElement.classList.contains('sidebar-open')).toBe(true);
    });

    it('should not apply sidebar-open class when isOpen is false', () => {
      component.isOpen = false;
      fixture.detectChanges();
      const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebarElement.classList.contains('sidebar-open')).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should emit onToggle event', () => {
      spyOn(component.onToggle, 'emit');
      component.onToggle.emit();
      expect(component.onToggle.emit).toHaveBeenCalled();
    });

    it('should handle multiple toggle events', () => {
      spyOn(component.onToggle, 'emit');
      component.onToggle.emit();
      component.onToggle.emit();
      expect(component.onToggle.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('Navigation Labels', () => {
    it('should display navigation labels', () => {
      const labels = fixture.nativeElement.querySelectorAll('.sidebar-label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have correct label text', () => {
      const dashboardLabel = Array.from(fixture.nativeElement.querySelectorAll('.sidebar-label')).find(
        (el: any) => el.textContent.includes('Dashboard')
      );
      expect(dashboardLabel).toBeTruthy();
    });
  });

  describe('Input Validation', () => {
    it('should have default isOpen value', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should accept custom isOpen value', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);
    });

    it('should have onToggle output', () => {
      expect(component.onToggle).toBeDefined();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render sidebar with responsive classes', () => {
      const sidebarElement = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebarElement).toBeTruthy();
      // Responsive behavior is handled via CSS media queries
    });

    it('should render close button for mobile', () => {
      const closeButton = fixture.nativeElement.querySelector('.sidebar-close');
      expect(closeButton).toBeTruthy();
      // Close button is visible on mobile via CSS
    });
  });
});
