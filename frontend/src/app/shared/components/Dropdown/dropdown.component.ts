import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dropdown menu item interface
 */
export interface DropdownItem {
  id: string;
  label: string;
  disabled?: boolean;
}

/**
 * DropdownComponent
 * 
 * A reusable dropdown menu component with keyboard navigation and accessibility.
 * Supports open/close toggle, keyboard navigation, and click outside to close.
 * 
 * Features:
 * - Dropdown menu with items
 * - Open/close toggle
 * - Keyboard navigation (arrow keys, enter)
 * - Click outside to close
 * - ARIA attributes for accessibility
 * - Design tokens integration
 * - Dark mode support
 * - WCAG AA accessibility
 * 
 * @example
 * // Basic dropdown
 * <app-dropdown
 *   [items]="menuItems"
 *   (onSelect)="onMenuSelect($event)">
 *   Menu
 * </app-dropdown>
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
})
export class DropdownComponent {
  /** Dropdown menu items */
  @Input() items: DropdownItem[] = [];

  /** Event emitted when menu item is selected */
  @Output() onSelect = new EventEmitter<DropdownItem>();

  /** Whether dropdown is open */
  isOpen: boolean = false;

  /** Currently focused item index */
  focusedIndex: number = -1;

  @ViewChild('dropdownMenu') dropdownMenu?: ElementRef;

  /**
   * Get dropdown CSS classes
   */
  get dropdownClasses(): string {
    const classes = [
      'dropdown',
      this.isOpen && 'dropdown-open',
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }

  /**
   * Toggle dropdown open/close
   */
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.focusedIndex = -1;
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.isOpen = false;
    this.focusedIndex = -1;
  }

  /**
   * Select menu item
   */
  selectItem(item: DropdownItem): void {
    if (!item.disabled) {
      this.onSelect.emit(item);
      this.closeDropdown();
    }
  }

  /**
   * Handle keyboard navigation
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleDropdown();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex = Math.min(this.focusedIndex + 1, this.items.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex = Math.max(this.focusedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.focusedIndex >= 0) {
          this.selectItem(this.items[this.focusedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  /**
   * Handle click outside to close
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.dropdownMenu?.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  /**
   * Check if item is focused
   */
  isFocused(index: number): boolean {
    return this.focusedIndex === index;
  }

  /**
   * Get item CSS classes
   */
  getItemClasses(item: DropdownItem, index: number): string {
    const classes = [
      'dropdown-item',
      item.disabled && 'dropdown-item-disabled',
      this.isFocused(index) && 'dropdown-item-focused',
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }
}
