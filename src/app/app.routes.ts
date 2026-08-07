import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transacciones',
        loadComponent: () =>
          import('./features/transactions/transaction-list').then((m) => m.TransactionList),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categories/category-list').then((m) => m.CategoryList),
      },
      {
        path: 'importar',
        loadComponent: () => import('./features/import/import-page').then((m) => m.ImportPage),
      },
    ],
  },
];
