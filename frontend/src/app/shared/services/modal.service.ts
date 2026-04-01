import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actions?: ModalAction[];
}

export interface ModalAction {
  label: string;
  callback: () => void;
  type?: 'primary' | 'secondary' | 'danger';
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  public modal$ = this.modalSubject.asObservable();

  show(config: ModalConfig): void {
    this.modalSubject.next(config);
    if (config.duration) {
      setTimeout(() => this.close(), config.duration);
    }
  }

  confirm(title: string, message: string, confirmLabel = 'Confirm', cancelLabel = 'Cancel', type: 'warning' | 'info' | 'error' = 'warning'): Observable<boolean> {
    const result$ = new Subject<boolean>();

    this.show({
      title,
      message,
      type,
      actions: [
        {
          label: cancelLabel,
          type: 'secondary',
          callback: () => {
            this.close();
            result$.next(false);
            result$.complete();
          }
        },
        {
          label: confirmLabel,
          type: type === 'error' ? 'danger' : 'primary',
          callback: () => {
            this.close();
            result$.next(true);
            result$.complete();
          }
        }
      ]
    });

    return result$.asObservable();
  }

  close(): void {
    this.modalSubject.next(null);
  }

  success(message: string, duration = 3000): void {
    this.show({
      title: 'Success',
      message,
      type: 'success',
      duration,
    });
  }

  error(message: string, duration = 5000): void {
    this.show({
      title: 'Error',
      message,
      type: 'error',
      duration,
    });
  }

  warning(message: string, duration = 4000): void {
    this.show({
      title: 'Warning',
      message,
      type: 'warning',
      duration,
    });
  }

  info(message: string, duration = 3000): void {
    this.show({
      title: 'Info',
      message,
      type: 'info',
      duration,
    });
  }
}
