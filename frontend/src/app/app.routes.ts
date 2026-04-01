import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'workouts',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/workouts/workouts.routes').then(
        (m) => m.WORKOUTS_ROUTES
      ),
  },
  {
    path: 'nutrition',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/nutrition/nutrition.routes').then(
        (m) => m.NUTRITION_ROUTES
      ),
  },
  {
    path: 'goals',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/goals/goals.routes').then(
        (m) => m.GOALS_ROUTES
      ),
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
  },
  {
    path: 'social',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/social/social.routes').then(
        (m) => m.SOCIAL_ROUTES
      ),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/legal/pages/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/pages/privacy/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./features/support/support.component').then((m) => m.SupportComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then((m) => m.ContactComponent),
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];
