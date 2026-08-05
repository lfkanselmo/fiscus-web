import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'transacciones', pathMatch: 'full' },
  {
    path: 'transacciones',
    loadComponent: () =>
      import('./features/transactions/transaction-list').then((m) => m.TransactionList),
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categories/category-list').then((m) => m.CategoryList),
  },
  {
    path: 'importar',
    loadComponent: () => import('./features/import/import-page').then((m) => m.ImportPage),
  },
];
