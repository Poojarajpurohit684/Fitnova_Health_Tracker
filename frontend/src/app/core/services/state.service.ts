import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  workouts: any[];
  nutrition: any[];
  goals: any[];
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const initialState: AppState = {
  user: null,
  isLoading: false,
  error: null,
  workouts: [],
  nutrition: [],
  goals: [],
  theme: 'dark',
  notifications: [],
};

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  constructor() {
    this.loadUserData();
  }

  // Selectors
  getState(): Observable<AppState> {
    return this.state$.asObservable();
  }

  getUser(): Observable<any | null> {
    return this.state$.pipe(map(state => state.user));
  }

  getIsLoading(): Observable<boolean> {
    return this.state$.pipe(map(state => state.isLoading));
  }

  getError(): Observable<string | null> {
    return this.state$.pipe(map(state => state.error));
  }

  getWorkouts(): Observable<any[]> {
    return this.state$.pipe(map(state => state.workouts));
  }

  getNutrition(): Observable<any[]> {
    return this.state$.pipe(map(state => state.nutrition));
  }

  getGoals(): Observable<any[]> {
    return this.state$.pipe(map(state => state.goals));
  }

  getTheme(): Observable<'light' | 'dark'> {
    return this.state$.pipe(map(state => state.theme));
  }

  getNotifications(): Observable<Notification[]> {
    return this.state$.pipe(map(state => state.notifications));
  }

  // Actions
  setUser(user: any): void {
    this.updateState({ user });
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_data');
    }
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setWorkouts(workouts: any[]): void {
    this.updateState({ workouts });
  }

  setNutrition(nutrition: any[]): void {
    this.updateState({ nutrition });
  }

  setGoals(goals: any[]): void {
    this.updateState({ goals });
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.updateState({ theme });
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  addNotification(notification: Omit<Notification, 'id'>): void {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = { ...notification, id };

    const currentState = this.state$.value;
    this.updateState({
      notifications: [...currentState.notifications, newNotification],
    });

    if (notification.duration) {
      setTimeout(() => this.removeNotification(id), notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentState = this.state$.value;
    this.updateState({
      notifications: currentState.notifications.filter((n) => n.id !== id),
    });
  }

  clearNotifications(): void {
    this.updateState({ notifications: [] });
  }

  reset(): void {
    this.updateState(initialState);
    localStorage.removeItem('user_data');
  }

  // Private Methods
  private updateState(partial: Partial<AppState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...partial });
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const theme = savedTheme || 'light';
    this.applyTheme(theme);
    this.updateState({ theme });
  }

  private loadUserData(): void {
    const savedUser = localStorage.getItem('user_data');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.updateState({ user });
      } catch (e) {
        localStorage.removeItem('user_data');
      }
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
