import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };
}

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.scss',
})
export class ResetPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');
  readonly errorMessage = signal<string | null>(
    this.token ? null : 'Enlace de recuperación inválido.',
  );

  readonly form = this.formBuilder.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() },
  );

  submit(): void {
    if (this.form.invalid || !this.token) {
      return;
    }
    this.errorMessage.set(null);
    this.authService.resetPassword(this.token, this.form.getRawValue().password).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.errorMessage.set('El enlace expiró o no es válido. Solicita uno nuevo.'),
    });
  }
}
