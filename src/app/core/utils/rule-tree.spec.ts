import { describe, expect, it } from 'vitest';
import { RuleNode } from '../models/category-rule.model';
import {
  defaultLeafFor,
  describeRuleNode,
  getNodeAtPath,
  removeNodeAtPath,
  replaceNodeAtPath,
  unwrapNotAtPath,
  wrapWithAnd,
  wrapWithNot,
  wrapWithOr,
} from './rule-tree';

const uber: RuleNode = { type: 'merchant_contains', keyword: 'uber' };
const didi: RuleNode = { type: 'merchant_contains', keyword: 'didi' };
const weekend: RuleNode = { type: 'weekday', weekdays: [5, 6] };

describe('rule-tree utils', () => {
  it('gets a node at the root path', () => {
    expect(getNodeAtPath(uber, [])).toBe(uber);
  });

  it('gets a nested node by path', () => {
    const tree: RuleNode = { type: 'and', left: uber, right: didi };
    expect(getNodeAtPath(tree, ['left'])).toBe(uber);
    expect(getNodeAtPath(tree, ['right'])).toBe(didi);
  });

  it('gets a node inside a not', () => {
    const tree: RuleNode = { type: 'not', rule: uber };
    expect(getNodeAtPath(tree, ['rule'])).toBe(uber);
  });

  it('replaces the root when path is empty', () => {
    expect(replaceNodeAtPath(uber, [], didi)).toBe(didi);
  });

  it('replaces a nested node without mutating untouched branches', () => {
    const tree: RuleNode = { type: 'and', left: uber, right: didi };

    const result = replaceNodeAtPath(tree, ['left'], weekend);

    expect(result).toEqual({ type: 'and', left: weekend, right: didi });
    expect((result as { right: RuleNode }).right).toBe(didi);
  });

  it('wraps a node with and', () => {
    const result = wrapWithAnd(uber, [], didi);
    expect(result).toEqual({ type: 'and', left: uber, right: didi });
  });

  it('wraps a node with or', () => {
    const result = wrapWithOr(uber, [], didi);
    expect(result).toEqual({ type: 'or', left: uber, right: didi });
  });

  it('wraps a node with not', () => {
    const result = wrapWithNot(uber, []);
    expect(result).toEqual({ type: 'not', rule: uber });
  });

  it('unwraps a not node', () => {
    const tree: RuleNode = { type: 'not', rule: uber };
    expect(unwrapNotAtPath(tree, [])).toBe(uber);
  });

  it('unwrap is a no-op on a non-not node', () => {
    expect(unwrapNotAtPath(uber, [])).toBe(uber);
  });

  it('removes the root and returns null', () => {
    expect(removeNodeAtPath(uber, [])).toBeNull();
  });

  it('removing a child of and/or leaves the surviving sibling', () => {
    const tree: RuleNode = { type: 'or', left: uber, right: didi };

    expect(removeNodeAtPath(tree, ['left'])).toBe(didi);
    expect(removeNodeAtPath(tree, ['right'])).toBe(uber);
  });

  it('removing the child of a single not cascades to null', () => {
    const tree: RuleNode = { type: 'not', rule: uber };

    expect(removeNodeAtPath(tree, ['rule'])).toBeNull();
  });

  it('removing the innermost leaf of a double not cascades all the way to null', () => {
    const tree: RuleNode = { type: 'not', rule: { type: 'not', rule: uber } };

    expect(removeNodeAtPath(tree, ['rule', 'rule'])).toBeNull();
  });

  it('removing a leaf under a not nested inside an or replaces the or branch', () => {
    const tree: RuleNode = {
      type: 'or',
      left: { type: 'not', rule: uber },
      right: didi,
    };

    expect(removeNodeAtPath(tree, ['left', 'rule'])).toBe(didi);
  });

  it('builds default leaves for each rule type', () => {
    expect(defaultLeafFor('merchant_contains')).toEqual({ type: 'merchant_contains', keyword: '' });
    expect(defaultLeafFor('amount_greater_than')).toEqual({
      type: 'amount_greater_than',
      threshold_cents: 0,
      currency: 'COP',
    });
    expect(defaultLeafFor('weekday')).toEqual({ type: 'weekday', weekdays: [] });
  });

  it('describes a leaf node', () => {
    expect(describeRuleNode(uber)).toBe("Comercio contiene 'uber'");
    expect(describeRuleNode(weekend)).toBe('Día de la semana: Sáb, Dom');
  });

  it('describes composite nodes', () => {
    const and: RuleNode = { type: 'and', left: uber, right: weekend };
    const or: RuleNode = { type: 'or', left: uber, right: didi };
    const not: RuleNode = { type: 'not', rule: uber };

    expect(describeRuleNode(and)).toContain(' Y ');
    expect(describeRuleNode(or)).toContain(' O ');
    expect(describeRuleNode(not)).toContain('NO (');
  });
});
