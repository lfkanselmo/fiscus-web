import { Injectable, computed, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'fiscus-theme-preference';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.readStoredPreference());
  private readonly darkMediaQuery: MediaQueryList | null =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  private readonly systemPrefersDark = signal(this.darkMediaQuery?.matches ?? false);

  readonly isDark = computed(() =>
    this.preference() === 'system' ? this.systemPrefersDark() : this.preference() === 'dark',
  );

  constructor() {
    this.applyPreference(this.preference());
    this.darkMediaQuery?.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
    });
  }

  setPreference(value: ThemePreference): void {
    this.preference.set(value);
    this.applyPreference(value);
  }

  private applyPreference(value: ThemePreference): void {
    if (value === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', value);
    }
    localStorage.setItem(STORAGE_KEY, value);
  }

  private readStoredPreference(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  }
}
