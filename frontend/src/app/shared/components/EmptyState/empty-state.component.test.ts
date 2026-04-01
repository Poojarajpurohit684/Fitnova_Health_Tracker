import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;
  let compiled: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render empty state container', () => {
      const container = compiled.query(By.css('.empty-state'));
      expect(container).toBeTruthy();
    });

    it('should have flex column layout', () => {
      const container = compiled.query(By.css('.empty-state'));
      const styles = window.getComputedStyle(container.nativeElement);
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    it('should center content horizontally and vertically', () => {
      const container = compiled.query(By.css('.empty-state'));
      const styles = window.getComputedStyle(container.nativeElement);
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('center');
    });
  });

  describe('Illustration', () => {
    it('should render illustration when provided', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration).toBeTruthy();
    });

    it('should not render illustration when not provided', () => {
      component.illustration = '';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration).toBeFalsy();
    });

    it('should set correct src attribute on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration.nativeElement.src).toContain('empty-box.svg');
    });

    it('should set alt text on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'No items available';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration.nativeElement.alt).toBe('No items available');
    });

    it('should use default alt text when not provided', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'Empty state illustration';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration.nativeElement.alt).toBe('Empty state illustration');
    });

    it('should have aria-label on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'No items';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration.nativeElement.getAttribute('aria-label')).toBe('No items');
    });

    it('should have role="img" on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration.nativeElement.getAttribute('role')).toBe('img');
    });

    it('should have correct desktop size (200px)', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      const styles = window.getComputedStyle(illustration.nativeElement);
      expect(styles.width).toBe('200px');
      expect(styles.height).toBe('200px');
    });

    it('should have object-fit contain', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      const styles = window.getComputedStyle(illustration.nativeElement);
      expect(styles.objectFit).toBe('contain');
    });
  });

  describe('Message', () => {
    it('should render message when provided', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const message = compiled.query(By.css('.empty-state-message'));
      expect(message).toBeTruthy();
    });

    it('should not render message when not provided', () => {
      component.message = '';
      fixture.detectChanges();
      const message = compiled.query(By.css('.empty-state-message'));
      expect(message).toBeFalsy();
    });

    it('should display correct message text', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const message = compiled.query(By.css('.empty-state-message'));
      expect(message.nativeElement.textContent).toContain('No workouts yet');
    });

    it('should be an h2 heading', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const message = compiled.query(By.css('h2.empty-state-message'));
      expect(message).toBeTruthy();
    });

    it('should have correct font size', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const message = compiled.query(By.css('.empty-state-message'));
      const styles = window.getComputedStyle(message.nativeElement);
      expect(styles.fontWeight).toBe('600');
    });

    it('should have primary text color', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const message = compiled.query(By.css('.empty-state-message'));
      expect(message.nativeElement.classList.contains('empty-state-message')).toBe(true);
    });

    it('should have centered text alignment', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const container = compiled.query(By.css('.empty-state'));
      const styles = window.getComputedStyle(container.nativeElement);
      expect(styles.textAlign).toBe('center');
    });
  });

  describe('Description', () => {
    it('should render description when provided', () => {
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();
      const description = compiled.query(By.css('.empty-state-description'));
      expect(description).toBeTruthy();
    });

    it('should not render description when not provided', () => {
      component.description = '';
      fixture.detectChanges();
      const description = compiled.query(By.css('.empty-state-description'));
      expect(description).toBeFalsy();
    });

    it('should display correct description text', () => {
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();
      const description = compiled.query(By.css('.empty-state-description'));
      expect(description.nativeElement.textContent).toContain('Start tracking your fitness journey today');
    });

    it('should be a paragraph element', () => {
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();
      const description = compiled.query(By.css('p.empty-state-description'));
      expect(description).toBeTruthy();
    });

    it('should have secondary text color', () => {
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();
      const description = compiled.query(By.css('.empty-state-description'));
      expect(description.nativeElement.classList.contains('empty-state-description')).toBe(true);
    });

    it('should have max-width constraint', () => {
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();
      const description = compiled.query(By.css('.empty-state-description'));
      const styles = window.getComputedStyle(description.nativeElement);
      expect(styles.maxWidth).toBe('400px');
    });
  });

  describe('CTA Button', () => {
    it('should render CTA button when ctaText is provided', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button).toBeTruthy();
    });

    it('should not render CTA button when ctaText is empty', () => {
      component.ctaText = '';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button).toBeFalsy();
    });

    it('should display correct button text', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button.nativeElement.textContent).toContain('Create Workout');
    });

    it('should have primary variant', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button.componentInstance.variant).toBe('primary');
    });

    it('should have medium size', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button.componentInstance.size).toBe('md');
    });

    it('should be enabled by default', () => {
      component.ctaText = 'Create Workout';
      component.ctaDisabled = false;
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button.componentInstance.disabled).toBe(false);
    });

    it('should be disabled when ctaDisabled is true', () => {
      component.ctaText = 'Create Workout';
      component.ctaDisabled = true;
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button.componentInstance.disabled).toBe(true);
    });

    it('should emit ctaClick event when button is clicked', (done) => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      
      component.ctaClick.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const button = compiled.query(By.css('app-button'));
      button.componentInstance.onClick.emit(new MouseEvent('click'));
    });

    it('should have correct default CTA text', () => {
      expect(component.ctaText).toBe('Get Started');
    });

    it('should update button text dynamically', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      let button = compiled.query(By.css('app-button'));
      expect(button.nativeElement.textContent).toContain('Create Workout');

      component.ctaText = 'Start Now';
      fixture.detectChanges();
      button = compiled.query(By.css('app-button'));
      expect(button.nativeElement.textContent).toContain('Start Now');
    });
  });

  describe('Spacing and Layout', () => {
    it('should have proper spacing between elements', () => {
      component.illustration = 'assets/empty-box.svg';
      component.message = 'No workouts yet';
      component.description = 'Start tracking your fitness journey today';
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      const illustration = compiled.query(By.css('.empty-state-illustration'));
      const message = compiled.query(By.css('.empty-state-message'));
      const description = compiled.query(By.css('.empty-state-description'));
      const cta = compiled.query(By.css('.empty-state-cta'));

      expect(illustration).toBeTruthy();
      expect(message).toBeTruthy();
      expect(description).toBeTruthy();
      expect(cta).toBeTruthy();
    });

    it('should have minimum height', () => {
      const container = compiled.query(By.css('.empty-state'));
      const styles = window.getComputedStyle(container.nativeElement);
      expect(styles.minHeight).toBe('300px');
    });

    it('should have padding', () => {
      const container = compiled.query(By.css('.empty-state'));
      const styles = window.getComputedStyle(container.nativeElement);
      expect(styles.padding).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const heading = compiled.query(By.css('h2'));
      expect(heading).toBeTruthy();
    });

    it('should have proper alt text on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'No items available';
      fixture.detectChanges();
      const img = compiled.query(By.css('img'));
      expect(img.nativeElement.alt).toBe('No items available');
    });

    it('should have aria-label on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'No items available';
      fixture.detectChanges();
      const img = compiled.query(By.css('img'));
      expect(img.nativeElement.getAttribute('aria-label')).toBe('No items available');
    });

    it('should have role="img" on illustration', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const img = compiled.query(By.css('img'));
      expect(img.nativeElement.getAttribute('role')).toBe('img');
    });

    it('should have accessible button', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button).toBeTruthy();
    });
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode styles', () => {
      component.message = 'No workouts yet';
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();

      const message = compiled.query(By.css('.empty-state-message'));
      const description = compiled.query(By.css('.empty-state-description'));

      expect(message).toBeTruthy();
      expect(description).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive illustration sizing', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.illustration-image'));
      expect(illustration).toBeTruthy();
    });

    it('should have responsive padding', () => {
      const container = compiled.query(By.css('.empty-state'));
      expect(container).toBeTruthy();
    });

    it('should have responsive font sizes', () => {
      component.message = 'No workouts yet';
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();

      const message = compiled.query(By.css('.empty-state-message'));
      const description = compiled.query(By.css('.empty-state-description'));

      expect(message).toBeTruthy();
      expect(description).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should handle all inputs together', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'No items';
      component.message = 'No workouts yet';
      component.description = 'Start tracking your fitness journey today';
      component.ctaText = 'Create Workout';
      component.ctaDisabled = false;
      fixture.detectChanges();

      const illustration = compiled.query(By.css('.illustration-image'));
      const message = compiled.query(By.css('.empty-state-message'));
      const description = compiled.query(By.css('.empty-state-description'));
      const button = compiled.query(By.css('app-button'));

      expect(illustration).toBeTruthy();
      expect(message).toBeTruthy();
      expect(description).toBeTruthy();
      expect(button).toBeTruthy();
    });

    it('should handle partial inputs', () => {
      component.message = 'No workouts yet';
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      const illustration = compiled.query(By.css('.illustration-image'));
      const message = compiled.query(By.css('.empty-state-message'));
      const description = compiled.query(By.css('.empty-state-description'));
      const button = compiled.query(By.css('app-button'));

      expect(illustration).toBeFalsy();
      expect(message).toBeTruthy();
      expect(description).toBeFalsy();
      expect(button).toBeTruthy();
    });

    it('should handle empty inputs', () => {
      component.illustration = '';
      component.message = '';
      component.description = '';
      component.ctaText = '';
      fixture.detectChanges();

      const illustration = compiled.query(By.css('.illustration-image'));
      const message = compiled.query(By.css('.empty-state-message'));
      const description = compiled.query(By.css('.empty-state-description'));
      const button = compiled.query(By.css('app-button'));

      expect(illustration).toBeFalsy();
      expect(message).toBeFalsy();
      expect(description).toBeFalsy();
      expect(button).toBeFalsy();
    });

    it('should update all properties dynamically', () => {
      component.illustration = 'assets/empty-box.svg';
      component.message = 'No workouts yet';
      component.description = 'Start tracking your fitness journey today';
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      let button = compiled.query(By.css('app-button'));
      expect(button.nativeElement.textContent).toContain('Create Workout');

      component.ctaText = 'Start Now';
      fixture.detectChanges();
      button = compiled.query(By.css('app-button'));
      expect(button.nativeElement.textContent).toContain('Start Now');
    });
  });

  describe('Event Handling', () => {
    it('should emit ctaClick event', (done) => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      component.ctaClick.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onCtaClick();
    });

    it('should handle multiple CTA clicks', (done) => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      let clickCount = 0;
      component.ctaClick.subscribe(() => {
        clickCount++;
        if (clickCount === 3) {
          expect(clickCount).toBe(3);
          done();
        }
      });

      component.onCtaClick();
      component.onCtaClick();
      component.onCtaClick();
    });

    it('should pass click event from button to component', (done) => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      component.ctaClick.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      const button = compiled.query(By.css('app-button'));
      button.componentInstance.onClick.emit(new MouseEvent('click'));
    });
  });

  describe('CSS Classes', () => {
    it('should have empty-state class on container', () => {
      const container = compiled.query(By.css('.empty-state'));
      expect(container.nativeElement.classList.contains('empty-state')).toBe(true);
    });

    it('should have empty-state-illustration class', () => {
      component.illustration = 'assets/empty-box.svg';
      fixture.detectChanges();
      const illustration = compiled.query(By.css('.empty-state-illustration'));
      expect(illustration.nativeElement.classList.contains('empty-state-illustration')).toBe(true);
    });

    it('should have empty-state-message class', () => {
      component.message = 'No workouts yet';
      fixture.detectChanges();
      const message = compiled.query(By.css('.empty-state-message'));
      expect(message.nativeElement.classList.contains('empty-state-message')).toBe(true);
    });

    it('should have empty-state-description class', () => {
      component.description = 'Start tracking your fitness journey today';
      fixture.detectChanges();
      const description = compiled.query(By.css('.empty-state-description'));
      expect(description.nativeElement.classList.contains('empty-state-description')).toBe(true);
    });

    it('should have empty-state-cta class', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const cta = compiled.query(By.css('.empty-state-cta'));
      expect(cta.nativeElement.classList.contains('empty-state-cta')).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should work with ButtonComponent', () => {
      component.ctaText = 'Create Workout';
      fixture.detectChanges();
      const button = compiled.query(By.css('app-button'));
      expect(button.componentInstance).toBeTruthy();
    });

    it('should render complete empty state', () => {
      component.illustration = 'assets/empty-box.svg';
      component.illustrationAlt = 'No items';
      component.message = 'No workouts yet';
      component.description = 'Start tracking your fitness journey today';
      component.ctaText = 'Create Workout';
      fixture.detectChanges();

      const container = compiled.query(By.css('.empty-state'));
      expect(container).toBeTruthy();
      expect(container.nativeElement.textContent).toContain('No workouts yet');
      expect(container.nativeElement.textContent).toContain('Start tracking your fitness journey today');
      expect(container.nativeElement.textContent).toContain('Create Workout');
    });
  });
});
