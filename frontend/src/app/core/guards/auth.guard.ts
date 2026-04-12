import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.getToken$().pipe(
      take(1),
      switchMap((token) => {
        if (!token) {
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
          return of(false);
        }

        // Check if token is expired by decoding the payload
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();

          if (isExpired) {
            // Try refreshing the token before redirecting
            return this.authService.refreshToken().pipe(
              map(() => true),
              catchError(() => {
                this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
                return of(false);
              })
            );
          }

          return of(true);
        } catch {
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
          return of(false);
        }
      })
    );
  }
}
