import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, Connection } from '../../services/social.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-connections-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="connections-wrapper">
      <div class="connections-header">
        <h1>My Connections</h1>
        <div class="filter-tabs">
          <button
            class="filter-tab"
            [class.active]="activeFilter === 'accepted'"
            (click)="setFilter('accepted')"
          >
            Connected
          </button>
          <button
            class="filter-tab"
            [class.active]="activeFilter === 'pending'"
            (click)="setFilter('pending')"
          >
            Pending
          </button>
        </div>
      </div>

      <div class="connections-grid" *ngIf="connections && connections.length > 0; else emptyState">
        <div class="connection-card" *ngFor="let connection of connections">
          <div class="card-header">
            <div class="user-info">
              <div class="avatar">
                <img
                  *ngIf="connection.connectedUser?.profilePicture"
                  [src]="connection.connectedUser?.profilePicture || ''"
                  [alt]="connection.connectedUser?.firstName"
                  class="avatar-img"
                />
                <div *ngIf="!connection.connectedUser?.profilePicture" class="avatar-placeholder">
                  {{ (connection.connectedUser?.firstName || 'U').charAt(0) }}
                </div>
              </div>
              <div class="user-details">
                <h3 class="user-name">
                  {{ connection.connectedUser?.firstName }} {{ connection.connectedUser?.lastName }}
                </h3>
                <p class="user-bio" *ngIf="connection.connectedUser?.bio">
                  {{ connection.connectedUser?.bio || '' }}
                </p>
              </div>
            </div>
            <span class="status-badge" [ngClass]="'status-' + connection.status">
              {{ formatStatus(connection.status) }}
            </span>
          </div>

          <div class="card-actions">
            <button
              *ngIf="connection.status === 'pending'"
              class="btn btn-primary"
              (click)="acceptConnection(connection._id)"
            >
              Accept
            </button>
            <button
              *ngIf="connection.status === 'pending'"
              class="btn btn-secondary"
              (click)="rejectConnection(connection._id)"
            >
              Reject
            </button>
            <button
              *ngIf="connection.status === 'accepted'"
              class="btn btn-danger"
              (click)="removeConnection(connection._id)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>No connections yet</h3>
          <p>Search for users and send connection requests to get started</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      --primary: #0F172A;
      --secondary: #06B6D4;
      --accent: #8B5CF6;
      --text: #1E293B;
      --text-light: #64748B;
      --border: #E2E8F0;
      --light: #F8FAFC;
      --success: #10B981;
      --danger: #EF4444;
    }

    .connections-wrapper {
      width: 100%;
    }

    .connections-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .connections-header h1 {
      margin: 0;
      font-size: 1.8rem;
      color: var(--primary);
      font-weight: 700;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .filter-tab {
      padding: 0.6rem 1.2rem;
      border: 1px solid var(--border);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: var(--text-light);
      transition: all 0.3s ease;
    }

    .filter-tab:hover {
      border-color: var(--secondary);
      color: var(--secondary);
    }

    .filter-tab.active {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      border-color: transparent;
    }

    .connections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .connection-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .connection-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-color: var(--secondary);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      gap: 1rem;
      flex: 1;
      min-width: 0;
    }

    .avatar {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--light);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--secondary), var(--accent));
      color: white;
      font-weight: 700;
      font-size: 1.4rem;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      color: var(--primary);
      font-weight: 700;
    }

    .user-bio {
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-light);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 0.4rem 0.8rem;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .status-badge.status-accepted {
      background: #DCFCE7;
      color: #166534;
    }

    .status-badge.status-pending {
      background: #FEF3C7;
      color: #92400E;
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      flex: 1;
      min-width: 100px;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--secondary), #0891b2);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    .btn-secondary {
      background: var(--light);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--border);
    }

    .btn-danger {
      background: #FEE2E2;
      color: var(--danger);
      border: 1px solid #FECACA;
    }

    .btn-danger:hover {
      background: #FCA5A5;
      color: white;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      background: white;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .empty-state svg {
      color: var(--text-light);
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--primary);
      font-size: 1.1rem;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-light);
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .connections-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-tabs {
        justify-content: center;
      }

      .connections-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class ConnectionsListComponent implements OnInit {
  connections: Connection[] = [];
  activeFilter: 'accepted' | 'pending' = 'accepted';

  constructor(private socialService: SocialService, private modalService: ModalService) {}

  ngOnInit() {
    this.loadConnections();
  }

  loadConnections() {
    this.socialService.getConnections(this.activeFilter).subscribe(
      (response) => {
        this.connections = response.connections;
      },
      (error) => {
        this.modalService.error('Failed to load connections');
      }
    );
  }

  setFilter(filter: 'accepted' | 'pending') {
    this.activeFilter = filter;
    this.loadConnections();
  }

  acceptConnection(connectionId: string) {
    this.socialService.acceptConnectionRequest(connectionId).subscribe(
      () => {
        this.loadConnections();
        this.modalService.success('Connection accepted');
      },
      (error: any) => {
        this.modalService.error('Failed to accept connection');
      }
    );
  }

  rejectConnection(connectionId: string) {
    this.socialService.rejectConnectionRequest(connectionId).subscribe(
      () => {
        this.loadConnections();
        this.modalService.success('Connection rejected');
      },
      (error: any) => {
        this.modalService.error('Failed to reject connection');
      }
    );
  }

  removeConnection(connectionId: string) {
    this.modalService.confirm(
      'Remove Connection',
      'Are you sure you want to remove this connection? You will no longer see their activities.',
      'Remove',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.socialService.removeConnection(connectionId).subscribe(
          () => {
            this.loadConnections();
            this.modalService.success('Connection removed');
          },
          (error) => {
            this.modalService.error('Failed to remove connection');
          }
        );
      }
    });
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
