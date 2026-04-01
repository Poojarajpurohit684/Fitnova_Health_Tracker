import { Routes } from '@angular/router';

export const NUTRITION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./nutrition.component').then((m) => m.NutritionComponent),
  },
];
