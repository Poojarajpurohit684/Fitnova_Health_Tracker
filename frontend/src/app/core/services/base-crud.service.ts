import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseCrudService {
  protected abstract endpoint: string;

  constructor(protected api: ApiService) {}

  create<T>(data: any): Observable<T> {
    return this.api.post<T>(this.endpoint, data);
  }

  getList<T>(limit: number = 10, offset: number = 0): Observable<T> {
    return this.api.get<T>(this.endpoint, { limit, offset });
  }

  getById<T>(id: string): Observable<T> {
    return this.api.get<T>(`${this.endpoint}/${id}`);
  }

  update<T>(id: string, data: any): Observable<T> {
    return this.api.put<T>(`${this.endpoint}/${id}`, data);
  }

  delete<T>(id: string): Observable<T> {
    return this.api.delete<T>(`${this.endpoint}/${id}`);
  }
}
