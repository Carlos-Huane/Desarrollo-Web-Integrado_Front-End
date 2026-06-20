import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../../core/services/ticket.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HistorialTicket, Ticket } from '../../../core/models/ticket.model';
import { Usuario } from '../../../core/models/usuario.model';
import { ESTADOS, Estado } from '../../../core/models/estado.enum';

@Component({
  selector: 'app-ticket-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
                  <select formControlName="nuevoEstado">
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
            <h3>Historial</h3>
            @if (historial().length === 0) {
              <p class="placeholder">Sin eventos registrados</p>
            } @else {
              <ol class="timeline">
                @for (h of historial(); track h.id) {
                  <li>
                    <strong>{{ h.estadoNuevo }}</strong>
                    <span>{{ h.fechaCambio | date:'short' }} · {{ h.usuario.nombre }}</span>
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
    .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 16px; }
    .head h1 { margin: 4px 0 0; color: #1e3a8a; }
    .head small { color: #94a3b8; font-size: 12px; letter-spacing: .05em; text-transform: uppercase; }
    .head__chips { display: flex; gap: 8px; }
    .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .card h3 { margin: 0 0 14px; color: #1e3a8a; font-size: 15px; }
    .card--wide { grid-column: 1 / -1; }
    .card--muted { background: #f1f5f9; color: #475569; }
    .card--muted p { margin: 0; font-size: 13px; line-height: 1.5; }
    .meta { display: grid; grid-template-columns: 130px 1fr; gap: 6px 12px; margin: 12px 0 0; font-size: 13px; }
    .meta dt { color: #94a3b8; }
    .meta dd { margin: 0; color: #0f172a; }
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
  `]
})
export class TicketDetalleComponent implements OnInit {
  private srv = inject(TicketService);
  private usrSrv = inject(UsuarioService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notif = inject(NotificacionService);

  estados = ESTADOS;

  ticket = signal<Ticket | null>(null);
  historial = signal<HistorialTicket[]>([]);
  tecnicos = signal<Usuario[]>([]);
  cargando = signal(true);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    nuevoEstado: ['EN_ATENCION' as Estado, Validators.required],
    tecnicoId:   [null as number | null],
    comentario:  ['']
  });

  puedeAsignar(): boolean {
    return this.auth.rol() === 'ADMIN';
  }

  puedeCambiarEstado(): boolean {
    const r = this.auth.rol();
    return r === 'ADMIN' || r === 'TECNICO';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      t: this.srv.porId(id),
      h: this.srv.historial(id),
      tec: this.usrSrv.listarTecnicos()
    }).subscribe(({ t, h, tec }) => {
      this.ticket.set(t);
      this.historial.set(h);
      this.tecnicos.set(tec);
      this.form.patchValue({
        nuevoEstado: t.estado,
        tecnicoId: t.tecnico?.id ?? null
      });
      this.cargando.set(false);
    });
  }

  enviar(): void {
    const t = this.ticket();
    const sesion = this.auth.sesion();
    if (!t || !sesion?.id) return;

    this.guardando.set(true);
    const v = this.form.getRawValue();
    this.srv.cambiarEstado(t.id, sesion.id, {
      nuevoEstado: v.nuevoEstado,
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
