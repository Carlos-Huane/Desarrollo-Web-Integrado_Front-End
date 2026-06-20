import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Categoria } from '../../../core/models/categoria.model';

@Component({
  selector: 'app-categorias-listar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <h1>Categorías</h1>

      <form class="quick" [formGroup]="form" (ngSubmit)="crear()">
        <input formControlName="nombre"     placeholder="Nombre" />
        <input formControlName="descripcion" placeholder="Descripción (opcional)" />
        <button type="submit" [disabled]="form.invalid">+ Agregar</button>
      </form>

      @if (cargando()) { <p class="placeholder">Cargando…</p> }
      @else {
        <table class="tabla">
          <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            @for (c of categorias(); track c.id) {
              <tr>
                <td>{{ c.id }}</td>
                <td>{{ c.nombre }}</td>
                <td>{{ c.descripcion }}</td>
                <td>{{ c.activo ? 'Activa' : 'Inactiva' }}</td>
                <td class="acciones">
                  <a [routerLink]="['/admin/categorias', c.id, 'subcategorias']">Subcategorías</a>
                  <button type="button" (click)="toggle(c)">{{ c.activo ? 'Desactivar' : 'Activar' }}</button>
                </td>
              </tr>
            } @empty { <tr><td colspan="5" class="placeholder">Sin categorías</td></tr> }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [`
    .page h1 { color: #1e3a8a; margin: 0 0 20px; }
    .quick { display: flex; gap: 10px; margin-bottom: 18px; background: #fff; padding: 14px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .quick input { flex: 1; padding: 9px 11px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; }
    .quick button { padding: 0 18px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-weight: 600;
      &:disabled { background: #94a3b8; } }
    .tabla { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .tabla th, .tabla td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .tabla th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
    .placeholder { color: #94a3b8; text-align: center; padding: 24px; }
    .acciones { display: flex; gap: 12px; }
    .acciones a { color: #1e40af; font-size: 13px; }
    .acciones button { background: none; border: none; color: #475569; font-size: 13px; padding: 0; cursor: pointer; }
  `]
})
export class CategoriasListarComponent implements OnInit {
  private srv = inject(CategoriaService);
  private fb = inject(FormBuilder);

  categorias = signal<Categoria[]>([]);
  cargando = signal(true);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.srv.listarTodas().subscribe(c => { this.categorias.set(c); this.cargando.set(false); });
  }

  crear(): void {
    if (this.form.invalid) return;
    this.srv.crear(this.form.getRawValue()).subscribe(() => { this.form.reset(); this.cargar(); });
  }

  toggle(c: Categoria): void {
    const op$ = c.activo ? this.srv.desactivar(c.id) : this.srv.activar(c.id);
    op$.subscribe(() => this.cargar());
  }
}
