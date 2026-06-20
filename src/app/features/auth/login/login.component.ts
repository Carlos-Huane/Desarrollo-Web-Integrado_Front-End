import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  appName = environment.appName;
  cargando = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  enviar(): void {
    if (this.form.invalid || this.cargando()) return;

    this.cargando.set(true);
    this.errorMsg.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: res => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect ?? this.auth.rutaInicialPorRol(res.rol));
      },
      error: err => {
        this.cargando.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Credenciales inválidas');
      }
    });
  }
}
