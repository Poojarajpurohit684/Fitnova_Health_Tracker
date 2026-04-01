import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialComponent } from './social.component';
import { ApiService } from '../../core/services/api.service';
import { ModalService } from '../../shared/services/modal.service';
import { UserContextService } from '../../core/services/user-context.service';
import { of, throwError } from 'rxjs';

// Import Activity interface from component
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
  reactions?: Array<{ type: 'like' | 'love' | 'fire' | 'celebrate'; count: number; userReacted: boolean }>;
}

describe('SocialComponent', () => {
  let component: SocialComponent;
  let fixture: ComponentFixture<SocialComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let userContextService: jasmine.SpyObj<UserContextService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['success', 'error', 'show']);
    const userContextServiceSpy = jasmine.createSpyObj('UserContextService', [], {
      userId$: of('user123')
    });

    await TestBed.configureTestingModule({
      imports: [SocialComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: UserContextService, useValue: userContextServiceSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    userContextService = TestBed.inject(UserContextService) as jasmine.SpyObj<UserContextService>;

    fixture = TestBed.createComponent(SocialComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadSocialData', () => {
    it('should load social data on init', () => {
      const mockData = {
        profile: {
          id: '1',
          name: 'John Doe',
          statistics: { workouts: 10, followers: 5, following: 3 }
        },
        activities: [
          {
            id: '1',
            userId: 'user1',
            userName: 'Jane Smith',
            activityType: 'workout' as const,
            description: 'Completed a 5K run',
            timestamp: new Date().toISOString(),
            likes: 5,
            comments: 2,
            liked: false,
            reactions: []
          }
        ],
        suggestedUsers: []
      };

      apiService.get.and.returnValue(of(mockData));

      component.ngOnInit();

      expect(apiService.get).toHaveBeenCalledWith('/social');
      expect(component.userProfile).toEqual(mockData.profile);
      expect(component.activities).toEqual(mockData.activities);
    });

    it('should handle error loading social data', () => {
      apiService.get.and.returnValue(throwError(() => new Error('Network error')));

      component.ngOnInit();

      expect(modalService.error).toHaveBeenCalledWith('Failed to load social data');
    });
  });

  describe('filterActivities', () => {
    beforeEach(() => {
      component.activities = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Jane',
          activityType: 'workout' as const,
          description: 'Workout',
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          liked: false
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'John',
          activityType: 'goal' as const,
          description: 'Goal',
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          liked: false
        }
      ];
    });

    it('should filter activities by type', () => {
      component.filterActivities('workout');

      expect(component.filteredActivities.length).toBe(1);
      expect(component.filteredActivities[0].activityType).toBe('workout');
    });

    it('should show all activities when filter is "all"', () => {
      component.filterActivities('all');

      expect(component.filteredActivities.length).toBe(2);
    });
  });

  describe('likeActivity', () => {
    it('should toggle like on activity', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Workout',
        timestamp: new Date().toISOString(),
        likes: 5,
        comments: 0,
        liked: false
      };

      apiService.post.and.returnValue(of({}));

      component.likeActivity(activity);

      expect(activity.liked).toBe(true);
      expect(activity.likes).toBe(6);
      expect(apiService.post).toHaveBeenCalledWith('/social/activities/1/like', { liked: true });
    });

    it('should revert like on error', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Workout',
        timestamp: new Date().toISOString(),
        likes: 5,
        comments: 0,
        liked: false
      };

      apiService.post.and.returnValue(throwError(() => new Error('Error')));

      component.likeActivity(activity);

      expect(activity.liked).toBe(false);
      expect(activity.likes).toBe(5);
    });
  });

  describe('addReaction', () => {
    it('should add reaction to activity', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Workout',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        liked: false,
        reactions: [
          { type: 'like', count: 2, userReacted: false },
          { type: 'love', count: 1, userReacted: false }
        ]
      };

      apiService.post.and.returnValue(of({}));

      component.addReaction(activity, 'like');

      expect(activity.reactions![0].userReacted).toBe(true);
      expect(activity.reactions![0].count).toBe(3);
    });
  });

  describe('Comments Modal', () => {
    it('should open comments modal', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Workout',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        liked: false
      };

      component.openCommentsModal(activity);

      expect(component.showCommentsModal).toBe(true);
      expect(component.selectedActivityForComments).toEqual(activity);
    });

    it('should close comments modal', () => {
      component.showCommentsModal = true;
      component.newComment = 'Test comment';

      component.closeCommentsModal();

      expect(component.showCommentsModal).toBe(false);
      expect(component.selectedActivityForComments).toBeNull();
      expect(component.newComment).toBe('');
    });

    it('should add comment to activity', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Workout',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        liked: false
      };

      component.selectedActivityForComments = activity;
      component.newComment = 'Great workout!';

      apiService.post.and.returnValue(of({ comment: { id: '1', text: 'Great workout!' } }));

      component.addComment();

      expect(activity.comments).toBe(1);
      expect(component.newComment).toBe('');
      expect(modalService.success).toHaveBeenCalledWith('Comment added');
    });

    it('should not add empty comment', () => {
      component.newComment = '   ';

      component.addComment();

      expect(apiService.post).not.toHaveBeenCalled();
    });
  });

  describe('User Search', () => {
    it('should search users', () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          statistics: { workouts: 10, followers: 5 },
          isFollowing: false
        }
      ];

      apiService.get.and.returnValue(of({ users: mockUsers }));

      component.searchQuery = 'John';
      component.searchUsers();

      expect(apiService.get).toHaveBeenCalledWith('/social/search?q=John');
      expect(component.searchResults).toEqual(mockUsers);
      expect(component.showSearchResults).toBe(true);
    });

    it('should clear search results on empty query', () => {
      component.searchQuery = '';
      component.searchResults = [{ id: '1', name: 'John', statistics: { workouts: 0, followers: 0 }, isFollowing: false }];

      component.searchUsers();

      expect(component.showSearchResults).toBe(false);
      expect(component.searchResults).toEqual([]);
    });
  });

  describe('Follow User', () => {
    it('should follow user', () => {
      const user = {
        id: '1',
        name: 'Jane Doe',
        statistics: { workouts: 10, followers: 5 },
        isFollowing: false
      };

      apiService.post.and.returnValue(of({}));

      component.followUser(user);

      expect(user.isFollowing).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith('/social/users/1/follow', { follow: true });
      expect(modalService.success).toHaveBeenCalledWith('Following user');
    });

    it('should unfollow user', () => {
      const user = {
        id: '1',
        name: 'Jane Doe',
        statistics: { workouts: 10, followers: 5 },
        isFollowing: true
      };

      apiService.post.and.returnValue(of({}));

      component.followUser(user);

      expect(user.isFollowing).toBe(false);
      expect(apiService.post).toHaveBeenCalledWith('/social/users/1/follow', { follow: false });
      expect(modalService.success).toHaveBeenCalledWith('Unfollowed user');
    });
  });

  describe('Utility Methods', () => {
    it('should get activity icon', () => {
      expect(component.getActivityIcon('workout')).toBe('💪');
      expect(component.getActivityIcon('goal')).toBe('🎯');
      expect(component.getActivityIcon('nutrition')).toBe('🥗');
      expect(component.getActivityIcon('achievement')).toBe('🏆');
      expect(component.getActivityIcon('unknown')).toBe('📌');
    });

    it('should get initials from name', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
      expect(component.getInitials('Jane')).toBe('J');
      expect(component.getInitials()).toBe('U');
    });

    it('should format timestamp', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const oneDayAgo = new Date(now.getTime() - 86400000);

      expect(component.formatTimestamp(now.toISOString())).toBe('just now');
      expect(component.formatTimestamp(oneMinuteAgo.toISOString())).toContain('m ago');
      expect(component.formatTimestamp(oneHourAgo.toISOString())).toContain('h ago');
      expect(component.formatTimestamp(oneDayAgo.toISOString())).toContain('d ago');
    });
  });

  describe('Responsive Layout', () => {
    it('should render activity feed section', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Completed a 5K run',
        timestamp: new Date().toISOString(),
        likes: 5,
        comments: 2,
        liked: false
      };
      component.activities = [activity];
      component.filteredActivities = component.activities;

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.activity-feed-section')).toBeTruthy();
    });

    it('should render user profile section', () => {
      component.userProfile = {
        id: '1',
        name: 'John Doe',
        statistics: { workouts: 10, followers: 5, following: 3 }
      };

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.user-profile-section')).toBeTruthy();
    });

    it('should render find friends section', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.find-friends-section')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      const activity: Activity = {
        id: '1',
        userId: 'user1',
        userName: 'Jane',
        activityType: 'workout',
        description: 'Workout',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        liked: false
      };
      component.activities = [activity];
      component.filteredActivities = component.activities;

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const likeBtn = compiled.querySelector('.action-btn');
      expect(likeBtn?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have proper ARIA labels on filter buttons', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const filterBtns = compiled.querySelectorAll('.filter-btn');
      expect(filterBtns.length).toBeGreaterThan(0);
      filterBtns.forEach((btn: HTMLElement) => {
        expect(btn.getAttribute('aria-label')).toBeTruthy();
      });
    });
  });
});
