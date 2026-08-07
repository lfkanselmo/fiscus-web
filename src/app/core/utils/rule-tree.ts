import { WEEKDAY_LABELS_SHORT } from '../constants/weekdays';
import { RuleLeafType, RuleNode } from '../models/category-rule.model';
import { formatCents } from './currency';

export type RulePathStep = 'left' | 'right' | 'rule';
export type RulePath = RulePathStep[];

function getChild(node: RuleNode, step: RulePathStep): RuleNode {
  if (step === 'rule') {
    if (node.type !== 'not')
      throw new Error(`invalid path step 'rule' on node type '${node.type}'`);
    return node.rule;
  }
  if (node.type !== 'and' && node.type !== 'or') {
    throw new Error(`invalid path step '${step}' on node type '${node.type}'`);
  }
  return node[step];
}

function withChild(node: RuleNode, step: RulePathStep, child: RuleNode): RuleNode {
  if (step === 'rule') {
    if (node.type !== 'not')
      throw new Error(`invalid path step 'rule' on node type '${node.type}'`);
    return { ...node, rule: child };
  }
  if (node.type !== 'and' && node.type !== 'or') {
    throw new Error(`invalid path step '${step}' on node type '${node.type}'`);
  }
  return { ...node, [step]: child };
}

export function getNodeAtPath(root: RuleNode, path: RulePath): RuleNode {
  return path.reduce(getChild, root);
}

export function replaceNodeAtPath(root: RuleNode, path: RulePath, replacement: RuleNode): RuleNode {
  if (path.length === 0) return replacement;
  const [step, ...rest] = path;
  return withChild(root, step, replaceNodeAtPath(getChild(root, step), rest, replacement));
}

export function wrapWithAnd(root: RuleNode, path: RulePath, sibling: RuleNode): RuleNode {
  const node = getNodeAtPath(root, path);
  return replaceNodeAtPath(root, path, { type: 'and', left: node, right: sibling });
}

export function wrapWithOr(root: RuleNode, path: RulePath, sibling: RuleNode): RuleNode {
  const node = getNodeAtPath(root, path);
  return replaceNodeAtPath(root, path, { type: 'or', left: node, right: sibling });
}

export function wrapWithNot(root: RuleNode, path: RulePath): RuleNode {
  const node = getNodeAtPath(root, path);
  return replaceNodeAtPath(root, path, { type: 'not', rule: node });
}

export function unwrapNotAtPath(root: RuleNode, path: RulePath): RuleNode {
  const node = getNodeAtPath(root, path);
  if (node.type !== 'not') return root;
  return replaceNodeAtPath(root, path, node.rule);
}

export function removeNodeAtPath(root: RuleNode, path: RulePath): RuleNode | null {
  if (path.length === 0) return null;

  const parentPath = path.slice(0, -1);
  const lastStep = path[path.length - 1];
  const parent = getNodeAtPath(root, parentPath);

  if (parent.type === 'and' || parent.type === 'or') {
    const survivingSibling = lastStep === 'left' ? parent.right : parent.left;
    return replaceNodeAtPath(root, parentPath, survivingSibling);
  }
  return removeNodeAtPath(root, parentPath);
}

export function defaultLeafFor(type: RuleLeafType): RuleNode {
  const defaults: Record<RuleLeafType, RuleNode> = {
    merchant_contains: { type: 'merchant_contains', keyword: '' },
    amount_greater_than: { type: 'amount_greater_than', threshold_cents: 0, currency: 'COP' },
    weekday: { type: 'weekday', weekdays: [] },
  };
  return defaults[type];
}

export function isRuleNodeComplete(node: RuleNode): boolean {
  switch (node.type) {
    case 'merchant_contains':
      return node.keyword.trim().length > 0;
    case 'amount_greater_than':
      return node.threshold_cents > 0;
    case 'weekday':
      return node.weekdays.length > 0;
    case 'and':
    case 'or':
      return isRuleNodeComplete(node.left) && isRuleNodeComplete(node.right);
    case 'not':
      return isRuleNodeComplete(node.rule);
  }
}

export function describeRuleNode(node: RuleNode): string {
  switch (node.type) {
    case 'merchant_contains':
      return `Comercio contiene '${node.keyword}'`;
    case 'amount_greater_than':
      return `Monto mayor a ${formatCents(node.threshold_cents)}`;
    case 'weekday':
      return `Día de la semana: ${node.weekdays.map((day) => WEEKDAY_LABELS_SHORT[day]).join(', ')}`;
    case 'and':
      return `(${describeRuleNode(node.left)}) Y (${describeRuleNode(node.right)})`;
    case 'or':
      return `(${describeRuleNode(node.left)}) O (${describeRuleNode(node.right)})`;
    case 'not':
      return `NO (${describeRuleNode(node.rule)})`;
  }
}
