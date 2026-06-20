import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../../core/services/ticket.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Categoria, Subcategoria } from '../../../core/models/categoria.model';
import { PRIORIDADES } from '../../../core/models/prioridad.enum';

@Component({
  selector: 'app-ticket-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <h1>Nuevo ticket</h1>
      <p class="lead">Describe tu incidencia con el mayor detalle posible.</p>

      <form [formGroup]="form" (ngSubmit)="enviar()" class="form">
        <label>
          <span>Título</span>
          <input formControlName="titulo" maxlength="120" placeholder="Resumen corto" />
        </label>

        <label>
          <span>Descripción</span>
          <textarea formControlName="descripcion" rows="5" placeholder="¿Qué está pasando?"></textarea>
        </label>

        <div class="row">
          <label>
            <span>Categoría</span>
            <select formControlName="categoriaId" (change)="onCategoriaChange()">
              <option [ngValue]="null">— Selecciona —</option>
              @for (c of categorias(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }
            </select>
          </label>

          <label>
            <span>Subcategoría (opcional)</span>
            <select formControlName="subcategoriaId">
              <option [ngValue]="null">— Ninguna —</option>
              @for (s of subcategorias(); track s.id) { <option [ngValue]="s.id">{{ s.nombre }}</option> }
            </select>
          </label>

          <label>
            <span>Prioridad</span>
            <select formControlName="prioridad">
              @for (p of prioridades; track p) { <option [value]="p">{{ p }}</option> }
            </select>
          </label>
        </div>

        @if (errorMsg()) { <div class="alert">{{ errorMsg() }}</div> }

        <div class="actions">
          <button type="button" (click)="cancelar()">Cancelar</button>
          <button type="submit" [disabled]="form.invalid || enviando()">
            {{ enviando() ? 'Enviando…' : 'Crear ticket' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .page { max-width: 720px; }
    h1 { color: #1e3a8a; margin: 0 0 4px; }
    .lead { color: #475569; margin: 0 0 20px; }
    .form { display: flex; flex-direction: column; gap: 14px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #475569; }
    input, textarea, select { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .alert { background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 6px; font-size: 13px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; }
    .actions button { padding: 10px 18px; border-radius: 6px; border: none; font-weight: 600; font-size: 14px; cursor: pointer; }
    .actions button[type=button] { background: #f1f5f9; color: #475569; }
    .actions button[type=submit] { background: #1e40af; color: #fff;
      &:disabled { background: #94a3b8; cursor: not-allowed; } }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
  `]
})
export class TicketCrearComponent implements OnInit {
  private ticketSrv = inject(TicketService);
  private catSrv = inject(CategoriaService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notif = inject(NotificacionService);

  prioridades = PRIORIDADES;
  categorias = signal<Categoria[]>([]);
  subcategorias = signal<Subcategoria[]>([]);
  enviando = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    titulo:         ['', [Validators.required, Validators.maxLength(120)]],
    descripcion:    ['', Validators.required],
    categoriaId:    [null as number | null, Validators.required],
    subcategoriaId: [null as number | null],
    prioridad:      ['MEDIA' as const, Validators.required]
  });

  ngOnInit(): void {
    this.catSrv.listarActivas().subscribe(c => this.categorias.set(c));
  }

  onCategoriaChange(): void {
    const id = this.form.controls.categoriaId.value;
    this.form.patchValue({ subcategoriaId: null });
    if (!id) { this.subcategorias.set([]); return; }
    this.catSrv.subcategoriasPorCategoria(id).subscribe(s => this.subcategorias.set(s));
  }

  enviar(): void {
    const sesion = this.auth.sesion();
    if (this.form.invalid || !sesion?.id) return;

    this.enviando.set(true);
    const v = this.form.getRawValue();
    this.ticketSrv.crear(sesion.id, {
      titulo: v.titulo,
      descripcion: v.descripcion,
      prioridad: v.prioridad,
      categoriaId: v.categoriaId!,
      subcategoriaId: v.subcategoriaId ?? undefined
    }).subscribe({
      next: () => {
        this.notif.success('Ticket creado correctamente');
        this.router.navigate(['/cliente/mis-tickets']);
      },
      error: e => { this.errorMsg.set(e?.error?.message ?? 'Error al crear ticket'); this.enviando.set(false); }
    });
  }

  cancelar(): void { this.router.navigate(['/cliente/mis-tickets']); }
}
