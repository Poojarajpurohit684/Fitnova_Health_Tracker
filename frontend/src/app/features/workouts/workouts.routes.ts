import { Routes } from '@angular/router';

export const WORKOUTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./workouts.component').then(
        (m) => m.WorkoutsComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/workout-form/workout-form.component').then(
        (m) => m.WorkoutFormComponent
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./components/workout-form/workout-form.component')
        .then(m => m.WorkoutFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/workout-form/workout-form.component')
        .then(m => m.WorkoutFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/workout-detail/workout-detail.component')
        .then(m => m.WorkoutDetailComponent),
  },
];
