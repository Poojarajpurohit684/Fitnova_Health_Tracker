import { Routes } from '@angular/router';

export const SOCIAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/social-hub/social-hub.component').then(
        (m) => m.SocialHubComponent
      ),
  },
  {
    path: 'connections',
    loadComponent: () =>
      import('./components/connections-list/connections-list.component').then(
        (m) => m.ConnectionsListComponent
      ),
  },
  {
    path: 'activity-feed',
    loadComponent: () =>
      import('./components/activity-feed/activity-feed.component').then(
        (m) => m.ActivityFeedComponent
      ),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./components/user-search/user-search.component').then(
        (m) => m.UserSearchComponent
      ),
  },
];
