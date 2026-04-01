import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/Button/button.component';
import { CardComponent } from '../../shared/components/Card/card.component';
import { SpinnerComponent } from '../../shared/components/Loading';
import { FormInputComponent } from '../../shared/components/FormInput/form-input.component';
import { ApiService } from '../../core/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { UserContextService } from '../../core/services/user-context.service';
import { Subject, of } from 'rxjs';
import { takeUntil, switchMap, tap } from 'rxjs/operators';

interface UserProfile {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  statistics: {
    workouts: number;
    followers: number;
    following: number;
  };
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  activityType: 'workout' | 'goal' | 'nutrition' | 'achievement';
  description: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked: boolean;
  reactions?: Reaction[];
}

interface Reaction {
  type: 'like' | 'love' | 'fire' | 'celebrate';
  count: number;
  userReacted: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  text: string;
  timestamp: string;
}

interface UserCard {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  statistics: {
    workouts: number;
    followers: number;
  };
  isFollowing: boolean;
}

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonComponent, 
    CardComponent, 
    SpinnerComponent, 
    FormInputComponent
  ],
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialComponent implements OnInit, OnDestroy {
  // User Profile
  userProfile: UserProfile | null = null;

  // Activity Feed
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  selectedActivityForComments: Activity | null = null;
  showCommentsModal = false;
  newComment = '';

  // Find Friends
  suggestedUsers: UserCard[] = [];
  searchQuery = '';
  searchResults: UserCard[] = [];
  showSearchResults = false;

  // Loading and UI states
  loading = false;
  loadingMore = false;
  currentActivityFilter: 'all' | 'workout' | 'goal' | 'nutrition' | 'achievement' = 'all';

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private userContext: UserContextService
  ) {}

  ngOnInit() {
    this.loadSocialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSocialData() {
    this.loading = true;
    this.userContext.userId$
      .pipe(
        switchMap(userId => {
          if (!userId) return of({ profile: null, activities: [], suggestedUsers: [] });
          return this.apiService.get('/social');
        }),
        tap(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.profile) {
            this.userProfile = response.profile;
          }
          if (response && response.activities) {
            this.activities = response.activities;
          }
          if (response && response.suggestedUsers) {
            this.suggestedUsers = response.suggestedUsers;
          }
          this.filterActivities('all');
        },
        error: (error) => {
          console.error('Error loading social data:', error);
          this.loading = false;
          this.modalService.error('Failed to load social data');
        }
      });
  }

  filterActivities(filter: 'all' | 'workout' | 'goal' | 'nutrition' | 'achievement') {
    this.currentActivityFilter = filter;
    if (filter === 'all') {
      this.filteredActivities = this.activities;
    } else {
      this.filteredActivities = this.activities.filter(a => a.activityType === filter);
    }
  }

  likeActivity(activity: Activity) {
    activity.liked = !activity.liked;
    activity.likes += activity.liked ? 1 : -1;
    
    this.apiService.post(`/social/activities/${activity.id}/like`, { liked: activity.liked })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Error liking activity:', error);
          activity.liked = !activity.liked;
          activity.likes += activity.liked ? 1 : -1;
        }
      });
  }

  addReaction(activity: Activity, reactionType: 'like' | 'love' | 'fire' | 'celebrate') {
    const reaction = activity.reactions?.find(r => r.type === reactionType);
    if (reaction) {
      reaction.userReacted = !reaction.userReacted;
      reaction.count += reaction.userReacted ? 1 : -1;
    }

    this.apiService.post(`/social/activities/${activity.id}/reaction`, { type: reactionType })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Error adding reaction:', error);
          if (reaction) {
            reaction.userReacted = !reaction.userReacted;
            reaction.count += reaction.userReacted ? 1 : -1;
          }
        }
      });
  }

  openCommentsModal(activity: Activity) {
    this.selectedActivityForComments = activity;
    this.showCommentsModal = true;
    this.newComment = '';
  }

  closeCommentsModal() {
    this.showCommentsModal = false;
    this.selectedActivityForComments = null;
    this.newComment = '';
  }

  addComment() {
    if (!this.newComment.trim() || !this.selectedActivityForComments) {
      return;
    }

    const activity = this.selectedActivityForComments;
    this.apiService.post(`/social/activities/${activity.id}/comment`, { text: this.newComment })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.comment) {
            activity.comments += 1;
            this.newComment = '';
            this.modalService.success('Comment added');
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.modalService.error('Failed to add comment');
        }
      });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.showSearchResults = false;
      this.searchResults = [];
      return;
    }

    this.apiService.get(`/social/search?q=${encodeURIComponent(this.searchQuery)}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.searchResults = response.users || [];
          this.showSearchResults = true;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.modalService.error('Failed to search users');
        }
      });
  }

  followUser(user: UserCard) {
    user.isFollowing = !user.isFollowing;
    
    this.apiService.post(`/social/users/${user.id}/follow`, { follow: user.isFollowing })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.modalService.success(user.isFollowing ? 'Following user' : 'Unfollowed user');
        },
        error: (error) => {
          console.error('Error following user:', error);
          user.isFollowing = !user.isFollowing;
          this.modalService.error('Failed to follow user');
        }
      });
  }

  getActivityIcon(activityType: string): string {
    const icons: { [key: string]: string } = {
      'workout': '💪',
      'goal': '🎯',
      'nutrition': '🥗',
      'achievement': '🏆'
    };
    return icons[activityType] || '📌';
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}
