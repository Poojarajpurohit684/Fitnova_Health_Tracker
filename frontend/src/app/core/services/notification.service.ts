import { Injectable } from '@angular/core';
import { StateService, Notification } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private stateService: StateService) {}

  success(message: string, duration: number = 3000): void {
    this.stateService.addNotification({
      type: 'success',
      message,
      duration,
    });
  }

  error(message: string, duration: number = 5000): void {
    this.stateService.addNotification({
      type: 'error',
      message,
      duration,
    });
  }

  warning(message: string, duration: number = 4000): void {
    this.stateService.addNotification({
      type: 'warning',
      message,
      duration,
    });
  }

  info(message: string, duration: number = 3000): void {
    this.stateService.addNotification({
      type: 'info',
      message,
      duration,
    });
  }

  clear(): void {
    this.stateService.clearNotifications();
  }
}
