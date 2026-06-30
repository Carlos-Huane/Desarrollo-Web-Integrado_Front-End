import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Categoria, Subcategoria } from '../../../core/models/categoria.model';
import { PRIORIDADES, PRIORIDAD_LABEL } from '../../../core/models/prioridad.enum';

@Component({
  selector: 'app-ticket-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="head">
        <a routerLink="/cliente/mis-tickets" class="back">← Volver</a>
        <h1>Nuevo ticket</h1>
        <p class="lead">Describe tu incidencia con el mayor detalle posible para que el técnico pueda atenderte.</p>
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

        <label class="field" [class.field--invalid]="invalido('titulo')">
          <span class="field__label">Título <em>*</em></span>
          <input type="text" formControlName="titulo" maxlength="120" placeholder="Resumen corto del problema" />
          <small class="field__hint">Máximo 120 caracteres.</small>
          @if (invalido('titulo')) {
            <small class="field__error">
              {{ form.controls.titulo.errors?.['required'] ? 'El título es obligatorio' : 'Demasiado largo' }}
            </small>
          }
        </label>

        <label class="field" [class.field--invalid]="invalido('descripcion')">
          <span class="field__label">Descripción <em>*</em></span>
          <textarea formControlName="descripcion" rows="5" placeholder="¿Qué está pasando? Incluye cuándo empezó, qué intentaste, mensajes de error..."></textarea>
          @if (invalido('descripcion')) {
            <small class="field__error">La descripción es obligatoria</small>
          }
        </label>

        <div class="grid">
          <label class="field" [class.field--invalid]="invalido('categoriaId')">
            <span class="field__label">Categoría <em>*</em></span>
            <select formControlName="categoriaId" (change)="onCategoriaChange()">
              <option [ngValue]="null">— Selecciona una categoría —</option>
              @for (c of categorias(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }
            </select>
            @if (invalido('categoriaId')) {
              <small class="field__error">Selecciona una categoría</small>
            }
          </label>

          <label class="field">
            <span class="field__label">Subcategoría</span>
            <select formControlName="subcategoriaId" [disabled]="subcategorias().length === 0">
              <option [ngValue]="null">— Opcional —</option>
              @for (s of subcategorias(); track s.id) { <option [ngValue]="s.id">{{ s.nombre }}</option> }
            </select>
            @if (form.controls.categoriaId.value && subcategorias().length === 0) {
              <small class="field__hint">Esta categoría no tiene subcategorías.</small>
            }
          </label>

          <label class="field">
            <span class="field__label">Prioridad <em>*</em></span>
            <select formControlName="prioridad">
              @for (p of prioridades; track p) { <option [value]="p">{{ etiqueta(p) }}</option> }
            </select>
          </label>
        </div>

        <div class="actions">
          <button type="button" class="btn btn--ghost" (click)="cancelar()" [disabled]="enviando()">Cancelar</button>
          <button type="submit" class="btn btn--primary" [disabled]="enviando()">
            {{ enviando() ? 'Enviando…' : 'Crear ticket' }}
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
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
      @media (max-width: 720px) { grid-template-columns: 1fr; }
    }

    .field {
      display: flex; flex-direction: column; gap: 6px;
      &__label { font-size: 13px; font-weight: 600; color: #334155;
        em { color: #dc2626; font-style: normal; margin-left: 2px; } }
      &__hint  { color: #94a3b8; font-size: 12px; }
      &__error { color: #dc2626; font-size: 12px; font-weight: 500; }
      input, select, textarea {
        padding: 10px 12px;
        border: 1px solid #e2e8f0; border-radius: 6px;
        font-size: 14px; color: #0f172a;
        background: #fff;
        font-family: inherit;
        transition: border-color .12s, box-shadow .12s;
        &:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30,64,175,.12); }
        &:disabled { background: #f8fafc; color: #94a3b8; }
      }
      textarea { resize: vertical; min-height: 100px; }
      &--invalid input, &--invalid select, &--invalid textarea {
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
  intentoEnviar = signal(false);

  form = this.fb.nonNullable.group({
    titulo:         ['', [Validators.required, Validators.maxLength(120)]],
    descripcion:    ['', Validators.required],
    categoriaId:    [null as number | null, Validators.required],
    subcategoriaId: [null as number | null],
    prioridad:      ['MEDIA' as const, Validators.required]
  });

  etiqueta(p: string): string { return PRIORIDAD_LABEL[p as keyof typeof PRIORIDAD_LABEL]; }

  invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || this.intentoEnviar());
  }

  mostrarErrorGlobal(): boolean {
    return this.intentoEnviar() && this.form.invalid;
  }

  ngOnInit(): void {
    this.catSrv.listarActivas().subscribe({
      next: c => this.categorias.set(c),
      error: () => {
        this.notif.error('No se pudieron cargar las categorías');
      }
    });
  }

  onCategoriaChange(): void {
    const id = this.form.controls.categoriaId.value;
    this.form.patchValue({ subcategoriaId: null });
    this.subcategorias.set([]);
    if (!id) { return; }

    this.catSrv.subcategoriasPorCategoria(id).subscribe({
      next: s => this.subcategorias.set(s),
      error: () => {
        this.subcategorias.set([]);
        this.notif.error('No se pudieron cargar las subcategorías');
      }
    });
  }

  enviar(): void {
    this.intentoEnviar.set(true);
    this.errorMsg.set(null);

    const sesion = this.auth.sesion();
    if (!sesion) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notif.warning('Revisa los campos marcados antes de enviar');
      return;
    }

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
      error: e => {
        this.enviando.set(false);
        const errores = e?.error?.errores;
        if (errores && typeof errores === 'object') {
          this.errorMsg.set(Object.entries(errores).map(([k, v]) => `${k}: ${v}`).join(' · '));
        } else {
          this.errorMsg.set(e?.error?.message ?? 'Error al crear ticket');
        }
      }
    });
  }

  cancelar(): void { this.router.navigate(['/cliente/mis-tickets']); }
}
