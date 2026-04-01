import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthFeatureService {
  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth: string,
    gender: string,
    height: number,
    currentWeight: number
  ): Observable<any> {
    return this.authService.register({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      height,
      currentWeight,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.authService.login(email, password);
  }

  logout(): void {
    this.authService.logout();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
