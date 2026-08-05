import { Category } from './category.model';

export interface MonthlyCategoryMetric {
  category: Category;
  total_cents: number;
  transaction_count: number;
}
