import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

import { WEEKDAY_LABELS_SHORT } from '../../../core/constants/weekdays';

@Component({
  selector: 'app-weekday-toggle',
  templateUrl: './weekday-toggle.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './weekday-toggle.scss',
})
export class WeekdayToggle {
  readonly value = input.required<number[]>();
  readonly valueChange = output<number[]>();

  readonly days = WEEKDAY_LABELS_SHORT;

  toggle(day: number): void {
    const current = this.value();
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    this.valueChange.emit(next);
  }
}
