import { Component, input } from '@angular/core';

import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-badge',
  template: `
    <span class="badge">
      <span class="dot" [style.background]="category().color_hex"></span>
      {{ category().name }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      font-weight: 700;
      padding: 4px 10px 4px 8px;
      border-radius: 999px;
      background: var(--surface-2);
      border: 1px solid var(--border);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex: none;
    }
  `,
})
export class CategoryBadge {
  readonly category = input.required<Category>();
}
