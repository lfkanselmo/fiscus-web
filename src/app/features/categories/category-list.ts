import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CATEGORY_COLOR_PRESETS } from '../../core/constants/category-colors';
import { UNCATEGORIZED_CATEGORY_ID } from '../../core/constants/sentinel-category';
import { Category } from '../../core/models/category.model';
import { CategoriesService } from '../../core/services/categories.service';
import { centsToPesos, formatCents, pesosToCents } from '../../core/utils/currency';
import { ColorPickerField } from '../../shared/components/color-picker-field/color-picker-field';
import { CategoryRulesPanel } from './category-rules-panel/category-rules-panel';

const DEFAULT_COLOR: string = CATEGORY_COLOR_PRESETS[0];

@Component({
  selector: 'app-category-list',
  imports: [ReactiveFormsModule, ColorPickerField, CategoryRulesPanel],
  templateUrl: './category-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './category-list.scss',
})
export class CategoryList {
  private readonly categoriesService = inject(CategoriesService);
  private readonly formBuilder = inject(FormBuilder);

  readonly sentinelId = UNCATEGORIZED_CATEGORY_ID;

  readonly categories = signal<Category[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly editingCategoryId = signal<string | null>(null);
  readonly expandedCategoryId = signal<string | null>(null);
  readonly deleteConfirmId = signal<string | null>(null);

  readonly formatCents = formatCents;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    color_hex: [DEFAULT_COLOR, Validators.required],
    budget_pesos: [null as number | null],
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
    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      color_hex: raw.color_hex,
      monthly_budget_cents: raw.budget_pesos == null ? null : pesosToCents(raw.budget_pesos),
    };
    const editingId = this.editingCategoryId();
    const request = editingId
      ? this.categoriesService.update(editingId, payload)
      : this.categoriesService.create(payload);

    request.subscribe({
      next: () => {
        this.form.reset({ name: '', color_hex: DEFAULT_COLOR, budget_pesos: null });
        this.editingCategoryId.set(null);
        this.reload();
      },
      error: () => this.errorMessage.set('Ya existe una categoría con ese nombre.'),
    });
  }

  setColor(hex: string): void {
    this.form.controls.color_hex.setValue(hex);
  }

  startEdit(category: Category): void {
    this.errorMessage.set(null);
    this.editingCategoryId.set(category.id);
    this.form.setValue({
      name: category.name,
      color_hex: category.color_hex,
      budget_pesos:
        category.monthly_budget_cents == null ? null : centsToPesos(category.monthly_budget_cents),
    });
  }

  cancelEdit(): void {
    this.editingCategoryId.set(null);
    this.form.reset({ name: '', color_hex: DEFAULT_COLOR, budget_pesos: null });
  }

  toggleRules(categoryId: string): void {
    this.expandedCategoryId.update((current) => (current === categoryId ? null : categoryId));
  }

  requestDelete(categoryId: string): void {
    this.deleteConfirmId.set(categoryId);
  }

  cancelDeleteConfirm(): void {
    this.deleteConfirmId.set(null);
  }

  confirmDelete(categoryId: string): void {
    this.categoriesService.delete(categoryId).subscribe(() => {
      this.deleteConfirmId.set(null);
      if (this.expandedCategoryId() === categoryId) {
        this.expandedCategoryId.set(null);
      }
      this.reload();
    });
  }
}
