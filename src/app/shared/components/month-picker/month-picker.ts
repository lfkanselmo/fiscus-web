import { Component, computed, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

import { MONTH_NAMES_SHORT } from '../../../core/constants/months';
import {
  formatMonthLabel,
  parseMonthValue,
  shiftMonthValue,
} from '../../../core/utils/month-value';

@Component({
  selector: 'app-month-picker',
  templateUrl: './month-picker.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './month-picker.scss',
})
export class MonthPicker {
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  readonly monthNames = MONTH_NAMES_SHORT;
  readonly pickerOpen = signal(false);
  readonly pickerYear = signal(0);

  readonly monthLabel = computed(() => formatMonthLabel(this.value()));

  shiftMonth(delta: number): void {
    this.valueChange.emit(shiftMonthValue(this.value(), delta));
  }

  togglePicker(): void {
    if (this.pickerOpen()) {
      this.pickerOpen.set(false);
      return;
    }
    this.pickerYear.set(parseMonthValue(this.value()).year);
    this.pickerOpen.set(true);
  }

  closePicker(): void {
    this.pickerOpen.set(false);
  }

  shiftPickerYear(delta: number): void {
    this.pickerYear.update((year) => year + delta);
  }

  pickMonth(monthIndex: number): void {
    this.valueChange.emit(`${this.pickerYear()}-${String(monthIndex + 1).padStart(2, '0')}`);
    this.pickerOpen.set(false);
  }

  isPickedMonth(monthIndex: number): boolean {
    const { year, month } = parseMonthValue(this.value());
    return year === this.pickerYear() && month === monthIndex + 1;
  }
}
