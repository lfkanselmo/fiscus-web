import { Component, computed, input } from '@angular/core';

import { BudgetStatus } from '../../../core/models/budget-status.model';
import { budgetBarWidthPercent, isOverBudget } from '../../../core/utils/budget';
import { formatCents } from '../../../core/utils/currency';

@Component({
  selector: 'app-budget-bar',
  templateUrl: './budget-bar.html',
  styleUrl: './budget-bar.scss',
})
export class BudgetBar {
  readonly status = input.required<BudgetStatus>();

  readonly widthPercent = computed(() => budgetBarWidthPercent(this.status()));
  readonly overBudget = computed(() => isOverBudget(this.status()));
  readonly spentLabel = computed(() => formatCents(this.status().spent_cents));
  readonly budgetLabel = computed(() => formatCents(this.status().budget_cents));
}
