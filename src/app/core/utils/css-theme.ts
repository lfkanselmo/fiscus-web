export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface ChartTheme {
  border: string;
  mutedInk: string;
  ink: string;
  surface: string;
  brand: string;
}

export function readChartTheme(): ChartTheme {
  return {
    border: cssVar('--border'),
    mutedInk: cssVar('--ink-muted'),
    ink: cssVar('--ink'),
    surface: cssVar('--surface-2'),
    brand: cssVar('--brand'),
  };
}
