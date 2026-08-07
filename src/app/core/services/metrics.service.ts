import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { BudgetStatus } from '../models/budget-status.model';
import { MonthlyCategoryMetric } from '../models/monthly-metric.model';
import { MonthlyTrendPoint } from '../models/monthly-trend.model';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly http = inject(HttpClient);

  monthly(year: number, month: number): Observable<MonthlyCategoryMetric[]> {
    return this.http.get<MonthlyCategoryMetric[]>(`${API_BASE_URL}/metrics/monthly`, {
      params: { year, month },
    });
  }

  budgets(year: number, month: number): Observable<BudgetStatus[]> {
    return this.http.get<BudgetStatus[]>(`${API_BASE_URL}/metrics/budgets`, {
      params: { year, month },
    });
  }

  trend(months: number): Observable<MonthlyTrendPoint[]> {
    return this.http.get<MonthlyTrendPoint[]>(`${API_BASE_URL}/metrics/trend`, {
      params: { months },
    });
  }
}
