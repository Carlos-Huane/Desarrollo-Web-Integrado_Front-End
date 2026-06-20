import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { TicketService } from '../../core/services/ticket.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Ticket } from '../../core/models/ticket.model';
import { ESTADOS, ESTADO_LABEL, Estado } from '../../core/models/estado.enum';
import { PRIORIDADES, PRIORIDAD_LABEL, Prioridad } from '../../core/models/prioridad.enum';
import { ChartCanvasComponent } from '../../shared/components/chart-canvas/chart-canvas.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartCanvasComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private ticketSrv = inject(TicketService);
  private usuarioSrv = inject(UsuarioService);

  cargando = signal(true);
  tickets = signal<Ticket[]>([]);
  totalTecnicos = signal(0);

  totalTickets    = computed(() => this.tickets().length);
  totalNuevos     = computed(() => this.tickets().filter(t => t.estado === 'NUEVO').length);
  totalEnAtencion = computed(() => this.tickets().filter(t => t.estado === 'EN_ATENCION').length);
  totalResueltos  = computed(() => this.tickets().filter(t => t.estado === 'RESUELTO').length);
  totalCerrados   = computed(() => this.tickets().filter(t => t.estado === 'CERRADO').length);

  graficoEstado = computed<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: ESTADOS.map(e => ESTADO_LABEL[e]),
      datasets: [{
        data: ESTADOS.map(e => this.tickets().filter(t => t.estado === e).length),
        backgroundColor: ['#6b7280', '#0ea5e9', '#f59e0b', '#16a34a', '#1f2937'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } }
    }
  }));

  graficoPrioridad = computed<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: PRIORIDADES.map(p => PRIORIDAD_LABEL[p]),
      datasets: [{
        label: 'Tickets',
        data: PRIORIDADES.map(p => this.tickets().filter(t => t.prioridad === p).length),
        backgroundColor: ['#dc2626', '#f97316', '#facc15', '#16a34a', '#94a3b8'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  }));

  ngOnInit(): void {
    forkJoin({
      tickets: this.ticketSrv.listar(),
      tecnicos: this.usuarioSrv.listarTecnicos()
    }).subscribe({
      next: ({ tickets, tecnicos }) => {
        this.tickets.set(tickets);
        this.totalTecnicos.set(tecnicos.length);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
