import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Subcategoria } from '../../../core/models/categoria.model';

interface SubcategoriaEditable extends Subcategoria {
  editando?: boolean;
  draftNombre?: string;
  draftDescripcion?: string;
}

@Component({
  selector: 'app-subcategorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <a routerLink="/admin/categorias" class="back">← Volver a categorías</a>
      <h1>Subcategorías</h1>

      <form class="quick" [formGroup]="form" (ngSubmit)="crear()">
        <input formControlName="nombre"     placeholder="Nombre de subcategoría" />
        <input formControlName="descripcion" placeholder="Descripción (opcional)" />
        <button type="submit" [disabled]="form.invalid">+ Agregar</button>
      </form>

      @if (cargando()) { <p class="placeholder">Cargando…</p> }
      @else {
        <table class="tabla">
          <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th></th></tr></thead>
          <tbody>
            @for (s of subs(); track s.id) {
              <tr>
                <td>{{ s.id }}</td>
                <td>
                  @if (s.editando) {
                    <input type="text" [(ngModel)]="s.draftNombre" class="inline" />
                  } @else { {{ s.nombre }} }
                </td>
                <td>
                  @if (s.editando) {
                    <input type="text" [(ngModel)]="s.draftDescripcion" class="inline" />
                  } @else { <span class="desc">{{ s.descripcion || '—' }}</span> }
                </td>
                <td class="acciones">
                  @if (s.editando) {
                    <button type="button" class="ok"     (click)="guardar(s)">Guardar</button>
                    <button type="button" class="cancel" (click)="cancelar(s)">Cancelar</button>
                  } @else {
                    <button type="button" (click)="iniciar(s)">Editar</button>
                  }
                </td>
              </tr>
            } @empty { <tr><td colspan="4" class="placeholder">Aún no hay subcategorías</td></tr> }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [`
    .page h1 { color: #1e3a8a; margin: 8px 0 18px; }
    .back { font-size: 13px; color: #475569; }
    .quick { display: flex; gap: 10px; margin-bottom: 18px; background: #fff; padding: 14px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .quick input { flex: 1; padding: 9px 11px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; }
    .quick button { padding: 0 18px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;
      &:disabled { background: #94a3b8; cursor: not-allowed; } }
    .tabla { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .tabla th, .tabla td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; vertical-align: middle; }
    .tabla th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
    .desc { color: #475569; }
    .placeholder { color: #94a3b8; text-align: center; padding: 24px; }
    .acciones { display: flex; gap: 12px; }
    .acciones button { background: none; border: none; color: #475569; font-size: 13px; padding: 0; cursor: pointer;
      &.ok     { color: #16a34a; font-weight: 600; }
      &.cancel { color: #dc2626; }
      &:hover { color: #1e40af; } }
    .inline { padding: 6px 8px; border: 1px solid #1e40af; border-radius: 4px; font-size: 13px; width: 100%; box-sizing: border-box; }
  `]
})
export class SubcategoriasComponent implements OnInit {
  private srv = inject(CategoriaService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notif = inject(NotificacionService);

  idCategoria = signal<number>(0);
  subs = signal<SubcategoriaEditable[]>([]);
  cargando = signal(true);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.idCategoria.set(Number(this.route.snapshot.paramMap.get('id') ?? 0));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.srv.subcategoriasPorCategoria(this.idCategoria()).subscribe({
      next: s => { this.subs.set(s); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.notif.error('No se pudo cargar subcategorías'); }
    });
  }

  crear(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (this.subs().some(s => s.nombre.toLowerCase() === v.nombre.toLowerCase().trim())) {
      this.notif.warning('Ya existe una subcategoría con ese nombre');
      return;
    }
    this.srv.crearSubcategoria({ ...v, categoriaId: this.idCategoria() }).subscribe({
      next: () => { this.notif.success('Subcategoría creada'); this.form.reset(); this.cargar(); },
      error: () => this.notif.error('No se pudo crear la subcategoría')
    });
  }

  iniciar(s: SubcategoriaEditable): void {
    s.editando = true;
    s.draftNombre = s.nombre;
    s.draftDescripcion = s.descripcion ?? '';
  }

  cancelar(s: SubcategoriaEditable): void {
    s.editando = false;
    s.draftNombre = undefined;
    s.draftDescripcion = undefined;
  }

  guardar(s: SubcategoriaEditable): void {
    const nombre = (s.draftNombre ?? '').trim();
    if (!nombre) { this.notif.warning('El nombre no puede estar vacío'); return; }
    this.srv.actualizarSubcategoria(s.id, {
      nombre,
      descripcion: s.draftDescripcion,
      categoriaId: this.idCategoria()
    }).subscribe({
      next: () => { this.notif.success('Subcategoría actualizada'); this.cargar(); },
      error: () => this.notif.error('No se pudo actualizar')
    });
  }
}
