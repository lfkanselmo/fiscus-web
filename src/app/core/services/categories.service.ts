import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Category, CategoryCreate, CategoryUpdate } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  create(payload: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(`${API_BASE_URL}/categories`, payload);
  }

  update(categoryId: string, payload: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(`${API_BASE_URL}/categories/${categoryId}`, payload);
  }

  delete(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/categories/${categoryId}`);
  }
}
