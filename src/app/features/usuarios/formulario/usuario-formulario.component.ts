import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ROLES, Rol } from '../../../core/models/rol.enum';

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="head">
        <a routerLink="/admin/usuarios" class="back">← Volver</a>
        <h1>{{ id() ? 'Editar usuario' : 'Nuevo usuario' }}</h1>
        <p class="lead">
          {{ id()
              ? 'Modifica los datos del usuario. La contraseña no se cambia desde aquí.'
              : 'Completa todos los campos marcados. La contraseña inicial debe tener al menos 6 caracteres.' }}
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="enviar()" class="form" novalidate>
        @if (mostrarErrorGlobal()) {
          <div class="alert alert--warning">
            <strong>Hay campos por completar.</strong>
            Revisa los marcados en rojo abajo.
          </div>
        }
        @if (errorMsg()) {
          <div class="alert alert--error">{{ errorMsg() }}</div>
        }

        <div class="grid">
          <label class="field" [class.field--invalid]="invalido('nombre')">
            <span class="field__label">Nombre <em>*</em></span>
            <input type="text" formControlName="nombre" placeholder="Ej. Pedro" autocomplete="given-name" />
            @if (invalido('nombre')) { <small class="field__error">El nombre es obligatorio</small> }
          </label>

          <label class="field" [class.field--invalid]="invalido('apellido')">
            <span class="field__label">Apellido <em>*</em></span>
            <input type="text" formControlName="apellido" placeholder="Ej. Sánchez" autocomplete="family-name" />
            @if (invalido('apellido')) { <small class="field__error">El apellido es obligatorio</small> }
          </label>

          <label class="field" [class.field--invalid]="invalido('email')">
            <span class="field__label">Correo electrónico <em>*</em></span>
            <input type="email" formControlName="email" placeholder="usuario@telecoperu.com" autocomplete="email" />
            @if (invalido('email')) {
              <small class="field__error">
                {{ form.controls.email.errors?.['required'] ? 'El correo es obligatorio' : 'Ingresa un correo válido' }}
              </small>
            }
          </label>

          <label class="field">
            <span class="field__label">Teléfono</span>
            <input type="tel" formControlName="telefono" placeholder="987 654 321" autocomplete="tel" />
          </label>

          @if (!id()) {
            <label class="field" [class.field--invalid]="invalido('password')">
              <span class="field__label">Contraseña <em>*</em></span>
              <input type="password" formControlName="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
              <small class="field__hint">Se la entregarás al usuario para su primer ingreso.</small>
              @if (invalido('password')) {
                <small class="field__error">
                  {{ form.controls.password.errors?.['required'] ? 'La contraseña es obligatoria' : 'Mínimo 6 caracteres' }}
                </small>
              }
            </label>
          }

          <label class="field" [class.field--invalid]="invalido('rol')">
            <span class="field__label">Rol <em>*</em></span>
            <select formControlName="rol">
              @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
            </select>
            <small class="field__hint">
              ADMIN: control total. TECNICO: atiende tickets. CLIENTE: crea tickets.
            </small>
          </label>
        </div>

        <div class="actions">
          <button type="button" class="btn btn--ghost" (click)="cancelar()" [disabled]="cargando()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="cargando()">
            {{ cargando() ? 'Guardando…' : (id() ? 'Guardar cambios' : 'Crear usuario') }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .page { max-width: 760px; margin: 0 auto; }
    .head { margin-bottom: 20px; }
    .back { display: inline-block; font-size: 13px; color: #475569; margin-bottom: 8px; text-decoration: none;
      &:hover { color: #1e40af; } }
    h1 { color: #1e3a8a; margin: 0 0 6px; font-size: 24px; }
    .lead { margin: 0; color: #475569; font-size: 14px; line-height: 1.5; }

    .form {
      display: flex; flex-direction: column; gap: 16px;
      background: #fff; padding: 28px;
      border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }

    .grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }

    .field {
      display: flex; flex-direction: column; gap: 6px;
      &__label { font-size: 13px; font-weight: 600; color: #334155;
        em { color: #dc2626; font-style: normal; margin-left: 2px; } }
      &__hint  { color: #94a3b8; font-size: 12px; }
      &__error { color: #dc2626; font-size: 12px; font-weight: 500; }
      input, select {
        padding: 10px 12px;
        border: 1px solid #e2e8f0; border-radius: 6px;
        font-size: 14px; color: #0f172a;
        background: #fff;
        transition: border-color .12s, box-shadow .12s;
        &:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30,64,175,.12); }
      }
      &--invalid input, &--invalid select {
        border-color: #dc2626;
        &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,.12); }
      }
    }

    .alert {
      padding: 12px 14px; border-radius: 8px; font-size: 13px; line-height: 1.5;
      strong { display: block; margin-bottom: 2px; }
      &--warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
      &--error   { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    }

    .actions {
      display: flex; justify-content: flex-end; gap: 10px;
      padding-top: 12px; border-top: 1px solid #f1f5f9;
      @media (max-width: 480px) { flex-direction: column-reverse; }
    }
    .btn {
      padding: 11px 22px; border-radius: 6px; border: none;
      font-weight: 600; font-size: 14px; cursor: pointer;
      transition: background-color .12s;
      &:disabled { opacity: .6; cursor: not-allowed; }
      &--ghost   { background: #f1f5f9; color: #475569;
        &:hover:not(:disabled) { background: #e2e8f0; } }
      &--primary { background: #1e40af; color: #fff;
        &:hover:not(:disabled) { background: #1e3a8a; } }
    }
  `]
})
export class UsuarioFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private srv = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notif = inject(NotificacionService);

  roles = ROLES;
  id = signal<number | null>(null);
  cargando = signal(false);
  errorMsg = signal<string | null>(null);
  intentoEnviar = signal(false);

  form = this.fb.nonNullable.group({
    nombre:    ['', Validators.required],
    apellido:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]],
    telefono:  [''],
    rol:       ['CLIENTE' as Rol, Validators.required]
  });

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      const idNum = Number(param);
      this.id.set(idNum);
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();
      this.srv.porId(idNum).subscribe(u => {
        this.form.patchValue({
          nombre: u.nombre, apellido: u.apellido, email: u.email,
          telefono: u.telefono ?? '', rol: u.rol
        });
      });
    }
  }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || this.intentoEnviar());
  }

  mostrarErrorGlobal(): boolean {
    return this.intentoEnviar() && this.form.invalid;
  }

  enviar(): void {
    this.intentoEnviar.set(true);
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notif.warning('Revisa los campos marcados antes de guardar');
      return;
    }

    this.cargando.set(true);
    const payload = this.form.getRawValue();
    const op$ = this.id()
      ? this.srv.actualizar(this.id()!, payload)
      : this.srv.crear(payload);

    op$.subscribe({
      next: () => {
        this.notif.success(this.id() ? 'Usuario actualizado' : 'Usuario creado');
        this.router.navigate(['/admin/usuarios']);
      },
      error: e => {
        this.cargando.set(false);
        const errores = e?.error?.errores;
        if (errores && typeof errores === 'object') {
          const detalle = Object.entries(errores).map(([k, v]) => `${k}: ${v}`).join(' · ');
          this.errorMsg.set(detalle);
        } else {
          this.errorMsg.set(e?.error?.message ?? 'Error al guardar el usuario');
        }
      }
    });
  }

  cancelar(): void { this.router.navigate(['/admin/usuarios']); }
}
