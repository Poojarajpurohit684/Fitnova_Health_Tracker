import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * User Profile Interface
 * Contains all personal information about the user
 */
export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'Other';
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * Notification Settings Interface
 * Controls how the user receives notifications
 */
export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  workoutReminders: boolean;
  nutritionReminders: boolean;
  goalReminders: boolean;
  socialNotifications: boolean;
}

/**
 * Privacy Settings Interface
 * Controls user's privacy preferences
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends-only';
  showWorkouts: boolean;
  showNutrition: boolean;
  showGoals: boolean;
  showStats: boolean;
}

/**
 * User Preferences Interface
 * Contains all user customization preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

/**
 * User Context Interface
 * Complete user context with profile and preferences
 */
export interface UserContext {
  userId: string;
  email: string;
  name: string;
  profilePicture?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  isAuthenticated: boolean;
}

/**
 * UserContextService
 * Centralized service for managing user context and state
 * Provides reactive observables for all user-related data
 */
@Injectable({
  providedIn: 'root',
})
export class UserContextService {
  // BehaviorSubjects for reactive state management
  private userSubject = new BehaviorSubject<UserContext | null>(null);
  private userIdSubject = new BehaviorSubject<string | null>(null);
  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  private preferencesSubject = new BehaviorSubject<UserPreferences | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Real-time synchronization observables
  private workoutsSubject = new BehaviorSubject<any[]>([]);
  private nutritionSubject = new BehaviorSubject<any[]>([]);
  private goalsSubject = new BehaviorSubject<any[]>([]);
  private connectionsSubject = new BehaviorSubject<any[]>([]);
  private activityFeedSubject = new BehaviorSubject<any[]>([]);

  // Public observables
  public user$ = this.userSubject.asObservable();
  public userId$ = this.userIdSubject.asObservable();
  public profile$ = this.profileSubject.asObservable();
  public preferences$ = this.preferencesSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Real-time synchronization observables
  public workouts$ = this.workoutsSubject.asObservable();
  public nutrition$ = this.nutritionSubject.asObservable();
  public goals$ = this.goalsSubject.asObservable();
  public connections$ = this.connectionsSubject.asObservable();
  public activityFeed$ = this.activityFeedSubject.asObservable();

  constructor() {
    this.loadContextFromStorage();
  }

  /**
   * Initialize user context with complete user data
   * Called after successful login
   */
  initializeUserContext(user: UserProfile, preferences: UserPreferences): void {
    const userContext: UserContext = {
      userId: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      profilePicture: user.profilePicture,
      profile: user,
      preferences: preferences,
      isAuthenticated: true,
    };

    this.userSubject.next(userContext);
    this.userIdSubject.next(user._id);
    this.profileSubject.next(user);
    this.preferencesSubject.next(preferences);
    this.isAuthenticatedSubject.next(true);

    this.saveContextToStorage(userContext);
  }

  /**
   * Update user profile
   * Reflects changes immediately across all components
   */
  updateUserProfile(updates: Partial<UserProfile>): void {
    const current = this.profileSubject.value;
    if (current) {
      const updated = { ...current, ...updates };
      this.profileSubject.next(updated);

      const userContext = this.userSubject.value;
      if (userContext) {
        userContext.profile = updated;
        userContext.name = `${updated.firstName} ${updated.lastName}`;
        userContext.profilePicture = updated.profilePicture;
        this.userSubject.next(userContext);
        this.saveContextToStorage(userContext);
      }
    }
  }

  /**
   * Update user preferences
   * Reflects changes immediately across all components
   */
  updatePreferences(updates: Partial<UserPreferences>): void {
    const current = this.preferencesSubject.value;
    if (current) {
      const updated = { ...current, ...updates };
      this.preferencesSubject.next(updated);

      const userContext = this.userSubject.value;
      if (userContext) {
        userContext.preferences = updated;
        this.userSubject.next(userContext);
        this.saveContextToStorage(userContext);
      }
    }
  }

  /**
   * Update theme preference
   */
  updateTheme(theme: 'light' | 'dark'): void {
    const current = this.preferencesSubject.value;
    if (current) {
      this.updatePreferences({
        ...current,
        theme: theme,
      });
    }
  }

  /**
   * Update units preference
   */
  updateUnits(units: 'metric' | 'imperial'): void {
    const current = this.preferencesSubject.value;
    if (current) {
      this.updatePreferences({
        ...current,
        units: units,
      });
    }
  }

  /**
   * Update language preference
   */
  updateLanguage(language: string): void {
    const current = this.preferencesSubject.value;
    if (current) {
      this.updatePreferences({
        ...current,
        language: language,
      });
    }
  }

  /**
   * Get current user context
   */
  getUserContext(): UserContext | null {
    return this.userSubject.value;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userIdSubject.value;
  }

  /**
   * Get current user profile
   */
  getProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Get current user preferences
   */
  getPreferences(): UserPreferences | null {
    return this.preferencesSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Clear user context on logout
   * Removes all user data from memory and storage
   */
  clearUserContext(): void {
    this.userSubject.next(null);
    this.userIdSubject.next(null);
    this.profileSubject.next(null);
    this.preferencesSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.clearContextFromStorage();
  }

  /**
   * Save user context to local storage for persistence
   */
  private saveContextToStorage(context: UserContext): void {
    try {
      localStorage.setItem('user_context', JSON.stringify(context));
    } catch (error) {
      console.error('Failed to save user context to storage:', error);
    }
  }

  /**
   * Load user context from local storage
   */
  private loadContextFromStorage(): void {
    try {
      const stored = localStorage.getItem('user_context');
      if (stored) {
        const context = JSON.parse(stored) as UserContext;
        this.userSubject.next(context);
        this.userIdSubject.next(context.userId);
        this.profileSubject.next(context.profile);
        this.preferencesSubject.next(context.preferences);
        this.isAuthenticatedSubject.next(context.isAuthenticated);
      }
    } catch (error) {
      console.error('Failed to load user context from storage:', error);
    }
  }

  /**
   * Clear user context from local storage
   */
  private clearContextFromStorage(): void {
    try {
      localStorage.removeItem('user_context');
    } catch (error) {
      console.error('Failed to clear user context from storage:', error);
    }
  }

  /**
   * Update workouts in real-time
   * Called when workouts are created, updated, or deleted
   */
  updateWorkouts(workouts: any[]): void {
    this.workoutsSubject.next(workouts);
  }

  /**
   * Add a new workout to the real-time list
   */
  addWorkout(workout: any): void {
    const current = this.workoutsSubject.value;
    this.workoutsSubject.next([workout, ...current]);
  }

  /**
   * Update a specific workout in the real-time list
   */
  updateWorkout(id: string, updates: any): void {
    const current = this.workoutsSubject.value;
    const updated = current.map(w => w._id === id ? { ...w, ...updates } : w);
    this.workoutsSubject.next(updated);
  }

  /**
   * Remove a workout from the real-time list
   */
  removeWorkout(id: string): void {
    const current = this.workoutsSubject.value;
    this.workoutsSubject.next(current.filter(w => w._id !== id));
  }

  /**
   * Update nutrition entries in real-time
   * Called when nutrition entries are created, updated, or deleted
   */
  updateNutrition(entries: any[]): void {
    this.nutritionSubject.next(entries);
  }

  /**
   * Add a new nutrition entry to the real-time list
   */
  addNutritionEntry(entry: any): void {
    const current = this.nutritionSubject.value;
    this.nutritionSubject.next([entry, ...current]);
  }

  /**
   * Update a specific nutrition entry in the real-time list
   */
  updateNutritionEntry(id: string, updates: any): void {
    const current = this.nutritionSubject.value;
    const updated = current.map(e => e._id === id ? { ...e, ...updates } : e);
    this.nutritionSubject.next(updated);
  }

  /**
   * Remove a nutrition entry from the real-time list
   */
  removeNutritionEntry(id: string): void {
    const current = this.nutritionSubject.value;
    this.nutritionSubject.next(current.filter(e => e._id !== id));
  }

  /**
   * Update goals in real-time
   * Called when goals are created, updated, or deleted
   */
  updateGoals(goals: any[]): void {
    this.goalsSubject.next(goals);
  }

  /**
   * Add a new goal to the real-time list
   */
  addGoal(goal: any): void {
    const current = this.goalsSubject.value;
    this.goalsSubject.next([goal, ...current]);
  }

  /**
   * Update a specific goal in the real-time list
   */
  updateGoal(id: string, updates: any): void {
    const current = this.goalsSubject.value;
    const updated = current.map(g => g._id === id ? { ...g, ...updates } : g);
    this.goalsSubject.next(updated);
  }

  /**
   * Remove a goal from the real-time list
   */
  removeGoal(id: string): void {
    const current = this.goalsSubject.value;
    this.goalsSubject.next(current.filter(g => g._id !== id));
  }

  /**
   * Update connections in real-time
   * Called when connections are created, updated, or deleted
   */
  updateConnections(connections: any[]): void {
    this.connectionsSubject.next(connections);
  }

  /**
   * Add a new connection to the real-time list
   */
  addConnection(connection: any): void {
    const current = this.connectionsSubject.value;
    this.connectionsSubject.next([connection, ...current]);
  }

  /**
   * Update a specific connection in the real-time list
   */
  updateConnection(id: string, updates: any): void {
    const current = this.connectionsSubject.value;
    const updated = current.map(c => c._id === id ? { ...c, ...updates } : c);
    this.connectionsSubject.next(updated);
  }

  /**
   * Remove a connection from the real-time list
   */
  removeConnection(id: string): void {
    const current = this.connectionsSubject.value;
    this.connectionsSubject.next(current.filter(c => c._id !== id));
  }

  /**
   * Update activity feed in real-time
   * Called when activities are created, updated, or deleted
   */
  updateActivityFeed(activities: any[]): void {
    this.activityFeedSubject.next(activities);
  }

  /**
   * Add a new activity to the real-time feed
   */
  addActivity(activity: any): void {
    const current = this.activityFeedSubject.value;
    this.activityFeedSubject.next([activity, ...current]);
  }

  /**
   * Update a specific activity in the real-time feed
   */
  updateActivity(id: string, updates: any): void {
    const current = this.activityFeedSubject.value;
    const updated = current.map(a => a._id === id ? { ...a, ...updates } : a);
    this.activityFeedSubject.next(updated);
  }

  /**
   * Remove an activity from the real-time feed
   */
  removeActivity(id: string): void {
    const current = this.activityFeedSubject.value;
    this.activityFeedSubject.next(current.filter(a => a._id !== id));
  }
}
