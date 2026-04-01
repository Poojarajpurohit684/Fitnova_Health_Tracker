import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocialService, Connection } from '../../services/social.service';
import { UserContextService } from '../../../../core/services/user-context.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-social-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="social-hub-wrapper">
      <div class="hub-header">
        <h1>Social Hub</h1>
        <p class="subtitle">Connect with other fitness enthusiasts and share your journey</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading social data...</p>
      </div>

      <div *ngIf="error" class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong>Failed to load social data</strong>
          <p>{{ error }}</p>
        </div>
      </div>

      <div *ngIf="!loading && !error">
        <div class="hub-grid">
          <div class="hub-card" routerLink="/social/connections">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>My Connections</h3>
            <p>{{ totalConnections }} connections</p>
            <span class="arrow">→</span>
          </div>

          <div class="hub-card" routerLink="/social/activity-feed">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>Activity Feed</h3>
            <p>See what your connections are doing</p>
            <span class="arrow">→</span>
          </div>

          <div class="hub-card" routerLink="/social/search">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <h3>Find Users</h3>
            <p>Search and connect with new people</p>
            <span class="arrow">→</span>
          </div>
        </div>

        <div class="connections-preview" *ngIf="recentConnections.length > 0">
          <h2>Recent Connections</h2>
          <div class="connections-list">
            <div class="connection-item" *ngFor="let conn of recentConnections">
              <div class="connection-avatar">{{ getInitials(conn.connectedUser?.firstName, conn.connectedUser?.lastName) }}</div>
              <div class="connection-info">
                <h4>{{ conn.connectedUser?.firstName }} {{ conn.connectedUser?.lastName }}</h4>
                <p class="connection-status" [ngClass]="'status-' + conn.status">{{ conn.status }}</p>
              </div>
              <div class="connection-actions">
                <button *ngIf="conn.status === 'pending'" class="action-btn accept" (click)="acceptConnection(conn._id)">Accept</button>
                <button *ngIf="conn.status === 'pending'" class="action-btn reject" (click)="rejectConnection(conn._id)">Reject</button>
                <button *ngIf="conn.status === 'accepted'" class="action-btn remove" (click)="removeConnection(conn._id)">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #10B981;
      --secondary: #3B82F6;
      --accent: #6EE7B7;
      --success: #10B981;
      --error: #EF4444;
      --text: #111827;
      --text-light: #6B7280;
      --border: #E5E7EB;
      --light: #F9FAFB;
    }

    .social-hub-wrapper {
      width: 100%;
    }

    .hub-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .hub-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: var(--primary);
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: var(--text-light);
      font-size: 1rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert {
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .alert svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .alert strong {
      display: block;
      margin-bottom: 0.5rem;
    }

    .alert p {
      margin: 0;
      font-size: 0.9rem;
    }

    .hub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .hub-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      border: 1px solid var(--border);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
      overflow: hidden;
    }

    .hub-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--secondary), var(--accent));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .hub-card:hover {
      box-shadow: 0 8px 24px rgba(255, 107, 107, 0.15);
      border-color: var(--primary);
      transform: translateY(-4px);
    }

    .hub-card:hover::before {
      transform: scaleX(1);
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .hub-card h3 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--primary);
      font-weight: 700;
    }

    .hub-card p {
      margin: 0;
      color: var(--text-light);
      font-size: 0.95rem;
      flex: 1;
    }

    .arrow {
      font-size: 1.5rem;
      color: var(--secondary);
      font-weight: 700;
      transition: transform 0.3s ease;
    }

    .hub-card:hover .arrow {
      transform: translateX(4px);
    }

    .connections-preview {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--border);
    }

    .connections-preview h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: var(--primary);
      font-weight: 700;
    }

    .connections-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .connection-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--light);
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .connection-item:hover {
      background: #f1f5f9;
      transform: translateX(4px);
    }

    .connection-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--secondary), var(--accent));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .connection-info {
      flex: 1;
    }

    .connection-info h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: var(--primary);
      font-weight: 700;
    }

    .connection-status {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .connection-status.status-pending {
      color: #F59E0B;
    }

    .connection-status.status-accepted {
      color: var(--success);
    }

    .connection-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      color: var(--secondary);
    }

    .action-btn:hover {
      background: rgba(6, 182, 212, 0.05);
      border-color: var(--secondary);
    }

    .action-btn.reject,
    .action-btn.remove {
      color: var(--error);
    }

    .action-btn.reject:hover,
    .action-btn.remove:hover {
      background: rgba(239, 68, 68, 0.05);
      border-color: var(--error);
    }

    .action-btn.accept {
      color: var(--success);
    }

    .action-btn.accept:hover {
      background: rgba(16, 185, 129, 0.05);
      border-color: var(--success);
    }

    @media (max-width: 768px) {
      .hub-header {
        margin-bottom: 2rem;
      }

      .hub-header h1 {
        font-size: 1.5rem;
      }

      .hub-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .hub-card {
        padding: 1.5rem;
      }

      .connection-item {
        flex-wrap: wrap;
      }

      .connection-actions {
        width: 100%;
        margin-top: 0.5rem;
      }

      .action-btn {
        flex: 1;
      }
    }
  `],
})
export class SocialHubComponent implements OnInit, OnDestroy {
  recentConnections: Connection[] = [];
  totalConnections = 0;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private socialService: SocialService,
    private userContext: UserContextService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadConnections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConnections(): void {
    this.loading = true;
    this.error = null;

    this.socialService.getConnections()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.recentConnections = response.connections.slice(0, 5);
          this.totalConnections = response.total;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading connections:', err);
          this.error = 'Failed to load connections. Please try again.';
          this.loading = false;
        }
      });
  }

  acceptConnection(connectionId: string): void {
    this.socialService.acceptConnectionRequest(connectionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadConnections();
          this.modalService.success('Connection accepted');
        },
        error: (err) => {
          console.error('Error accepting connection:', err);
          this.modalService.error('Failed to accept connection');
        }
      });
  }

  rejectConnection(connectionId: string): void {
    this.socialService.rejectConnectionRequest(connectionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadConnections();
          this.modalService.success('Connection rejected');
        },
        error: (err) => {
          console.error('Error rejecting connection:', err);
          this.modalService.error('Failed to reject connection');
        }
      });
  }

  removeConnection(connectionId: string): void {
    this.modalService.confirm(
      'Remove Connection',
      'Are you sure you want to remove this connection? You will no longer see their activities.',
      'Remove',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.socialService.removeConnection(connectionId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadConnections();
              this.modalService.success('Connection removed');
            },
            error: (err) => {
              console.error('Error removing connection:', err);
              this.modalService.error('Failed to remove connection');
            }
          });
      }
    });
  }

  getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return (first + last) || 'U';
  }
}
