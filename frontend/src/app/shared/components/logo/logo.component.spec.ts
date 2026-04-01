import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Variants', () => {
    it('should render primary-mark variant', () => {
      component.variant = 'primary-mark';
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg[viewBox="0 0 64 64"]');
      expect(svg).toBeTruthy();
    });

    it('should render horizontal-lockup variant', () => {
      component.variant = 'horizontal-lockup';
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg[viewBox="0 0 240 64"]');
      expect(svg).toBeTruthy();
    });

    it('should render vertical-lockup variant', () => {
      component.variant = 'vertical-lockup';
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg[viewBox="0 0 80 140"]');
      expect(svg).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should apply small size class', () => {
      component.size = 'small';
      fixture.detectChanges();
      expect(component.logoContainerClasses).toContain('logo-small');
    });

    it('should apply medium size class', () => {
      component.size = 'medium';
      fixture.detectChanges();
      expect(component.logoContainerClasses).toContain('logo-medium');
    });

    it('should apply large size class', () => {
      component.size = 'large';
      fixture.detectChanges();
      expect(component.logoContainerClasses).toContain('logo-large');
    });

    it('should return correct pixel size for small', () => {
      component.size = 'small';
      expect(component.sizeInPixels).toBe(32);
    });

    it('should return correct pixel size for medium', () => {
      component.size = 'medium';
      expect(component.sizeInPixels).toBe(64);
    });

    it('should return correct pixel size for large', () => {
      component.size = 'large';
      expect(component.sizeInPixels).toBe(128);
    });
  });

  describe('Colors', () => {
    it('should apply primary color class', () => {
      component.color = 'primary';
      fixture.detectChanges();
      expect(component.logoContainerClasses).toContain('logo-primary');
    });

    it('should apply monochrome color class', () => {
      component.color = 'monochrome';
      fixture.detectChanges();
      expect(component.logoContainerClasses).toContain('logo-monochrome');
    });

    it('should apply inverted color class', () => {
      component.color = 'inverted';
      fixture.detectChanges();
      expect(component.logoContainerClasses).toContain('logo-inverted');
    });

    it('should return primary color hex for primary scheme', () => {
      component.color = 'primary';
      expect(component.strokeColor).toBe('#00D084');
      expect(component.textColor).toBe('#00D084');
    });

    it('should return monochrome color hex for monochrome scheme', () => {
      component.color = 'monochrome';
      expect(component.strokeColor).toBe('#111827');
      expect(component.textColor).toBe('#111827');
    });

    it('should return inverted color hex for inverted scheme', () => {
      component.color = 'inverted';
      expect(component.strokeColor).toBe('#FFFFFF');
      expect(component.textColor).toBe('#FFFFFF');
    });
  });

  describe('Accessibility', () => {
    it('should have role="img"', () => {
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.logo-container');
      expect(container.getAttribute('role')).toBe('img');
    });

    it('should have default aria-label', () => {
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.logo-container');
      expect(container.getAttribute('aria-label')).toBe('FitNova logo');
    });

    it('should use custom aria-label when provided', () => {
      component.ariaLabel = 'FitNova brand mark';
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.logo-container');
      expect(container.getAttribute('aria-label')).toBe('FitNova brand mark');
    });
  });

  describe('CSS Classes', () => {
    it('should combine all relevant classes', () => {
      component.variant = 'horizontal-lockup';
      component.size = 'large';
      component.color = 'inverted';
      fixture.detectChanges();
      const classes = component.logoContainerClasses;
      expect(classes).toContain('logo-container');
      expect(classes).toContain('logo-horizontal-lockup');
      expect(classes).toContain('logo-large');
      expect(classes).toContain('logo-inverted');
    });

    it('should have logo-svg class on SVG elements', () => {
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.classList.contains('logo-svg')).toBeTruthy();
    });
  });

  describe('SVG Rendering', () => {
    it('should render SVG with correct viewBox for primary-mark', () => {
      component.variant = 'primary-mark';
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('viewBox')).toBe('0 0 64 64');
    });

    it('should render SVG with correct viewBox for horizontal-lockup', () => {
      component.variant = 'horizontal-lockup';
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('viewBox')).toBe('0 0 240 64');
    });

    it('should render SVG with correct viewBox for vertical-lockup', () => {
      component.variant = 'vertical-lockup';
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('viewBox')).toBe('0 0 80 140');
    });

    it('should have preserveAspectRatio attribute', () => {
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    });

    it('should render circles in primary-mark', () => {
      component.variant = 'primary-mark';
      fixture.detectChanges();
      const circles = fixture.nativeElement.querySelectorAll('circle');
      expect(circles.length).toBe(3);
    });

    it('should render arrow lines in primary-mark', () => {
      component.variant = 'primary-mark';
      fixture.detectChanges();
      const lines = fixture.nativeElement.querySelectorAll('line');
      expect(lines.length).toBe(3); // shaft + 2 arrow heads
    });

    it('should render text in horizontal-lockup', () => {
      component.variant = 'horizontal-lockup';
      fixture.detectChanges();
      const text = fixture.nativeElement.querySelector('text');
      expect(text).toBeTruthy();
      expect(text.textContent).toContain('FitNova');
    });

    it('should render text in vertical-lockup', () => {
      component.variant = 'vertical-lockup';
      fixture.detectChanges();
      const text = fixture.nativeElement.querySelector('text');
      expect(text).toBeTruthy();
      expect(text.textContent).toContain('FitNova');
    });
  });

  describe('Default Values', () => {
    it('should have primary-mark as default variant', () => {
      expect(component.variant).toBe('primary-mark');
    });

    it('should have medium as default size', () => {
      expect(component.size).toBe('medium');
    });

    it('should have primary as default color', () => {
      expect(component.color).toBe('primary');
    });

    it('should have FitNova logo as default aria-label', () => {
      expect(component.ariaLabel).toBe('FitNova logo');
    });
  });
});
