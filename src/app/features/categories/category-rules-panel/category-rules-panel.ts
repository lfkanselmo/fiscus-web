import { Component, effect, inject, input, signal } from '@angular/core';

import { CategoryRule } from '../../../core/models/category-rule.model';
import { CategoryRulesService } from '../../../core/services/category-rules.service';
import { RuleCard } from './rule-card/rule-card';

@Component({
  selector: 'app-category-rules-panel',
  imports: [RuleCard],
  templateUrl: './category-rules-panel.html',
  styleUrl: './category-rules-panel.scss',
})
export class CategoryRulesPanel {
  readonly categoryId = input.required<string>();

  private readonly categoryRulesService = inject(CategoryRulesService);

  readonly rules = signal<CategoryRule[]>([]);
  readonly creatingNew = signal(false);

  constructor() {
    effect(() => this.reload());
  }

  reload(): void {
    this.categoryRulesService.listByCategory(this.categoryId()).subscribe((rules) => {
      this.rules.set(rules);
    });
  }

  addRule(): void {
    this.creatingNew.set(true);
  }

  onDraftDiscarded(): void {
    this.creatingNew.set(false);
  }

  onChanged(): void {
    this.creatingNew.set(false);
    this.reload();
  }
}
