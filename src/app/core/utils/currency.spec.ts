import { describe, expect, it } from 'vitest';
import { centsToPesos, formatCents, pesosToCents } from './currency';

describe('currency utils', () => {
  it('formats cents as COP currency', () => {
    expect(formatCents(18_640_000)).toBe('$ 186.400');
  });

  it('converts pesos to cents', () => {
    expect(pesosToCents(1864)).toBe(186_400);
  });

  it('rounds fractional pesos when converting to cents', () => {
    expect(pesosToCents(1864.005)).toBe(186_401);
  });

  it('converts cents to pesos', () => {
    expect(centsToPesos(186_400)).toBe(1864);
  });
});
