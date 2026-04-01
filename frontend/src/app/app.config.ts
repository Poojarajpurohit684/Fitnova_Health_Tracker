import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withXsrfConfiguration, withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { initializeApp } from './app.component';
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';
import { StateService } from './core/services/state.service';
import { TitleService } from './core/services/title.service';

export const appConfig: ApplicationConfig = {
  providers: [
    AuthService,
    ApiService,
    StateService,
    TitleService,
    AuthInterceptor,
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
    provideAnimations(),
    { provide: HTTP_INTERCEPTORS, useExisting: AuthInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService, ApiService, StateService, TitleService],
      multi: true,
    },
  ],
};

