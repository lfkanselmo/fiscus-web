export type RuleLeafType = 'merchant_contains' | 'amount_greater_than' | 'weekday';
export type RuleOperatorType = 'and' | 'or' | 'not';

export type RuleNode =
  | { type: 'merchant_contains'; keyword: string }
  | { type: 'amount_greater_than'; threshold_cents: number; currency: 'COP' }
  | { type: 'weekday'; weekdays: number[] }
  | { type: 'and'; left: RuleNode; right: RuleNode }
  | { type: 'or'; left: RuleNode; right: RuleNode }
  | { type: 'not'; rule: RuleNode };

export interface CategoryRule {
  id: string;
  category_id: string;
  definition: RuleNode;
}

export interface CategoryRuleCreate {
  definition: RuleNode;
}
