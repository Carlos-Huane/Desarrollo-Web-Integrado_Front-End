import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { RankingService } from '../../core/services/ranking.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Conteo, ResumenDashboard, TecnicoRanking } from '../../core/models/dashboard.model';
import { ChartCanvasComponent } from '../../shared/components/chart-canvas/chart-canvas.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartCanvasComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dashSrv = inject(DashboardService);
  private rankSrv = inject(RankingService);
  private notif = inject(NotificacionService);

  cargando = signal(true);
  resumen = signal<ResumenDashboard | null>(null);
  porEstado = signal<Conteo[]>([]);
  porPrioridad = signal<Conteo[]>([]);
  porCategoria = signal<Conteo[]>([]);
  topTecnicos = signal<TecnicoRanking[]>([]);

  graficoEstado = computed<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: this.porEstado().map(c => this.formatear(c.etiqueta)),
      datasets: [{
        data: this.porEstado().map(c => c.total),
        backgroundColor: this.porEstado().map(c => this.colorEstado(c.etiqueta)),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } }
    }
  }));

  graficoPrioridad = computed<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: this.porPrioridad().map(c => this.formatear(c.etiqueta)),
      datasets: [{
        label: 'Tickets',
        data: this.porPrioridad().map(c => c.total),
        backgroundColor: this.porPrioridad().map(c => this.colorPrioridad(c.etiqueta)),
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  }));

  graficoCategoria = computed<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: this.porCategoria().map(c => c.etiqueta),
      datasets: [{
        label: 'Tickets',
        data: this.porCategoria().map(c => c.total),
        backgroundColor: '#1e40af',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  }));

  ngOnInit(): void {
    forkJoin({
      resumen:      this.dashSrv.resumen(),
      porEstado:    this.dashSrv.ticketsPorEstado(),
      porPrioridad: this.dashSrv.ticketsPorPrioridad(),
      porCategoria: this.dashSrv.ticketsPorCategoria(),
      top:          this.rankSrv.topTecnicos(5)
    }).subscribe({
      next: r => {
        this.resumen.set(r.resumen);
        this.porEstado.set(r.porEstado);
        this.porPrioridad.set(r.porPrioridad);
        this.porCategoria.set(r.porCategoria);
        this.topTecnicos.set(r.top);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.notif.error('No se pudo cargar el dashboard');
      }
    });
  }

  formatear(etiqueta: string): string {
    return etiqueta.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private colorEstado(e: string): string {
    return ({
      NUEVO: '#6b7280', EN_ATENCION: '#0ea5e9', ESCALADO: '#f59e0b',
      RESUELTO: '#16a34a', CERRADO: '#1f2937'
    } as Record<string, string>)[e] ?? '#94a3b8';
  }

  private colorPrioridad(p: string): string {
    return ({
      CRITICA: '#dc2626', ALTA: '#f97316', MEDIA: '#facc15',
      BAJA: '#16a34a', SIN_ASIGNAR: '#94a3b8'
    } as Record<string, string>)[p] ?? '#94a3b8';
  }
}
