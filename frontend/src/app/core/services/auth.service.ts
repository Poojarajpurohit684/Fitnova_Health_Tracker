import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { UserContextService, UserPreferences, UserProfile } from './user-context.service';
import { APP_CONFIG } from '../config/app.config';

interface AuthResponse {
  userId: string;
  email: string;
  token: string;
  refreshToken: string;
  expiresIn: string;
  user: any;
}

interface RefreshResponse {
  token: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = APP_CONFIG.API.AUTH_URL;
  private tokenSubject = new BehaviorSubject<string | null>(this.getTokenFromStorage());
  private refreshTokenSubject = new BehaviorSubject<string | null>(this.getRefreshTokenFromStorage());
  public token$ = this.tokenSubject.asObservable();
  public refreshToken$ = this.refreshTokenSubject.asObservable();
  private tokenRefreshTimer: any;

  constructor(
    private http: HttpClient,
    private userContext: UserContextService
  ) {
    this.startTokenRefreshTimer();
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.setTokens(response.token, response.refreshToken);
        // Initialize user context with default preferences
        const defaultPreferences: UserPreferences = {
          theme: 'light',
          units: 'metric',
          language: 'en',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            workoutReminders: true,
            nutritionReminders: true,
            goalReminders: true,
            socialNotifications: true,
          },
          privacy: {
            profileVisibility: 'public',
            showWorkouts: true,
            showNutrition: true,
            showGoals: true,
            showStats: true,
          },
        };
        this.userContext.initializeUserContext(response.user, defaultPreferences);
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.error?.message || 'Registration failed'));
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response) => {
        this.setTokens(response.token, response.refreshToken);
        this.startTokenRefreshTimer();
        
        // Ensure user object exists for initialization
        const user = response.user || { email, _id: response.userId };
        
        const defaultPreferences: UserPreferences = {
          theme: 'light',
          units: 'metric',
          language: 'en',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            workoutReminders: true,
            nutritionReminders: true,
            goalReminders: true,
            socialNotifications: true,
          },
          privacy: {
            profileVisibility: 'public',
            showWorkouts: true,
            showNutrition: true,
            showGoals: true,
            showStats: true,
          },
        };
        this.userContext.initializeUserContext(user, defaultPreferences);
      }),
      catchError((error) => {
        let message = 'Login failed';
        if (error.error && typeof error.error === 'object') {
          message = error.error.message || error.error.error?.message || message;
        } else if (error.message) {
          message = error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearTokens();
        this.stopTokenRefreshTimer();
        // Clear user context on logout
        this.userContext.clearUserContext();
      }),
      catchError(() => {
        this.clearTokens();
        this.stopTokenRefreshTimer();
        // Clear user context on logout error
        this.userContext.clearUserContext();
        return new Observable((observer) => observer.complete());
      })
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshTokenFromStorage();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.setAccessToken(response.token);
      }),
      catchError((error) => {
        this.clearTokens();
        return throwError(() => new Error(error.error?.error?.message || 'Token refresh failed'));
      })
    );
  }

  setTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem('auth_token', accessToken);
    } catch (error: any) {
      void error;
    }
    
    try {
      localStorage.setItem('refresh_token', refreshToken);
    } catch (error: any) {
      void error;
    }
    
    this.tokenSubject.next(accessToken);
    this.refreshTokenSubject.next(refreshToken);
  }

  setAccessToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getRefreshTokenFromStorage(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private clearTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken$(): Observable<string | null> {
    return this.token$;
  }

  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    // Refresh token every 20 minutes (token expires in 24h)
    this.tokenRefreshTimer = setInterval(() => {
      if (this.isAuthenticated()) {
        this.refreshToken().subscribe({
          error: () => {
            this.clearTokens();
          },
        });
      }
    }, APP_CONFIG.TOKEN.REFRESH_INTERVAL);
  }

  private stopTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
    }
  }
}
