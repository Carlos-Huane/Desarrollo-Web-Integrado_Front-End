import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket.model';
import { ESTADOS, Estado } from '../../../core/models/estado.enum';
import { PRIORIDADES, Prioridad } from '../../../core/models/prioridad.enum';

@Component({
  selector: 'app-tickets-listar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <h1>Tickets</h1>

      <div class="filtros">
        <select [(ngModel)]="filtroEstado">
          <option value="">Todos los estados</option>
          @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
        </select>

        <select [(ngModel)]="filtroPrioridad">
          <option value="">Todas las prioridades</option>
          @for (p of prioridades; track p) { <option [value]="p">{{ p }}</option> }
        </select>
      </div>

      @if (cargando()) { <p class="placeholder">Cargando…</p> }
      @else {
        <table class="tabla">
          <thead>
            <tr><th>ID</th><th>Título</th><th>Cliente</th><th>Técnico</th><th>Prioridad</th><th>Estado</th><th>Creado</th></tr>
          </thead>
          <tbody>
            @for (t of ticketsFiltrados(); track t.id) {
              <tr [routerLink]="['/admin/tickets', t.id]" class="clickable">
                <td>#{{ t.id }}</td>
                <td>{{ t.titulo }}</td>
                <td>{{ t.cliente.nombre }} {{ t.cliente.apellido }}</td>
                <td>{{ t.tecnico ? (t.tecnico.nombre + ' ' + t.tecnico.apellido) : '—' }}</td>
                <td><span class="badge" [ngClass]="'badge--' + t.prioridad.toLowerCase()">{{ t.prioridad }}</span></td>
                <td><span class="badge" [ngClass]="'badge--' + t.estado.toLowerCase()">{{ t.estado }}</span></td>
                <td>{{ t.createdAt | date:'short' }}</td>
              </tr>
            } @empty { <tr><td colspan="7" class="placeholder">Sin tickets</td></tr> }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [`
    .page h1 { color: #1e3a8a; margin: 0 0 16px; }
    .filtros { display: flex; gap: 10px; margin-bottom: 16px; }
    .filtros select { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; background: #fff; }
    .tabla { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .tabla th, .tabla td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .tabla th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
    .clickable { cursor: pointer; transition: background-color .1s; }
    .clickable:hover { background: #f8fafc; }
    .placeholder { color: #94a3b8; text-align: center; padding: 24px; }
  `]
})
export class TicketsListarComponent implements OnInit {
  private srv = inject(TicketService);

  estados = ESTADOS;
  prioridades = PRIORIDADES;

  tickets = signal<Ticket[]>([]);
  cargando = signal(true);

  filtroEstado: '' | Estado = '';
  filtroPrioridad: '' | Prioridad = '';

  ticketsFiltrados = computed(() =>
    this.tickets()
      .filter(t => !this.filtroEstado    || t.estado    === this.filtroEstado)
      .filter(t => !this.filtroPrioridad || t.prioridad === this.filtroPrioridad)
  );

  ngOnInit(): void {
    this.srv.listar().subscribe(t => { this.tickets.set(t); this.cargando.set(false); });
  }
}
