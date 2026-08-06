import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { CATEGORY_COLOR_PRESETS } from '../../../core/constants/category-colors';
import { Hsv, clamp, hexToHsv, hsvToHex, isValidHex } from '../../../core/utils/color';

@Component({
  selector: 'app-color-picker-field',
  templateUrl: './color-picker-field.html',
  styleUrl: './color-picker-field.scss',
})
export class ColorPickerField {
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  readonly presets = CATEGORY_COLOR_PRESETS;
  readonly open = signal(false);
  readonly hsv = signal<Hsv>({ h: 0, s: 0, v: 0 });
  readonly hexDraft = signal('');

  readonly hueColor = computed(() => `hsl(${this.hsv().h}, 100%, 50%)`);

  private readonly svPanel = viewChild<ElementRef<HTMLElement>>('svPanel');
  private readonly hueSlider = viewChild<ElementRef<HTMLElement>>('hueSlider');
  private lastEmittedHex = '';
  private stopDrag: (() => void) | null = null;

  constructor() {
    effect(() => {
      const hex = this.value();
      if (hex !== this.lastEmittedHex && isValidHex(hex)) {
        this.syncFromHex(hex);
      }
    });
  }

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
  }

  close(): void {
    this.open.set(false);
  }

  choosePreset(color: string): void {
    this.emit(color);
    this.close();
  }

  onHexInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace('#', '').toUpperCase();
    this.hexDraft.set(raw);
    const hex = `#${raw}`;
    if (isValidHex(hex)) {
      this.hsv.set(hexToHsv(hex));
      this.emit(hex);
    }
  }

  startSvDrag(event: PointerEvent): void {
    this.dragSv(event);
    this.beginDrag((moveEvent) => this.dragSv(moveEvent));
  }

  startHueDrag(event: PointerEvent): void {
    this.dragHue(event);
    this.beginDrag((moveEvent) => this.dragHue(moveEvent));
  }

  private dragSv(event: PointerEvent): void {
    const rect = this.svPanel()?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const s = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp(100 - ((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    this.updateHsv({ ...this.hsv(), s, v });
  }

  private dragHue(event: PointerEvent): void {
    const rect = this.hueSlider()?.nativeElement.getBoundingClientRect();
    if (!rect) return;
    const h = clamp(((event.clientX - rect.left) / rect.width) * 360, 0, 360);
    this.updateHsv({ ...this.hsv(), h });
  }

  private updateHsv(next: Hsv): void {
    this.hsv.set(next);
    this.emit(hsvToHex(next));
  }

  private beginDrag(onMove: (event: PointerEvent) => void): void {
    this.stopDrag?.();
    const move = (moveEvent: PointerEvent) => onMove(moveEvent);
    const stop = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', stop);
      this.stopDrag = null;
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', stop);
    this.stopDrag = stop;
  }

  private syncFromHex(hex: string): void {
    this.hsv.set(hexToHsv(hex));
    this.hexDraft.set(hex.replace('#', '').toUpperCase());
    this.lastEmittedHex = hex;
  }

  private emit(hex: string): void {
    this.hexDraft.set(hex.replace('#', '').toUpperCase());
    this.lastEmittedHex = hex;
    this.valueChange.emit(hex);
  }
}
