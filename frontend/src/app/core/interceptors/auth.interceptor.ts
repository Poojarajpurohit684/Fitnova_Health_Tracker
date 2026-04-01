import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { StateService } from '../services/state.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private requestsInProgress = 0;

  constructor(
    private authService: AuthService,
    private stateService: StateService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requestsInProgress++;
    this.stateService.setLoading(true);

    const token = localStorage.getItem('auth_token');
    const isAuthRequest = request.url.includes('/auth/login') || request.url.includes('/auth/register');
    
    if (token && !isAuthRequest) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'X-Request-ID': this.generateRequestId(),
        },
      });
    } else {
      request = request.clone({
        setHeaders: {
          'X-Request-ID': this.generateRequestId(),
        },
      });
    }

    return next.handle(request).pipe(
      retry({
        count: 1, // Reduced retry count for better UX
        delay: (error, retryCount) => {
          if (
            error instanceof HttpErrorResponse &&
            (error.status === 408 || error.status === 429 || error.status === 503)
          ) {
            const delayMs = Math.pow(2, retryCount) * 1000;
            return timer(delayMs);
          }
          return throwError(() => error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        // Don't call logout for 401 on login/register requests
        if (error.status === 401 && !isAuthRequest) {
          this.authService.logout().subscribe();
        }

        return throwError(() => error);
      }),
      finalize(() => {
        this.requestsInProgress--;
        if (this.requestsInProgress === 0) {
          this.stateService.setLoading(false);
        }
      })
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
