import { BudgetStatus } from '../models/budget-status.model';

export function budgetPercentage(status: BudgetStatus): number {
  return status.budget_cents === 0 ? 0 : status.spent_cents / status.budget_cents;
}

export function isOverBudget(status: BudgetStatus): boolean {
  return status.spent_cents > status.budget_cents;
}

export function budgetBarWidthPercent(status: BudgetStatus): number {
  return Math.min(budgetPercentage(status), 1) * 100;
}
