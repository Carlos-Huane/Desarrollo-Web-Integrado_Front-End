import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { Subcategoria } from '../../../core/models/categoria.model';

/*
 * ============================================================================
 * TODO — HU-CAT-02 + HU-CAT-03 (asignado al Development Team)
 * ----------------------------------------------------------------------------
 * Componente: gestión de subcategorías de una categoría.
 *
 * Lo que está hecho: scaffold + carga inicial + creación básica.
 *
 * Falta:
 * - Validación visual de errores en formulario reactivo.
 * - Edición inline del nombre/descripción de cada subcategoría.
 * - Confirmación antes de operaciones destructivas.
 * - Estados de carga por fila durante PATCH.
 * - Diseño responsive (mobile-first hasta 640px).
 *
 * Endpoint backend:
 *   GET  /api/categorias/{idCategoria}/subcategorias
 *   POST /api/categorias/subcategorias
 * ============================================================================
 */
@Component({
  selector: 'app-subcategorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <a routerLink="/admin/categorias" class="back">← Volver a categorías</a>
      <h1>Subcategorías</h1>

      <form class="quick" [formGroup]="form" (ngSubmit)="crear()">
        <input formControlName="nombre"     placeholder="Nombre de subcategoría" />
        <input formControlName="descripcion" placeholder="Descripción (opcional)" />
        <button type="submit" [disabled]="form.invalid">+ Agregar</button>
      </form>

      @if (cargando()) { <p>Cargando…</p> }
      @else {
        <ul class="lista">
          @for (s of subs(); track s.id) {
            <li>
              <strong>{{ s.nombre }}</strong>
              <small>{{ s.descripcion }}</small>
            </li>
          } @empty { <li class="vacio">Aún no hay subcategorías</li> }
        </ul>
      }
    </section>
  `,
  styles: [`
    .page h1 { color: #1e3a8a; margin: 8px 0 18px; }
    .back { font-size: 13px; color: #475569; }
    .quick { display: flex; gap: 10px; margin-bottom: 18px; background: #fff; padding: 14px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .quick input { flex: 1; padding: 9px 11px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; }
    .quick button { padding: 0 18px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-weight: 600; }
    .lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .lista li { background: #fff; padding: 12px 16px; border-radius: 6px; display: flex; flex-direction: column; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .lista small { color: #475569; font-size: 12px; }
    .vacio { color: #94a3b8; font-style: italic; }
  `]
})
export class SubcategoriasComponent implements OnInit {
  private srv = inject(CategoriaService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  idCategoria = signal<number>(0);
  subs = signal<Subcategoria[]>([]);
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
    this.srv.subcategoriasPorCategoria(this.idCategoria()).subscribe(s => {
      this.subs.set(s); this.cargando.set(false);
    });
  }

  crear(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.srv.crearSubcategoria({ ...v, categoriaId: this.idCategoria() })
      .subscribe(() => { this.form.reset(); this.cargar(); });
  }
}
