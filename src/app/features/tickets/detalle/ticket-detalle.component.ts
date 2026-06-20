import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EstadoLabelPipe } from '../../../shared/pipes/estado-label.pipe';
import { BadgeClassPipe } from '../../../shared/pipes/badge-class.pipe';
import { PrioridadLabelPipe } from '../../../shared/pipes/prioridad-label.pipe';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../../core/services/ticket.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ComentarioService } from '../../../core/services/comentario.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ComentarioTicket, HistorialTicket, Ticket } from '../../../core/models/ticket.model';
import { Usuario } from '../../../core/models/usuario.model';
import { ESTADOS, Estado } from '../../../core/models/estado.enum';

@Component({
  selector: 'app-ticket-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EstadoLabelPipe, BadgeClassPipe, PrioridadLabelPipe],
  template: `
    @if (ticket(); as t) {
      <section class="page">
        <header class="head">
          <div>
            <small>Ticket #{{ t.id }}</small>
            <h1>{{ t.titulo }}</h1>
          </div>
          <div class="head__chips">
            <span class="badge" [ngClass]="'badge--' + t.estado.toLowerCase()">{{ t.estado }}</span>
            <span class="badge" [ngClass]="'badge--' + t.prioridad.toLowerCase()">{{ t.prioridad }}</span>
          </div>
        </header>

        <div class="grid">
          <article class="card">
            <h3>Descripción</h3>
            <p>{{ t.descripcion }}</p>

            <dl class="meta">
              <dt>Cliente</dt><dd>{{ t.cliente.nombre }} {{ t.cliente.apellido }}</dd>
              <dt>Categoría</dt><dd>{{ t.categoria.nombre }}</dd>
              @if (t.subcategoria) { <dt>Subcategoría</dt><dd>{{ t.subcategoria.nombre }}</dd> }
              <dt>Técnico</dt><dd>{{ t.tecnico ? (t.tecnico.nombre + ' ' + t.tecnico.apellido) : 'Sin asignar' }}</dd>
              <dt>Creado</dt><dd>{{ t.createdAt | date:'medium' }}</dd>
              @if (t.fechaResolucion) { <dt>Resuelto</dt><dd>{{ t.fechaResolucion | date:'medium' }}</dd> }
            </dl>
          </article>

          @if (puedeCambiarEstado()) {
            <article class="card">
              <h3>Cambiar estado</h3>
              <form [formGroup]="form" (ngSubmit)="enviar()" class="form">
                <label>
                  <span>Nuevo estado</span>
                  <select formControlName="estadoNuevo">
                    @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
                  </select>
                </label>

                @if (puedeAsignar()) {
                  <label>
                    <span>Asignar a técnico</span>
                    <select formControlName="tecnicoId">
                      <option [ngValue]="null">— Sin asignar —</option>
                      @for (te of tecnicos(); track te.id) {
                        <option [ngValue]="te.id">{{ te.nombre }} {{ te.apellido }}</option>
                      }
                    </select>
                  </label>
                }

                <label>
                  <span>Comentario</span>
                  <textarea formControlName="comentario" rows="3"></textarea>
                </label>

                <button type="submit" [disabled]="form.invalid || guardando()">
                  {{ guardando() ? 'Guardando…' : 'Aplicar cambio' }}
                </button>
              </form>
            </article>
          } @else {
            <article class="card card--muted">
              <h3>Seguimiento</h3>
              <p>Esta vista es de solo lectura para tu rol. Recibirás actualizaciones del técnico
                 asignado en el historial.</p>
            </article>
          }

          <article class="card card--wide">
            <h3>Comentarios</h3>

            <form [formGroup]="formComentario" (ngSubmit)="enviarComentario()" class="comentario-form">
              <textarea formControlName="mensaje" rows="2" placeholder="Escribe un comentario…"></textarea>
              <div class="comentario-form__actions">
                @if (puedeComentarInterno()) {
                  <label class="check">
                    <input type="checkbox" formControlName="interno" /> Comentario interno (solo equipo)
                  </label>
                }
                <button type="submit" [disabled]="formComentario.invalid || enviandoComentario()">
                  {{ enviandoComentario() ? 'Enviando…' : 'Comentar' }}
                </button>
              </div>
            </form>

            @if (comentarios().length === 0) {
              <p class="placeholder">Sin comentarios todavía.</p>
            } @else {
              <ul class="comentarios">
                @for (c of comentarios(); track c.id) {
                  <li [class.interno]="c.interno">
                    <header>
                      <strong>{{ c.autor.nombre }} {{ c.autor.apellido }}</strong>
                      <span>{{ c.createdAt | date:'short' }}</span>
                      @if (c.interno) { <span class="tag-interno">interno</span> }
                    </header>
                    <p>{{ c.mensaje }}</p>
                  </li>
                }
              </ul>
            }
          </article>

          <article class="card card--wide">
            <h3>Historial</h3>
            @if (historial().length === 0) {
              <p class="placeholder">Sin eventos registrados</p>
            } @else {
              <ol class="timeline">
                @for (h of historial(); track h.id) {
                  <li>
                    <strong>{{ h.estadoNuevo | estadoLabel }}</strong>
                    <span>{{ h.createdAt | date:'short' }} · {{ h.usuario.nombre }} {{ h.usuario.apellido }}</span>
                    @if (h.comentario) { <p>{{ h.comentario }}</p> }
                  </li>
                }
              </ol>
            }
          </article>
        </div>
      </section>
    } @else if (cargando()) {
      <p>Cargando ticket…</p>
    }
  `,
  styles: [`
    .page { max-width: 1100px; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .head h1 { margin: 4px 0 0; color: #1e3a8a; }
    .head small { color: #94a3b8; font-size: 12px; letter-spacing: .05em; text-transform: uppercase; }
    .head__chips { display: flex; gap: 8px; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px;
            @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .card h3 { margin: 0 0 14px; color: #1e3a8a; font-size: 15px; }
    .card--wide { grid-column: 1 / -1; }
    .card--muted { background: #f1f5f9; color: #475569; }
    .card--muted p { margin: 0; font-size: 13px; line-height: 1.5; }
    .meta { display: grid; grid-template-columns: 130px 1fr; gap: 6px 12px; margin: 12px 0 0; font-size: 13px;
            @media (max-width: 480px) { grid-template-columns: 100px 1fr; font-size: 12px; } }
    .meta dt { color: #94a3b8; }
    .meta dd { margin: 0; color: #0f172a; word-break: break-word; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .form label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #475569; }
    .form select, .form textarea { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form button { padding: 10px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;
      &:disabled { background: #94a3b8; } }
    .timeline { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .timeline li { border-left: 3px solid #1e40af; padding: 4px 0 4px 12px; }
    .timeline strong { display: block; color: #1e3a8a; font-size: 13px; }
    .timeline span { color: #94a3b8; font-size: 12px; }
    .timeline p { margin: 4px 0 0; font-size: 13px; color: #475569; }
    .placeholder { color: #94a3b8; font-style: italic; }

    .comentario-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
    .comentario-form textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; font-family: inherit; resize: vertical; }
    .comentario-form__actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .comentario-form__actions button { padding: 8px 16px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer;
      &:disabled { background: #94a3b8; cursor: not-allowed; } }
    .check { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; }

    .comentarios { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .comentarios li { background: #f8fafc; padding: 10px 14px; border-radius: 6px; border-left: 3px solid #1e40af; }
    .comentarios li.interno { background: #fef9c3; border-left-color: #f59e0b; }
    .comentarios header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; font-size: 13px; }
    .comentarios header strong { color: #0f172a; }
    .comentarios header span { color: #94a3b8; font-size: 11px; }
    .tag-interno { background: #f59e0b; color: #fff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .comentarios p { margin: 0; color: #475569; font-size: 13px; line-height: 1.5; }
  `]
})
export class TicketDetalleComponent implements OnInit {
  private srv = inject(TicketService);
  private usrSrv = inject(UsuarioService);
  private comentarioSrv = inject(ComentarioService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notif = inject(NotificacionService);

  estados = ESTADOS;

  ticket = signal<Ticket | null>(null);
  historial = signal<HistorialTicket[]>([]);
  tecnicos = signal<Usuario[]>([]);
  comentarios = signal<ComentarioTicket[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  enviandoComentario = signal(false);

  form = this.fb.nonNullable.group({
    estadoNuevo: ['EN_ATENCION' as Estado, Validators.required],
    tecnicoId:   [null as number | null],
    comentario:  ['']
  });

  formComentario = this.fb.nonNullable.group({
    mensaje: ['', Validators.required],
    interno: [false]
  });

  puedeAsignar(): boolean {
    return this.auth.rol() === 'ADMIN';
  }

  puedeCambiarEstado(): boolean {
    const r = this.auth.rol();
    return r === 'ADMIN' || r === 'TECNICO';
  }

  puedeComentarInterno(): boolean {
    const r = this.auth.rol();
    return r === 'ADMIN' || r === 'TECNICO';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const incluirInternos = this.puedeComentarInterno();

    forkJoin({
      t: this.srv.porId(id),
      h: this.srv.historial(id),
      tec: this.usrSrv.listarTecnicos(),
      com: this.comentarioSrv.porTicket(id, incluirInternos)
    }).subscribe({
      next: ({ t, h, tec, com }) => {
        this.ticket.set(t);
        this.historial.set(h);
        this.tecnicos.set(tec);
        this.comentarios.set(com);
        this.form.patchValue({
          estadoNuevo: t.estado,
          tecnicoId: t.tecnico?.id ?? null
        });
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.notif.error('No se pudo cargar el ticket');
      }
    });
  }

  enviarComentario(): void {
    const t = this.ticket();
    const sesion = this.auth.sesion();
    if (!t || !sesion || this.formComentario.invalid) return;

    this.enviandoComentario.set(true);
    const v = this.formComentario.getRawValue();
    this.comentarioSrv.crear(t.id, sesion.id, { mensaje: v.mensaje, interno: v.interno }).subscribe({
      next: nuevo => {
        this.comentarios.update(arr => [...arr, nuevo]);
        this.formComentario.reset({ mensaje: '', interno: false });
        this.enviandoComentario.set(false);
        this.notif.success('Comentario agregado');
      },
      error: () => {
        this.enviandoComentario.set(false);
        this.notif.error('No se pudo agregar el comentario');
      }
    });
  }

  enviar(): void {
    const t = this.ticket();
    const sesion = this.auth.sesion();
    if (!t || !sesion) return;

    this.guardando.set(true);
    const v = this.form.getRawValue();
    this.srv.cambiarEstado(t.id, sesion.id, {
      estadoNuevo: v.estadoNuevo,
      tecnicoId: v.tecnicoId ?? undefined,
      comentario: v.comentario || undefined
    }).subscribe({
      next: tk => {
        this.ticket.set(tk);
        this.srv.historial(tk.id).subscribe(h => this.historial.set(h));
        this.form.patchValue({ comentario: '' });
        this.notif.success('Cambio aplicado');
        this.guardando.set(false);
      },
      error: () => {
        this.notif.error('No se pudo aplicar el cambio');
        this.guardando.set(false);
      }
    });
  }
}
