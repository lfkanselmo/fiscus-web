import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { TOKEN_STORAGE_KEY } from '../constants/auth-storage';
import { AuthCredentials, AuthTokenResponse, ForgotPasswordResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  login(credentials: AuthCredentials): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${API_BASE_URL}/auth/login`, credentials)
      .pipe(tap((response) => this.setToken(response.access_token)));
  }

  register(credentials: AuthCredentials): Observable<AuthTokenResponse> {
    return this.http
      .post<AuthTokenResponse>(`${API_BASE_URL}/auth/register`, credentials)
      .pipe(tap((response) => this.setToken(response.access_token)));
  }

  requestPasswordReset(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${API_BASE_URL}/auth/forgot-password`, {
      email,
    });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/auth/reset-password`, {
      token,
      new_password: newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this._token.set(null);
    this.router.navigateByUrl('/login');
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this._token.set(token);
  }
}
