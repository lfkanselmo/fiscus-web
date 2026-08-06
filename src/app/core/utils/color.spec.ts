import { describe, expect, it } from 'vitest';
import { hexToHsv, hexToRgb, hsvToHex, isValidHex, rgbToHex } from './color';

describe('color utils', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#2a78d6')).toEqual([42, 120, 214]);
  });

  it('converts rgb back to hex', () => {
    expect(rgbToHex(42, 120, 214)).toBe('#2a78d6');
  });

  it('round-trips hex through hsv without drift', () => {
    for (const hex of ['#2a78d6', '#eb6834', '#008300', '#000000', '#ffffff']) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });

  it('validates hex strings', () => {
    expect(isValidHex('#2a78d6')).toBe(true);
    expect(isValidHex('#2A78D6')).toBe(true);
    expect(isValidHex('2a78d6')).toBe(false);
    expect(isValidHex('#2a78')).toBe(false);
    expect(isValidHex('not-a-hex')).toBe(false);
  });
});
