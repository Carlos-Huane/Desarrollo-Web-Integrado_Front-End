import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Ticket } from '../../../core/models/ticket.model';

/*
 * ============================================================================
 * TODO — HU-TEC-01 + HU-TEC-02 (asignado al Development Team)
 * ----------------------------------------------------------------------------
 * Componente: bandeja del técnico. Lista los tickets que tiene asignados.
 *
 * Lo que está hecho: carga + render kanban básico por estado.
 *
 * Falta:
 * - Agrupación visual tipo kanban (3 columnas: EN_ATENCION, ESCALADO, RESUELTO).
 * - Drag & drop para mover tickets entre estados (opcional).
 * - Filtro por prioridad y orden por antigüedad/SLA.
 * - Acceso rápido a "cambiar estado" desde la card sin entrar al detalle.
 * - Indicador visual cuando alertaSlaEnviada = true.
 *
 * Endpoint backend: GET /api/tickets/tecnico/{tecnicoId}
 * ============================================================================
 */
@Component({
  selector: 'app-bandeja-tecnico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <h1>Mi bandeja</h1>

      @if (cargando()) { <p>Cargando…</p> }
      @else {
        <div class="lista">
          @for (t of tickets(); track t.id) {
            <article class="ticket" [routerLink]="['/tecnico/tickets', t.id]">
              <header>
                <strong>#{{ t.id }} {{ t.titulo }}</strong>
                <span class="badge" [ngClass]="'badge--' + t.estado.toLowerCase()">{{ t.estado }}</span>
              </header>
              <p>{{ t.descripcion }}</p>
              <footer>
                <small>{{ t.cliente.nombre }} {{ t.cliente.apellido }}</small>
                <span class="badge" [ngClass]="'badge--' + t.prioridad.toLowerCase()">{{ t.prioridad }}</span>
                @if (t.alertaSlaEnviada) { <span class="sla">⚠ SLA</span> }
              </footer>
            </article>
          } @empty {
            <p class="vacio">No tienes tickets asignados.</p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    h1 { color: #1e3a8a; margin: 0 0 18px; }
    .lista { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .ticket { background: #fff; padding: 16px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); cursor: pointer; transition: box-shadow .15s; }
    .ticket:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,.08); }
    .ticket header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
    .ticket p { margin: 0 0 10px; color: #475569; font-size: 13px; }
    .ticket footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: #94a3b8; font-size: 12px; }
    .sla { color: #dc2626; font-weight: 600; font-size: 11px; }
    .vacio { color: #94a3b8; }
  `]
})
export class BandejaTecnicoComponent implements OnInit {
  private srv = inject(TicketService);
  private auth = inject(AuthService);

  tickets = signal<Ticket[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    const sesion = this.auth.sesion();
    if (!sesion?.id) { this.cargando.set(false); return; }
    this.srv.bandejaTecnico(sesion.id).subscribe(t => {
      this.tickets.set(t);
      this.cargando.set(false);
    });
  }
}
