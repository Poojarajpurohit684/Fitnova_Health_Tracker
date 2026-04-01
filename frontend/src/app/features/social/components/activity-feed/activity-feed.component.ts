import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, ActivityFeed } from '../../services/social.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="activity-feed-wrapper">
      <div class="feed-header">
        <h1>Activity Feed</h1>
        <p class="subtitle">See what your connections are up to</p>
      </div>

      <div class="feed-container" *ngIf="activities && activities.length > 0; else emptyState">
        <div class="activity-item" *ngFor="let activity of activities">
          <div class="activity-avatar">
            <img
              *ngIf="activity.user?.profilePicture"
              [src]="activity.user?.profilePicture || ''"
              [alt]="activity.user?.firstName"
              class="avatar-img"
            />
            <div *ngIf="!activity.user?.profilePicture" class="avatar-placeholder">
              {{ (activity.user?.firstName || 'U').charAt(0) }}
            </div>
          </div>

          <div class="activity-content">
            <div class="activity-header">
              <span class="user-name">
                {{ activity.user?.firstName }} {{ activity.user?.lastName }}
              </span>
              <span class="activity-type" [ngClass]="'type-' + activity.activityType">
                {{ formatActivityType(activity.activityType) }}
              </span>
            </div>
            <p class="activity-description">{{ activity.description }}</p>
            <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
          </div>

          <button class="delete-btn" (click)="deleteActivity(activity._id)" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>

        <div class="load-more" *ngIf="hasMore">
          <button (click)="loadMore()" class="load-more-btn">Load More</button>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>No activities yet</h3>
          <p>Connect with other users to see their activities</p>
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
      --danger: #EF4444;
    }

    .activity-feed-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .feed-header {
      margin-bottom: 2rem;
    }

    .feed-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      color: var(--primary);
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: var(--text-light);
      font-size: 0.95rem;
    }

    .feed-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .activity-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-color: var(--secondary);
    }

    .activity-avatar {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
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
      font-size: 1.2rem;
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .user-name {
      font-weight: 700;
      color: var(--primary);
    }

    .activity-type {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .activity-type.type-workout {
      background: #DBEAFE;
      color: #1E40AF;
    }

    .activity-type.type-goal_achieved {
      background: #DCFCE7;
      color: #166534;
    }

    .activity-type.type-connection_made {
      background: #F3E8FF;
      color: #6B21A8;
    }

    .activity-type.type-milestone {
      background: #FEF3C7;
      color: #92400E;
    }

    .activity-description {
      margin: 0.5rem 0;
      color: var(--text);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .activity-time {
      font-size: 0.85rem;
      color: var(--text-light);
    }

    .delete-btn {
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-btn:hover {
      background: #FEE2E2;
      color: var(--danger);
    }

    .load-more {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .load-more-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .load-more-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
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

    @media (max-width: 640px) {
      .activity-feed-wrapper {
        max-width: 100%;
      }

      .activity-item {
        padding: 1rem;
      }

      .activity-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class ActivityFeedComponent implements OnInit {
  activities: ActivityFeed[] = [];
  hasMore = true;
  private limit = 20;
  private offset = 0;

  constructor(private socialService: SocialService, private modalService: ModalService) {}

  ngOnInit() {
    this.loadActivityFeed();
  }

  loadActivityFeed() {
    this.socialService.getActivityFeed(this.limit, this.offset).subscribe(
      (response) => {
        this.activities = [...this.activities, ...response.activities];
        this.hasMore = this.activities.length < response.total;
      },
      (error) => {
        this.modalService.error('Failed to load activity feed');
      }
    );
  }

  loadMore() {
    this.offset += this.limit;
    this.loadActivityFeed();
  }

  deleteActivity(activityId: string): void {
    this.modalService.confirm(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      'Delete',
      'Cancel',
      'error'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.socialService.deleteActivity(activityId).subscribe({
          next: () => {
            this.activities = this.activities.filter((a) => a._id !== activityId);
            this.modalService.success('Activity deleted');
          },
          error: (err) => {
            console.error('Error deleting activity:', err);
            this.modalService.error('Failed to delete activity');
          }
        });
      }
    });
  }

  formatActivityType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatTime(date: Date): string {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return activityDate.toLocaleDateString();
  }
}
