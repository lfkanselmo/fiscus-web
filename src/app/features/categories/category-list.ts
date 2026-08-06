import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';
import { CATEGORY_COLOR_PRESETS } from '../../core/constants/category-colors';
import { CategoryBadge } from '../../shared/components/category-badge/category-badge';
import { ColorPickerField } from '../../shared/components/color-picker-field/color-picker-field';

const DEFAULT_COLOR: string = CATEGORY_COLOR_PRESETS[0];

@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule, CategoryBadge, ColorPickerField],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList {
  private readonly categoriesService = inject(CategoriesService);
  private readonly formBuilder = inject(FormBuilder);

  readonly categories = signal<Category[]>([]);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    color_hex: [DEFAULT_COLOR, Validators.required],
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    this.categoriesService.list().subscribe((categories) => this.categories.set(categories));
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.errorMessage.set(null);
    this.categoriesService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', color_hex: DEFAULT_COLOR });
        this.reload();
      },
      error: () => this.errorMessage.set('Ya existe una categoría con ese nombre.'),
    });
  }

  setColor(hex: string): void {
    this.form.controls.color_hex.setValue(hex);
  }
}
