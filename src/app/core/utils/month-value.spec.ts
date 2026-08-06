import { describe, expect, it } from 'vitest';
import {
  formatMonthLabel,
  formatMonthShortLabel,
  parseMonthValue,
  shiftMonthValue,
  toMonthValue,
} from './month-value';

describe('month-value utils', () => {
  it('formats a date into a YYYY-MM value', () => {
    expect(toMonthValue(new Date(2026, 7, 15))).toBe('2026-08');
  });

  it('parses a YYYY-MM value into year and month', () => {
    expect(parseMonthValue('2026-08')).toEqual({ year: 2026, month: 8 });
  });

  it('shifts forward within the same year', () => {
    expect(shiftMonthValue('2026-08', 1)).toBe('2026-09');
  });

  it('shifts backward across a year boundary', () => {
    expect(shiftMonthValue('2026-01', -1)).toBe('2025-12');
  });

  it('formats a full month label in Spanish', () => {
    expect(formatMonthLabel('2026-08')).toBe('Agosto 2026');
  });

  it('formats a short month label', () => {
    expect(formatMonthShortLabel(2026, 8)).toBe('Ago 2026');
  });
});
