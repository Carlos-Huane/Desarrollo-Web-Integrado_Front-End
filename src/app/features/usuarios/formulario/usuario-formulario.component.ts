import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ROLES, Rol } from '../../../core/models/rol.enum';

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <h1>{{ id() ? 'Editar usuario' : 'Nuevo usuario' }}</h1>

      <form [formGroup]="form" (ngSubmit)="enviar()" class="form">
        <label><span>Nombre</span><input formControlName="nombre" /></label>
        <label><span>Apellido</span><input formControlName="apellido" /></label>
        <label><span>Email</span><input type="email" formControlName="email" /></label>
        @if (!id()) {
          <label><span>Contraseña</span><input type="password" formControlName="password" /></label>
        }
        <label><span>Teléfono</span><input formControlName="telefono" /></label>
        <label>
          <span>Rol</span>
          <select formControlName="rol">
            @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
          </select>
        </label>

        @if (errorMsg()) { <div class="alert">{{ errorMsg() }}</div> }

        <div class="actions">
          <button type="button" (click)="cancelar()">Cancelar</button>
          <button type="submit" [disabled]="form.invalid || cargando()">
            {{ cargando() ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .page { max-width: 560px; }
    h1 { color: #1e3a8a; margin: 0 0 20px; }
    .form { display: flex; flex-direction: column; gap: 14px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #475569; }
    input, select { padding: 9px 11px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; }
    .alert { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 6px; font-size: 13px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
    .actions button { padding: 10px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 14px; }
    .actions button[type=button] { background: #f1f5f9; color: #475569; }
    .actions button[type=submit] { background: #1e40af; color: #fff;
      &:disabled { background: #94a3b8; } }
  `]
})
export class UsuarioFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private srv = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roles = ROLES;
  id = signal<number | null>(null);
  cargando = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nombre:    ['', Validators.required],
    apellido:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', Validators.minLength(6)],
    telefono:  [''],
    rol:       ['CLIENTE' as Rol, Validators.required]
  });

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      const idNum = Number(param);
      this.id.set(idNum);
      this.srv.porId(idNum).subscribe(u => {
        this.form.patchValue({
          nombre: u.nombre, apellido: u.apellido, email: u.email,
          telefono: u.telefono ?? '', rol: u.rol
        });
        this.form.controls.password.clearValidators();
        this.form.controls.password.updateValueAndValidity();
      });
    }
  }

  enviar(): void {
    if (this.form.invalid) return;
    this.cargando.set(true);
    const payload = this.form.getRawValue();
    const op$ = this.id()
      ? this.srv.actualizar(this.id()!, payload)
      : this.srv.crear(payload);

    op$.subscribe({
      next: () => this.router.navigate(['/admin/usuarios']),
      error: e => { this.errorMsg.set(e?.error?.message ?? 'Error al guardar'); this.cargando.set(false); }
    });
  }

  cancelar(): void { this.router.navigate(['/admin/usuarios']); }
}
