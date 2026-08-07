import { Category } from './category.model';

export interface BudgetStatus {
  category: Category;
  budget_cents: number;
  spent_cents: number;
}
