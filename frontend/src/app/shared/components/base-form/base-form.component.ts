import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-base-form',
  template: '',
})
export abstract class BaseFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    protected notificationService: NotificationService,
    protected router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  abstract initializeForm(): void;
  abstract submitForm(): void;

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.error = null;
      this.submitForm();
    }
  }

  onCancel(): void {
    this.router.navigate([this.getRedirectPath()]);
  }

  protected getRedirectPath(): string {
    return '/dashboard';
  }

  protected handleSuccess(message: string, redirectPath?: string): void {
    this.loading = false;
    this.notificationService.success(message, 3000);
    if (redirectPath) {
      this.router.navigate([redirectPath]);
    }
  }

  protected handleError(message: string): void {
    this.loading = false;
    this.error = message;
    this.notificationService.error(message, 4000);
  }

  protected getFormValue(): any {
    return this.form.value;
  }

  protected setFormError(fieldName: string, error: string): void {
    const control = this.form.get(fieldName);
    if (control) {
      control.setErrors({ custom: error });
      control.markAsTouched();
    }
  }
}
