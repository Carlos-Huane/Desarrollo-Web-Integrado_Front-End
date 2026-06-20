import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Ticket } from '../../../core/models/ticket.model';
import { Estado, ESTADO_LABEL } from '../../../core/models/estado.enum';
import { EstadoLabelPipe } from '../../../shared/pipes/estado-label.pipe';
import { PrioridadLabelPipe } from '../../../shared/pipes/prioridad-label.pipe';
import { BadgeClassPipe } from '../../../shared/pipes/badge-class.pipe';

interface Columna {
  estado: Estado;
  label: string;
  tickets: Ticket[];
}

@Component({
  selector: 'app-bandeja-tecnico',
  standalone: true,
  imports: [CommonModule, RouterLink, EstadoLabelPipe, PrioridadLabelPipe, BadgeClassPipe],
  template: `
    <section class="page">
      <header class="head">
        <div>
          <h1>Mi bandeja</h1>
          <p>{{ tickets().length }} tickets asignados</p>
        </div>
      </header>

      @if (cargando()) {
        <p class="placeholder">Cargando…</p>
      } @else if (tickets().length === 0) {
        <p class="placeholder">No tienes tickets asignados.</p>
      } @else {
        <div class="kanban">
          @for (col of columnas(); track col.estado) {
            <article class="col">
              <header class="col__head" [attr.data-estado]="col.estado">
                <span>{{ col.label }}</span>
                <span class="col__count">{{ col.tickets.length }}</span>
              </header>

              <div class="col__body">
                @for (t of col.tickets; track t.id) {
                  <article class="card">
                    <header>
                      <a [routerLink]="['/tecnico/tickets', t.id]" class="card__title">
                        #{{ t.id }} · {{ t.titulo }}
                      </a>
                      @if (t.alertaSlaEnviada) {
                        <span class="sla" title="SLA en riesgo">⚠ SLA</span>
                      }
                    </header>
                    <p class="card__desc">{{ t.descripcion }}</p>
                    <footer>
                      <span [class]="t.prioridad | badgeClass">{{ t.prioridad | prioridadLabel }}</span>
                      <small>{{ t.cliente.nombre }} {{ t.cliente.apellido }}</small>
                    </footer>

                    <div class="card__quick">
                      @for (e of siguientesEstados(t.estado); track e) {
                        <button type="button"
                                class="quick-btn"
                                [disabled]="actualizandoId() === t.id"
                                (click)="cambiarRapido(t, e)">
                          → {{ e | estadoLabel }}
                        </button>
                      }
                    </div>
                  </article>
                } @empty {
                  <p class="col__vacio">Sin tickets</p>
                }
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px; }
    h1 { color: #1e3a8a; margin: 0; }
    .head p { margin: 4px 0 0; color: #475569; font-size: 14px; }
    .placeholder { color: #94a3b8; text-align: center; padding: 48px 24px; background: #fff; border-radius: 8px; }

    .kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
      @media (max-width: 900px) { grid-template-columns: 1fr; } }

    .col { background: #f1f5f9; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .col__head {
      display: flex; justify-content: space-between; align-items: center;
      font-weight: 700; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px;
      text-transform: uppercase; letter-spacing: .05em;
    }
    .col__head[data-estado="EN_ATENCION"] { background: #0ea5e9; }
    .col__head[data-estado="ESCALADO"]    { background: #f59e0b; }
    .col__head[data-estado="RESUELTO"]    { background: #16a34a; }
    .col__count { background: rgba(255,255,255,.25); padding: 2px 8px; border-radius: 999px; font-size: 12px; }
    .col__body  { display: flex; flex-direction: column; gap: 10px; min-height: 120px; }
    .col__vacio { color: #94a3b8; font-style: italic; text-align: center; padding: 18px 0; font-size: 13px; }

    .card { background: #fff; border-radius: 6px; padding: 12px 14px; box-shadow: 0 1px 2px rgba(0,0,0,.05);
            display: flex; flex-direction: column; gap: 8px; }
    .card header { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
    .card__title { font-weight: 600; color: #0f172a; font-size: 13px; line-height: 1.3; text-decoration: none;
      &:hover { color: #1e40af; } }
    .card__desc { margin: 0; color: #475569; font-size: 12px; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #94a3b8; }
    .sla { color: #dc2626; font-weight: 700; font-size: 11px; }

    .card__quick { display: flex; gap: 6px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid #f1f5f9; }
    .quick-btn {
      background: #f1f5f9; color: #475569; border: none;
      padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;
      &:hover:not(:disabled) { background: #e2e8f0; color: #1e40af; }
      &:disabled { opacity: .5; cursor: not-allowed; }
    }
  `]
})
export class BandejaTecnicoComponent implements OnInit {
  private srv = inject(TicketService);
  private auth = inject(AuthService);
  private notif = inject(NotificacionService);
  private confirm = inject(ConfirmService);

  private readonly columnasOrden: Estado[] = ['EN_ATENCION', 'ESCALADO', 'RESUELTO'];

  tickets = signal<Ticket[]>([]);
  cargando = signal(true);
  actualizandoId = signal<number | null>(null);

  columnas = computed<Columna[]>(() =>
    this.columnasOrden.map(e => ({
      estado: e,
      label: ESTADO_LABEL[e],
      tickets: this.tickets().filter(t => t.estado === e)
    }))
  );

  ngOnInit(): void {
    const sesion = this.auth.sesion();
    if (!sesion?.id) { this.cargando.set(false); return; }
    this.srv.bandejaTecnico(sesion.id).subscribe({
      next: t => { this.tickets.set(t); this.cargando.set(false); },
      error: () => {
        this.cargando.set(false);
        this.notif.error('No se pudo cargar la bandeja');
      }
    });
  }

  siguientesEstados(actual: Estado): Estado[] {
    switch (actual) {
      case 'NUEVO':       return ['EN_ATENCION', 'ESCALADO'];
      case 'EN_ATENCION': return ['ESCALADO', 'RESUELTO'];
      case 'ESCALADO':    return ['EN_ATENCION', 'RESUELTO'];
      case 'RESUELTO':    return ['CERRADO'];
      default:            return [];
    }
  }

  async cambiarRapido(t: Ticket, nuevoEstado: Estado): Promise<void> {
    const ok = await this.confirm.preguntar({
      titulo: `Mover a ${ESTADO_LABEL[nuevoEstado]}`,
      mensaje: `¿Confirmas el cambio de estado del ticket #${t.id}?`,
      textoConfirmar: 'Sí, cambiar'
    });
    if (!ok) return;

    const sesion = this.auth.sesion();
    if (!sesion?.id) return;

    this.actualizandoId.set(t.id);
    this.srv.cambiarEstado(t.id, sesion.id, { nuevoEstado }).subscribe({
      next: actualizado => {
        this.tickets.update(arr =>
          actualizado.estado === 'CERRADO'
            ? arr.filter(x => x.id !== t.id)
            : arr.map(x => x.id === actualizado.id ? actualizado : x)
        );
        this.actualizandoId.set(null);
        this.notif.success(`Ticket #${t.id} → ${ESTADO_LABEL[nuevoEstado]}`);
      },
      error: () => {
        this.actualizandoId.set(null);
        this.notif.error('No se pudo cambiar el estado');
      }
    });
  }
}
