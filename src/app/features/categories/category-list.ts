import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models/category.model';
import { CategoryBadge } from '../../shared/components/category-badge/category-badge';

@Component({
  selector: 'app-category-list',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CategoryBadge,
  ],
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
    color_hex: ['#2a78d6', Validators.required],
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
        this.form.reset({ name: '', color_hex: '#2a78d6' });
        this.reload();
      },
      error: () => this.errorMessage.set('Ya existe una categoría con ese nombre.'),
    });
  }
}
