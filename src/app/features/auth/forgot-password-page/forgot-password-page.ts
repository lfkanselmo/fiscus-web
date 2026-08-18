import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './forgot-password-page.scss',
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.errorMessage.set(null);
    this.authService.requestPasswordReset(this.form.getRawValue().email).subscribe({
      next: () => this.submitted.set(true),
      error: () => this.errorMessage.set('No fue posible procesar la solicitud. Intenta de nuevo.'),
    });
  }
}
