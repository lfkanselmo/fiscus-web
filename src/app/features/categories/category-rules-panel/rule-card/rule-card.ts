import { Component, computed, effect, inject, input, output, signal } from '@angular/core';

import { RULE_LEAF_TYPE_OPTIONS } from '../../../../core/constants/rule-types';
import { CategoryRule, RuleLeafType, RuleNode } from '../../../../core/models/category-rule.model';
import { CategoryRulesService } from '../../../../core/services/category-rules.service';
import { defaultLeafFor, describeRuleNode, isRuleNodeComplete } from '../../../../core/utils/rule-tree';
import { RuleNodeEditor } from '../../../../shared/components/rule-node-editor/rule-node-editor';
import { SelectField } from '../../../../shared/components/select-field/select-field';

@Component({
  selector: 'app-rule-card',
  imports: [RuleNodeEditor, SelectField],
  templateUrl: './rule-card.html',
  styleUrl: './rule-card.scss',
})
export class RuleCard {
  readonly rule = input<CategoryRule | null>(null);
  readonly categoryId = input.required<string>();
  readonly changed = output<void>();
  readonly discarded = output<void>();

  private readonly categoryRulesService = inject(CategoryRulesService);

  readonly leafTypeOptions = RULE_LEAF_TYPE_OPTIONS;
  readonly editing = signal(false);
  readonly draft = signal<RuleNode | null>(null);
  readonly deleteConfirm = signal(false);

  readonly description = computed(() => {
    const rule = this.rule();
    return rule ? describeRuleNode(rule.definition) : '';
  });

  readonly canSave = computed(() => {
    const definition = this.draft();
    return definition !== null && isRuleNodeComplete(definition);
  });

  constructor() {
    let initialized = false;
    effect(() => {
      const rule = this.rule();
      if (initialized) return;
      initialized = true;
      this.draft.set(rule?.definition ?? null);
      this.editing.set(rule === null);
    });
  }

  edit(): void {
    this.draft.set(this.rule()?.definition ?? null);
    this.editing.set(true);
  }

  cancel(): void {
    if (this.rule() === null) {
      this.discarded.emit();
      return;
    }
    this.editing.set(false);
  }

  save(): void {
    const definition = this.draft();
    if (definition === null || !isRuleNodeComplete(definition)) return;
    const rule = this.rule();
    const request = rule
      ? this.categoryRulesService.update(rule.id, { definition })
      : this.categoryRulesService.create(this.categoryId(), { definition });
    request.subscribe(() => {
      this.editing.set(false);
      this.changed.emit();
    });
  }

  startNewLeaf(type: string): void {
    this.draft.set(defaultLeafFor(type as RuleLeafType));
  }

  requestDelete(): void {
    this.deleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.deleteConfirm.set(false);
  }

  confirmDelete(): void {
    const rule = this.rule();
    if (rule === null) return;
    this.categoryRulesService.delete(rule.id).subscribe(() => this.changed.emit());
  }
}
