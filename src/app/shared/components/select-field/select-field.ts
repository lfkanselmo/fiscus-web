import { Component, computed, input, output, signal } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
  colorHex?: string;
}

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
})
export class SelectField {
  readonly options = input.required<SelectOption[]>();
  readonly value = input<string>('');
  readonly placeholder = input('Seleccionar');
  readonly valueChange = output<string>();

  readonly open = signal(false);

  readonly selectedOption = computed(
    () => this.options().find((option) => option.value === this.value()) ?? null,
  );

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  close(): void {
    this.open.set(false);
  }

  choose(option: SelectOption): void {
    this.valueChange.emit(option.value);
    this.open.set(false);
  }
}
