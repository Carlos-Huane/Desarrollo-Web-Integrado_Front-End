import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Categoria } from '../../../core/models/categoria.model';

interface CategoriaEditable extends Categoria {
  editando?: boolean;
  draftNombre?: string;
  draftDescripcion?: string;
}

@Component({
  selector: 'app-categorias-listar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <h1>Categorías</h1>

      <form class="quick" [formGroup]="form" (ngSubmit)="crear()">
        <input formControlName="nombre"     placeholder="Nombre de categoría" />
        <input formControlName="descripcion" placeholder="Descripción (opcional)" />
        <button type="submit" [disabled]="form.invalid">+ Agregar</button>
      </form>

      @if (cargando()) { <p class="placeholder">Cargando…</p> }
      @else {
        <table class="tabla">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            @for (c of categorias(); track c.id) {
              <tr>
                <td>{{ c.id }}</td>
                <td>
                  @if (c.editando) {
                    <input type="text" [(ngModel)]="c.draftNombre" class="inline" />
                  } @else {
                    {{ c.nombre }}
                  }
                </td>
                <td>
                  @if (c.editando) {
                    <input type="text" [(ngModel)]="c.draftDescripcion" class="inline" />
                  } @else {
                    <span class="desc">{{ c.descripcion || '—' }}</span>
                  }
                </td>
                <td>{{ c.activo ? 'Activa' : 'Inactiva' }}</td>
                <td class="acciones">
                  @if (c.editando) {
                    <button type="button" class="ok"     (click)="guardarEdicion(c)">Guardar</button>
                    <button type="button" class="cancel" (click)="cancelarEdicion(c)">Cancelar</button>
                  } @else {
                    <button type="button" (click)="iniciarEdicion(c)">Editar</button>
                    <a [routerLink]="['/admin/categorias', c.id, 'subcategorias']">Subcategorías</a>
                    <button type="button" (click)="toggle(c)">{{ c.activo ? 'Desactivar' : 'Activar' }}</button>
                  }
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
    .quick button { padding: 0 18px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;
      &:disabled { background: #94a3b8; cursor: not-allowed; } }
    .tabla { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .tabla th, .tabla td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; vertical-align: middle; }
    .tabla th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
    .placeholder { color: #94a3b8; text-align: center; padding: 24px; }
    .desc { color: #475569; }
    .acciones { display: flex; gap: 12px; align-items: center; }
    .acciones a { color: #1e40af; font-size: 13px; }
    .acciones button { background: none; border: none; color: #475569; font-size: 13px; padding: 0; cursor: pointer;
      &.ok     { color: #16a34a; font-weight: 600; }
      &.cancel { color: #dc2626; }
      &:hover { color: #1e40af; } }
    .inline { padding: 6px 8px; border: 1px solid #1e40af; border-radius: 4px; font-size: 13px; width: 100%; }
  `]
})
export class CategoriasListarComponent implements OnInit {
  private srv = inject(CategoriaService);
  private fb = inject(FormBuilder);
  private notif = inject(NotificacionService);
  private confirm = inject(ConfirmService);

  categorias = signal<CategoriaEditable[]>([]);
  cargando = signal(true);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.srv.listarTodas().subscribe({
      next: c => { this.categorias.set(c); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.notif.error('No se pudo cargar categorías'); }
    });
  }

  crear(): void {
    if (this.form.invalid) return;
    this.srv.crear(this.form.getRawValue()).subscribe({
      next: () => { this.notif.success('Categoría creada'); this.form.reset(); this.cargar(); },
      error: () => this.notif.error('No se pudo crear la categoría')
    });
  }

  iniciarEdicion(c: CategoriaEditable): void {
    c.editando = true;
    c.draftNombre = c.nombre;
    c.draftDescripcion = c.descripcion ?? '';
  }

  cancelarEdicion(c: CategoriaEditable): void {
    c.editando = false;
    c.draftNombre = undefined;
    c.draftDescripcion = undefined;
  }

  guardarEdicion(c: CategoriaEditable): void {
    const nombre = (c.draftNombre ?? '').trim();
    if (!nombre) { this.notif.warning('El nombre no puede estar vacío'); return; }

    this.srv.actualizar(c.id, { nombre, descripcion: c.draftDescripcion }).subscribe({
      next: () => { this.notif.success('Categoría actualizada'); this.cargar(); },
      error: () => this.notif.error('No se pudo actualizar')
    });
  }

  async toggle(c: Categoria): Promise<void> {
    if (c.activo) {
      const ok = await this.confirm.preguntar({
        titulo: 'Desactivar categoría',
        mensaje: `"${c.nombre}" no estará disponible para nuevos tickets.`,
        textoConfirmar: 'Desactivar',
        tipo: 'peligro'
      });
      if (!ok) return;
    }

    const op$ = c.activo ? this.srv.desactivar(c.id) : this.srv.activar(c.id);
    op$.subscribe({
      next: () => { this.notif.success(`Categoría ${c.activo ? 'desactivada' : 'activada'}`); this.cargar(); },
      error: () => this.notif.error('No se pudo cambiar el estado')
    });
  }
}
