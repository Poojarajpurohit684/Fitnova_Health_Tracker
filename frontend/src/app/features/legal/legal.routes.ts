import { Routes } from '@angular/router';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export const LEGAL_ROUTES: Routes = [
  {
    path: 'terms',
    component: TermsComponent,
    data: { title: 'Terms of Service' }
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    data: { title: 'Privacy Policy' }
  }
];
