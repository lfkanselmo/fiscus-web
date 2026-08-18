import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';

import { RULE_LEAF_TYPE_OPTIONS } from '../../../core/constants/rule-types';
import { RuleLeafType, RuleNode } from '../../../core/models/category-rule.model';
import { centsToPesos, pesosToCents } from '../../../core/utils/currency';
import {
  RulePath,
  RulePathStep,
  defaultLeafFor,
  getNodeAtPath,
  removeNodeAtPath,
  replaceNodeAtPath,
  unwrapNotAtPath,
  wrapWithAnd,
  wrapWithNot,
  wrapWithOr,
} from '../../../core/utils/rule-tree';
import { SelectField } from '../select-field/select-field';
import { WeekdayToggle } from '../weekday-toggle/weekday-toggle';

@Component({
  selector: 'app-rule-node-editor',
  imports: [SelectField, WeekdayToggle, RuleNodeEditor],
  templateUrl: './rule-node-editor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './rule-node-editor.scss',
})
export class RuleNodeEditor {
  readonly root = input.required<RuleNode>();
  readonly path = input<RulePath>([]);
  readonly rootChange = output<RuleNode | null>();

  readonly leafTypeOptions = RULE_LEAF_TYPE_OPTIONS;

  readonly node = computed(() => getNodeAtPath(this.root(), this.path()));

  readonly merchantKeyword = computed(() => {
    const node = this.node();
    return node.type === 'merchant_contains' ? node.keyword : '';
  });

  readonly amountPesos = computed(() => {
    const node = this.node();
    return node.type === 'amount_greater_than' ? centsToPesos(node.threshold_cents) : 0;
  });

  readonly weekdays = computed(() => {
    const node = this.node();
    return node.type === 'weekday' ? node.weekdays : [];
  });

  childPath(step: RulePathStep): RulePath {
    return [...this.path(), step];
  }

  changeLeafType(type: string): void {
    this.emitReplacement(defaultLeafFor(type as RuleLeafType));
  }

  updateKeyword(event: Event): void {
    const node = this.node();
    if (node.type !== 'merchant_contains') return;
    this.emitReplacement({ ...node, keyword: (event.target as HTMLInputElement).value });
  }

  updateAmount(event: Event): void {
    const node = this.node();
    if (node.type !== 'amount_greater_than') return;
    const pesos = Number((event.target as HTMLInputElement).value);
    this.emitReplacement({ ...node, threshold_cents: pesosToCents(pesos) });
  }

  updateWeekdays(weekdays: number[]): void {
    const node = this.node();
    if (node.type !== 'weekday') return;
    this.emitReplacement({ ...node, weekdays });
  }

  wrapAnd(): void {
    this.rootChange.emit(
      wrapWithAnd(this.root(), this.path(), defaultLeafFor('merchant_contains')),
    );
  }

  wrapOr(): void {
    this.rootChange.emit(wrapWithOr(this.root(), this.path(), defaultLeafFor('merchant_contains')));
  }

  wrapNot(): void {
    this.rootChange.emit(wrapWithNot(this.root(), this.path()));
  }

  unwrapNot(): void {
    this.rootChange.emit(unwrapNotAtPath(this.root(), this.path()));
  }

  remove(): void {
    this.rootChange.emit(removeNodeAtPath(this.root(), this.path()));
  }

  propagate(next: RuleNode | null): void {
    this.rootChange.emit(next);
  }

  private emitReplacement(replacement: RuleNode): void {
    this.rootChange.emit(replaceNodeAtPath(this.root(), this.path(), replacement));
  }
}
