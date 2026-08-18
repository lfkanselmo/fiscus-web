import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator() },
  );

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();
    this.authService.register({ email, password }).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => this.errorMessage.set('Ya existe una cuenta con ese correo.'),
    });
  }
}
