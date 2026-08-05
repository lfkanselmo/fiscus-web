import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { CategoriesService } from '../../core/services/categories.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { Category } from '../../core/models/category.model';
import { Transaction } from '../../core/models/transaction.model';
import { CategoryBadge } from '../../shared/components/category-badge/category-badge';
import { CentsCurrencyPipe } from '../../shared/pipes/cents-currency.pipe';

@Component({
  selector: 'app-transaction-list',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CategoryBadge,
    CentsCurrencyPipe,
    DatePipe,
  ],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
})
export class TransactionList {
  private readonly transactionsService = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);

  readonly transactions = signal<Transaction[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly categoryFilter = signal<string>('');

  readonly categoryById = computed(() => {
    const map = new Map<string, Category>();
    for (const category of this.categories()) {
      map.set(category.id, category);
    }
    return map;
  });

  constructor() {
    this.categoriesService.list().subscribe((categories) => this.categories.set(categories));
    this.reload();
  }

  reload(): void {
    this.transactionsService
      .list({ category_id: this.categoryFilter() || undefined })
      .subscribe((transactions) => this.transactions.set(transactions));
  }

  onFilterChange(): void {
    this.reload();
  }

  recategorize(transaction: Transaction, categoryId: string): void {
    this.transactionsService
      .recategorize(transaction.id, categoryId)
      .subscribe(() => this.reload());
  }
}
