import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { CategoryRule, CategoryRuleCreate } from '../models/category-rule.model';

@Injectable({ providedIn: 'root' })
export class CategoryRulesService {
  private readonly http = inject(HttpClient);

  listByCategory(categoryId: string): Observable<CategoryRule[]> {
    return this.http.get<CategoryRule[]>(`${API_BASE_URL}/categories/${categoryId}/rules`);
  }

  create(categoryId: string, payload: CategoryRuleCreate): Observable<CategoryRule> {
    return this.http.post<CategoryRule>(`${API_BASE_URL}/categories/${categoryId}/rules`, payload);
  }

  update(ruleId: string, payload: CategoryRuleCreate): Observable<CategoryRule> {
    return this.http.put<CategoryRule>(`${API_BASE_URL}/category-rules/${ruleId}`, payload);
  }

  delete(ruleId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/category-rules/${ruleId}`);
  }
}
