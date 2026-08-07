import { describe, expect, it } from 'vitest';
import { budgetBarWidthPercent, budgetPercentage, isOverBudget } from './budget';
import { BudgetStatus } from '../models/budget-status.model';

function status(spentCents: number, budgetCents: number): BudgetStatus {
  return {
    category: { id: '1', name: 'Ocio', color_hex: '#eda100', monthly_budget_cents: budgetCents },
    budget_cents: budgetCents,
    spent_cents: spentCents,
  };
}

describe('budget utils', () => {
  it('computes percentage under budget', () => {
    expect(budgetPercentage(status(30_00, 100_00))).toBeCloseTo(0.3);
  });

  it('flags over-budget when spend exceeds the cap', () => {
    expect(isOverBudget(status(150_00, 100_00))).toBe(true);
  });

  it('does not flag when spend equals the cap exactly', () => {
    expect(isOverBudget(status(100_00, 100_00))).toBe(false);
  });

  it('caps bar width at 100% when over budget', () => {
    expect(budgetBarWidthPercent(status(300_00, 100_00))).toBe(100);
  });

  it('returns proportional width under budget', () => {
    expect(budgetBarWidthPercent(status(40_00, 100_00))).toBe(40);
  });
});
