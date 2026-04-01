import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserContextService } from '../services/user-context.service';

/**
 * UserContextGuard
 * Ensures user context is initialized before accessing protected routes
 * Redirects to login if no user context exists
 */
@Injectable({
  providedIn: 'root',
})
export class UserContextGuard implements CanActivate {
  constructor(
    private userContext: UserContextService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if user context is initialized
    if (this.userContext.isAuthenticated()) {
      return true;
    }

    // Redirect to login if not authenticated
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
