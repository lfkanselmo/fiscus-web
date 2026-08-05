import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Transaction, TransactionFilters } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);

  list(filters: TransactionFilters = {}): Observable<Transaction[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return this.http.get<Transaction[]>(`${API_BASE_URL}/transactions`, { params });
  }

  recategorize(transactionId: string, categoryId: string): Observable<Transaction> {
    return this.http.patch<Transaction>(`${API_BASE_URL}/transactions/${transactionId}`, {
      category_id: categoryId,
    });
  }
}
