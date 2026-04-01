import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * FormInputComponent - Reusable Form Input with Validation
 * 
 * Features:
 * - Label association with proper for/id linking
 * - Validation states: default, valid, invalid
 * - Real-time error messages
 * - Password visibility toggle (eye icon)
 * - Helper text support
 * - Full accessibility (ARIA labels, semantic HTML)
 * - ControlValueAccessor for reactive forms
 * - Dark mode support
 * - Responsive design
 * 
 * Usage:
 * <app-form-input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter email"
 *   formControlName="email"
 *   [validationState]="'invalid'"
 *   errorMessage="Invalid email">
 * </app-form-input>
 */

// Validation state type
export type ValidationState = 'default' | 'valid' | 'invalid';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-input.component.html',
  styleUrls: ['./FormInput.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor, OnInit {
  // Input properties
  @Input() label?: string;                          // Label text
  @Input() validationState: ValidationState = 'default'; // Validation state
  @Input() errorMessage?: string;                   // Error message
  @Input() helperText?: string;                     // Helper text
  @Input() required = false;                        // Required field
  @Input() type = 'text';                           // Input type (text, email, password, etc.)
  @Input() placeholder = '';                        // Placeholder text
  @Input() disabled = false;                        // Disabled state
  @Input() className = '';                          // CSS class name
  @Input() ariaLabel?: string;                      // Accessibility label
  @Input() ariaDescribedBy?: string;                // Accessibility description

  // Output events
  @Output() valueChange = new EventEmitter<string>(); // Value change event
  @Output() focusEvent = new EventEmitter<void>();   // Focus event
  @Output() blurEvent = new EventEmitter<void>();    // Blur event

  // Internal properties
  inputId: string = '';                             // Unique input ID
  errorId: string = '';                             // Error message ID
  helperId: string = '';                            // Helper text ID
  value: string = '';                               // Current value
  touched = false;                                  // Whether field has been touched
  showPassword = false;                             // Password visibility toggle

  // ControlValueAccessor callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Initialize component - Generate unique IDs
   */
  ngOnInit(): void {
    // Generate unique IDs for accessibility
    this.inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
    this.errorId = `${this.inputId}-error`;
    this.helperId = `${this.inputId}-helper`;
  }

  /**
   * Get aria-describedby attribute value
   * Links error and helper text to input for accessibility
   */
  getAriaDescribedBy(): string | undefined {
    const ids = [
      this.ariaDescribedBy,
      this.errorMessage && this.validationState === 'invalid' ? this.errorId : null,
      this.helperText && !this.errorMessage ? this.helperId : null,
    ]
      .filter(Boolean)
      .join(' ');

    return ids || undefined;
  }

  /**
   * Get CSS classes for input element
   */
  getInputClasses(): string {
    const classes = [
      'form-input',
      `form-input-${this.validationState}`,
      this.disabled ? 'form-input-disabled' : '',
      this.type === 'password' ? 'form-input-password' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return classes;
  }

  /**
   * Handle input value change
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  /**
   * Handle input focus
   */
  onInputFocus(): void {
    this.focusEvent.emit();
  }

  /**
   * Handle input blur
   */
  onInputBlur(): void {
    this.touched = true;
    this.onTouched();
    this.blurEvent.emit();
  }

  /**
   * ControlValueAccessor: Write value to component
   */
  writeValue(value: string): void {
    this.value = value || '';
  }

  /**
   * ControlValueAccessor: Register change callback
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * ControlValueAccessor: Register touched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * ControlValueAccessor: Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    if (this.type === 'password') {
      this.showPassword = !this.showPassword;
    }
  }

  /**
   * Get current input type (password or text)
   */
  getInputType(): string {
    if (this.type === 'password' && this.showPassword) {
      return 'text';
    }
    return this.type;
  }
}
