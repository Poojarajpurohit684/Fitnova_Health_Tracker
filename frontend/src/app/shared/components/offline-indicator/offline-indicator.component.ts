import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../../core/services/offline.service';
import { Observable } from 'rxjs';

/**
 * OfflineIndicator Component
 * Displays offline status and queued requests
 */
@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!(isOnline$ | async)" class="offline-indicator">
      <div class="offline-banner">
        <span class="offline-icon">📡</span>
        <span class="offline-text">You are offline</span>
        <span class="queue-count" *ngIf="(queue$ | async) as queue">
          {{ queue.length }} request{{ queue.length !== 1 ? 's' : '' }} queued
        </span>
        <span class="syncing-indicator" *ngIf="isSyncing$ | async">
          Syncing...
        </span>
      </div>
    </div>
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
    }

    .offline-banner {
      background-color: #10b981;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .offline-icon {
      font-size: 18px;
    }

    .offline-text {
      flex: 1;
    }

    .queue-count {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .syncing-indicator {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit {
  isOnline$: Observable<boolean>;
  queue$: Observable<any[]>;
  isSyncing$: Observable<boolean>;

  constructor(private offlineService: OfflineService) {
    this.isOnline$ = this.offlineService.isOnline$;
    this.queue$ = this.offlineService.queue$;
    this.isSyncing$ = this.offlineService.isSyncing$;
  }

  ngOnInit(): void {
    // Component initialization
  }
}
