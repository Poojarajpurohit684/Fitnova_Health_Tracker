import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from './state.service';

export class StateSelectorFactory {
  static createSelector<T>(
    state$: Observable<AppState>,
    selector: (state: AppState) => T
  ): Observable<T> {
    return state$.pipe(map(selector));
  }

  static createArraySelector(
    state$: Observable<AppState>,
    key: keyof AppState
  ): Observable<any[]> {
    return state$.pipe(
      map((state) => {
        const value = state[key];
        return Array.isArray(value) ? value : [];
      })
    );
  }

  static createPropertySelector<T>(
    state$: Observable<AppState>,
    key: keyof AppState
  ): Observable<T | null> {
    return state$.pipe(
      map((state) => {
        const value = state[key];
        return value !== undefined ? (value as T) : null;
      })
    );
  }
}
