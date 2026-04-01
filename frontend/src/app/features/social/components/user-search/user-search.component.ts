import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService, User } from '../../services/social.service';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-wrapper">
      <div class="search-header">
        <h1>Find Users</h1>
        <p class="subtitle">Search and connect with other fitness enthusiasts</p>
      </div>

      <div class="search-box">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (keyup)="onSearch()"
          placeholder="Search by name or email..."
          class="search-input"
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      <div class="search-results" *ngIf="searchResults && searchResults.length > 0; else noResults">
        <div class="user-card" *ngFor="let user of searchResults">
          <div class="user-header">
            <div class="user-info">
              <div class="avatar">
                <img
                  *ngIf="user.profilePicture"
                  [src]="user.profilePicture"
                  [alt]="user.firstName"
                  class="avatar-img"
                />
                <div *ngIf="!user.profilePicture" class="avatar-placeholder">
                  {{ (user.firstName || 'U').charAt(0) }}
                </div>
              </div>
              <div class="user-details">
                <h3 class="user-name">{{ user.firstName }} {{ user.lastName }}</h3>
                <p class="user-email">{{ user.email }}</p>
                <p class="user-bio" *ngIf="user.bio">{{ user.bio }}</p>
              </div>
            </div>
          </div>

          <div class="user-stats" *ngIf="user.currentWeight || user.targetWeight">
            <div class="stat">
              <span class="stat-label">Current Weight</span>
              <span class="stat-value">{{ user.currentWeight }}kg</span>
            </div>
            <div class="stat">
              <span class="stat-label">Target Weight</span>
              <span class="stat-value">{{ user.targetWeight }}kg</span>
            </div>
          </div>

          <button class="btn-connect" (click)="sendConnectionRequest(user._id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="10" cy="7" r="4"></circle>
              <path d="M22 7h-6"></path>
              <path d="M19 4v6"></path>
            </svg>
            Connect
          </button>
        </div>
      </div>

      <ng-template #noResults>
        <div class="no-results" *ngIf="hasSearched">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3>No users found</h3>
          <p>Try searching with a different name or email</p>
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
    }

    .search-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-header {
      margin-bottom: 2rem;
    }

    .search-header h1 {
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

    .search-box {
      position: relative;
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--secondary);
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
    }

    .search-box svg {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
      pointer-events: none;
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-card {
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

    .user-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-color: var(--secondary);
    }

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    .user-email {
      margin: 0 0 0.25rem 0;
      font-size: 0.85rem;
      color: var(--text-light);
    }

    .user-bio {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .user-stats {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--light);
      border-radius: 8px;
    }

    .stat {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-light);
      font-weight: 600;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 1rem;
      color: var(--primary);
      font-weight: 700;
    }

    .btn-connect {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, var(--secondary), #0891b2);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-connect:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    }

    .no-results {
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

    .no-results svg {
      color: var(--text-light);
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .no-results h3 {
      margin: 0 0 0.5rem 0;
      color: var(--primary);
      font-size: 1.1rem;
    }

    .no-results p {
      margin: 0;
      color: var(--text-light);
      font-size: 0.95rem;
    }

    @media (max-width: 640px) {
      .search-wrapper {
        max-width: 100%;
      }

      .user-card {
        padding: 1rem;
      }

      .user-stats {
        flex-direction: column;
      }
    }
  `],
})
export class UserSearchComponent {
  searchQuery = '';
  searchResults: User[] = [];
  hasSearched = false;
  private searchTimeout: any;

  constructor(private socialService: SocialService, private modalService: ModalService) {}

  onSearch() {
    clearTimeout(this.searchTimeout);

    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.hasSearched = false;
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.socialService.searchUsers(this.searchQuery).subscribe(
        (response) => {
          this.searchResults = response.users;
          this.hasSearched = true;
        },
        (error) => {
          this.modalService.error('Failed to search users');
          this.hasSearched = true;
        }
      );
    }, 300);
  }

  sendConnectionRequest(userId: string) {
    this.socialService.sendConnectionRequest(userId).subscribe(
      () => {
        this.modalService.success('Connection request sent');
        this.searchResults = this.searchResults.filter((u) => u._id !== userId);
      },
      (error) => {
        this.modalService.error('Failed to send connection request');
      }
    );
  }
}
