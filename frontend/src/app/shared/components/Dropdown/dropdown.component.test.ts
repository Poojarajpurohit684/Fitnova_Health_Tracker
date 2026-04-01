import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent, DropdownItem } from './dropdown.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;
  let compiled: DebugElement;

  const mockItems: DropdownItem[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3', disabled: true },
    { id: '4', label: 'Option 4' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    compiled = fixture.debugElement;
    component.items = mockItems;
    fixture.detectChanges();
  });

  describe('Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render dropdown container', () => {
      const dropdown = compiled.query(By.css('.dropdown'));
      expect(dropdown).toBeTruthy();
    });

    it('should render dropdown trigger button', () => {
      const trigger = compiled.query(By.css('.dropdown-trigger'));
      expect(trigger).toBeTruthy();
    });

    it('should have role="combobox"', () => {
      const dropdown = compiled.query(By.css('.dropdown'));
      expect(dropdown.nativeElement.getAttribute('role')).toBe('combobox');
    });

    it('should not render menu by default', () => {
      const menu = compiled.query(By.css('.dropdown-menu'));
      expect(menu).toBeFalsy();
    });
  });

  describe('Open/Close', () => {
    it('should open dropdown on trigger click', () => {
      const trigger = compiled.query(By.css('.dropdown-trigger'));
      trigger.nativeElement.click();
      fixture.detectChanges();
      expect(component.isOpen).toBe(true);
      const menu = compiled.query(By.css('.dropdown-menu'));
      expect(menu).toBeTruthy();
    });

    it('should close dropdown on trigger click when open', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const trigger = compiled.query(By.css('.dropdown-trigger'));
      trigger.nativeElement.click();
      fixture.detectChanges();
      expect(component.isOpen).toBe(false);
    });

    it('should toggle dropdown', () => {
      expect(component.isOpen).toBe(false);
      component.toggleDropdown();
      expect(component.isOpen).toBe(true);
      component.toggleDropdown();
      expect(component.isOpen).toBe(false);
    });

    it('should close dropdown on item select', () => {
      component.isOpen = true;
      fixture.detectChanges();
      component.selectItem(mockItems[0]);
      expect(component.isOpen).toBe(false);
    });

    it('should have dropdown-open class when open', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const dropdown = compiled.query(By.css('.dropdown'));
      expect(dropdown.nativeElement.classList.contains('dropdown-open')).toBe(true);
    });
  });

  describe('Menu Items', () => {
    it('should render all menu items when open', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items.length).toBe(mockItems.length);
    });

    it('should display correct item labels', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      items.forEach((item, index) => {
        expect(item.nativeElement.textContent).toContain(mockItems[index].label);
      });
    });

    it('should have role="option" on items', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      items.forEach((item) => {
        expect(item.nativeElement.getAttribute('role')).toBe('option');
      });
    });

    it('should disable disabled items', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items[2].nativeElement.disabled).toBe(true);
    });

    it('should have dropdown-item-disabled class for disabled items', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items[2].nativeElement.classList.contains('dropdown-item-disabled')).toBe(true);
    });
  });

  describe('Item Selection', () => {
    it('should emit onSelect event when item is clicked', (done) => {
      component.isOpen = true;
      fixture.detectChanges();

      component.onSelect.subscribe((item: DropdownItem) => {
        expect(item.id).toBe('1');
        done();
      });

      const items = compiled.queryAll(By.css('.dropdown-item'));
      items[0].nativeElement.click();
    });

    it('should not select disabled items', (done) => {
      component.isOpen = true;
      fixture.detectChanges();

      let selected = false;
      component.onSelect.subscribe(() => {
        selected = true;
      });

      const items = compiled.queryAll(By.css('.dropdown-item'));
      items[2].nativeElement.click();

      setTimeout(() => {
        expect(selected).toBe(false);
        done();
      }, 100);
    });

    it('should close dropdown after selecting item', () => {
      component.isOpen = true;
      fixture.detectChanges();
      component.selectItem(mockItems[0]);
      expect(component.isOpen).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open dropdown on Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.isOpen).toBe(true);
    });

    it('should open dropdown on Space key', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.isOpen).toBe(true);
    });

    it('should navigate down with ArrowDown key', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.focusedIndex).toBe(0);
    });

    it('should navigate up with ArrowUp key', () => {
      component.isOpen = true;
      component.focusedIndex = 2;
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.focusedIndex).toBe(1);
    });

    it('should select focused item on Enter key', (done) => {
      component.isOpen = true;
      component.focusedIndex = 0;
      fixture.detectChanges();

      component.onSelect.subscribe((item: DropdownItem) => {
        expect(item.id).toBe('1');
        done();
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
    });

    it('should close dropdown on Escape key', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.isOpen).toBe(false);
    });

    it('should not go below 0 on ArrowUp', () => {
      component.isOpen = true;
      component.focusedIndex = 0;
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.focusedIndex).toBe(-1);
    });

    it('should not go above items length on ArrowDown', () => {
      component.isOpen = true;
      component.focusedIndex = mockItems.length - 1;
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(component.focusedIndex).toBe(mockItems.length - 1);
    });
  });

  describe('Focus Management', () => {
    it('should set focused index on mouse enter', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      items[1].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      expect(component.focusedIndex).toBe(1);
    });

    it('should have dropdown-item-focused class for focused item', () => {
      component.isOpen = true;
      component.focusedIndex = 0;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items[0].nativeElement.classList.contains('dropdown-item-focused')).toBe(true);
    });

    it('should check if item is focused', () => {
      component.focusedIndex = 1;
      expect(component.isFocused(1)).toBe(true);
      expect(component.isFocused(0)).toBe(false);
    });
  });

  describe('CSS Classes', () => {
    it('should have dropdown class', () => {
      const dropdown = compiled.query(By.css('.dropdown'));
      expect(dropdown.nativeElement.classList.contains('dropdown')).toBe(true);
    });

    it('should have dropdown-open class when open', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const dropdown = compiled.query(By.css('.dropdown'));
      expect(dropdown.nativeElement.classList.contains('dropdown-open')).toBe(true);
    });

    it('should not have dropdown-open class when closed', () => {
      component.isOpen = false;
      fixture.detectChanges();
      const dropdown = compiled.query(By.css('.dropdown'));
      expect(dropdown.nativeElement.classList.contains('dropdown-open')).toBe(false);
    });

    it('should have correct item classes', () => {
      component.isOpen = true;
      component.focusedIndex = 0;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items[0].nativeElement.classList.contains('dropdown-item')).toBe(true);
      expect(items[0].nativeElement.classList.contains('dropdown-item-focused')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded on trigger', () => {
      const trigger = compiled.query(By.css('.dropdown-trigger'));
      expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('false');
      component.isOpen = true;
      fixture.detectChanges();
      expect(trigger.nativeElement.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have aria-haspopup on trigger', () => {
      const trigger = compiled.query(By.css('.dropdown-trigger'));
      expect(trigger.nativeElement.getAttribute('aria-haspopup')).toBe('true');
    });

    it('should have role="listbox" on menu', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const menu = compiled.query(By.css('.dropdown-menu'));
      expect(menu.nativeElement.getAttribute('role')).toBe('listbox');
    });

    it('should have aria-selected on focused item', () => {
      component.isOpen = true;
      component.focusedIndex = 0;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items[0].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(items[1].nativeElement.getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('Dropdown Classes Getter', () => {
    it('should return correct classes when closed', () => {
      component.isOpen = false;
      const classes = component.dropdownClasses;
      expect(classes).toContain('dropdown');
      expect(classes).not.toContain('dropdown-open');
    });

    it('should return correct classes when open', () => {
      component.isOpen = true;
      const classes = component.dropdownClasses;
      expect(classes).toContain('dropdown');
      expect(classes).toContain('dropdown-open');
    });
  });

  describe('Item Classes Getter', () => {
    it('should return correct classes for normal item', () => {
      const classes = component.getItemClasses(mockItems[0], 0);
      expect(classes).toContain('dropdown-item');
      expect(classes).not.toContain('dropdown-item-disabled');
      expect(classes).not.toContain('dropdown-item-focused');
    });

    it('should return correct classes for disabled item', () => {
      const classes = component.getItemClasses(mockItems[2], 2);
      expect(classes).toContain('dropdown-item');
      expect(classes).toContain('dropdown-item-disabled');
    });

    it('should return correct classes for focused item', () => {
      component.focusedIndex = 0;
      const classes = component.getItemClasses(mockItems[0], 0);
      expect(classes).toContain('dropdown-item');
      expect(classes).toContain('dropdown-item-focused');
    });
  });

  describe('Integration', () => {
    it('should render complete dropdown', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const dropdown = compiled.query(By.css('.dropdown'));
      const trigger = compiled.query(By.css('.dropdown-trigger'));
      const menu = compiled.query(By.css('.dropdown-menu'));
      const items = compiled.queryAll(By.css('.dropdown-item'));

      expect(dropdown).toBeTruthy();
      expect(trigger).toBeTruthy();
      expect(menu).toBeTruthy();
      expect(items.length).toBe(mockItems.length);
    });

    it('should handle full interaction cycle', (done) => {
      expect(component.isOpen).toBe(false);

      component.toggleDropdown();
      fixture.detectChanges();
      expect(component.isOpen).toBe(true);

      component.onSelect.subscribe((item: DropdownItem) => {
        expect(item.id).toBe('1');
        expect(component.isOpen).toBe(false);
        done();
      });

      component.selectItem(mockItems[0]);
    });
  });

  describe('Empty Items', () => {
    it('should handle empty items array', () => {
      component.items = [];
      component.isOpen = true;
      fixture.detectChanges();
      const items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items.length).toBe(0);
    });
  });

  describe('Dynamic Items', () => {
    it('should update items dynamically', () => {
      component.isOpen = true;
      fixture.detectChanges();
      let items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items.length).toBe(4);

      component.items = [
        { id: '1', label: 'New Option 1' },
        { id: '2', label: 'New Option 2' },
      ];
      fixture.detectChanges();
      items = compiled.queryAll(By.css('.dropdown-item'));
      expect(items.length).toBe(2);
    });
  });
});


  describe('Display and Layout', () => {
    it('should have relative positioning on dropdown', () => {
      const dropdown = compiled.query(By.css('.dropdown'));
      const styles = window.getComputedStyle(dropdown.nativeElement);
      expect(styles.position).toBe('relative');
    });

    it('should have inline-block display on dropdown', () => {
      const dropdown = compiled.query(By.css('.dropdown'));
      const styles = window.getComputedStyle(dropdown.nativeElement);
      expect(styles.display).toBe('inline-block');
    });

    it('should have absolute positioning on menu', () => {
      component.isOpen = true;
      fixture.detectChanges();
      const menu = compiled.query(By.css('.dropdown-menu'));
      const styles = window.getComputedStyle(menu.nativeElement);
      expect(styles.position).toBe('absolute');
    });
  });
});
