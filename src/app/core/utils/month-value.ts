import { MONTH_NAMES_FULL, MONTH_NAMES_SHORT } from '../constants/months';

export function currentMonthValue(): string {
  return toMonthValue(new Date());
}

export function toMonthValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseMonthValue(value: string): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

export function shiftMonthValue(value: string, deltaMonths: number): string {
  const { year, month } = parseMonthValue(value);
  return toMonthValue(new Date(year, month - 1 + deltaMonths, 1));
}

export function formatMonthLabel(value: string): string {
  const { year, month } = parseMonthValue(value);
  return `${MONTH_NAMES_FULL[month - 1]} ${year}`;
}

export function formatMonthShortLabel(year: number, month: number): string {
  return `${MONTH_NAMES_SHORT[month - 1]} ${year}`;
}
