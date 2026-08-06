import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CategoriesService } from '../../core/services/categories.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { Category } from '../../core/models/category.model';
import { Transaction } from '../../core/models/transaction.model';
import { CentsCurrencyPipe } from '../../shared/pipes/cents-currency.pipe';
import { SelectField, SelectOption } from '../../shared/components/select-field/select-field';

@Component({
  selector: 'app-transaction-list',
  imports: [CentsCurrencyPipe, DatePipe, SelectField],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss',
})
export class TransactionList {
  private readonly transactionsService = inject(TransactionsService);
  private readonly categoriesService = inject(CategoriesService);

  readonly transactions = signal<Transaction[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly categoryFilter = signal<string>('');

  readonly categoryOptions = computed<SelectOption[]>(() =>
    this.categories().map((category) => ({
      value: category.id,
      label: category.name,
      colorHex: category.color_hex,
    })),
  );

  readonly filterOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Todas las categorías' },
    ...this.categoryOptions(),
  ]);

  constructor() {
    this.categoriesService.list().subscribe((categories) => this.categories.set(categories));
    this.reload();
  }

  reload(): void {
    this.transactionsService
      .list({ category_id: this.categoryFilter() || undefined })
      .subscribe((transactions) => this.transactions.set(transactions));
  }

  onFilterChange(categoryId: string): void {
    this.categoryFilter.set(categoryId);
    this.reload();
  }

  recategorize(transaction: Transaction, categoryId: string): void {
    this.transactionsService
      .recategorize(transaction.id, categoryId)
      .subscribe(() => this.reload());
  }
}
