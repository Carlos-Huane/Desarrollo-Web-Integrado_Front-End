import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { Ticket } from '../../../core/models/ticket.model';
import { ESTADOS, Estado } from '../../../core/models/estado.enum';
import { PRIORIDADES, Prioridad } from '../../../core/models/prioridad.enum';
import { EstadoLabelPipe } from '../../../shared/pipes/estado-label.pipe';
import { PrioridadLabelPipe } from '../../../shared/pipes/prioridad-label.pipe';
import { BadgeClassPipe } from '../../../shared/pipes/badge-class.pipe';

type Orden = 'fecha-desc' | 'fecha-asc' | 'prioridad';

@Component({
  selector: 'app-tickets-listar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EstadoLabelPipe, PrioridadLabelPipe, BadgeClassPipe],
  templateUrl: './tickets-listar.component.html',
  styleUrl: './tickets-listar.component.scss'
})
export class TicketsListarComponent implements OnInit {
  private srv = inject(TicketService);
  private notif = inject(NotificacionService);

  estados = ESTADOS;
  prioridades = PRIORIDADES;
  private readonly prioOrden: Record<Prioridad, number> = {
    CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3, SIN_ASIGNAR: 4
  };

  tickets = signal<Ticket[]>([]);
  cargando = signal(true);

  busqueda = signal('');
  filtroEstado = signal<'' | Estado>('');
  filtroPrioridad = signal<'' | Prioridad>('');
  orden = signal<Orden>('fecha-desc');

  pagina = signal(1);
  readonly TAM_PAGINA = 15;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const est = this.filtroEstado();
    const pri = this.filtroPrioridad();
    const ord = this.orden();

    const filtrado = this.tickets()
      .filter(t => !q
        || t.titulo.toLowerCase().includes(q)
        || t.descripcion.toLowerCase().includes(q))
      .filter(t => !est || t.estado === est)
      .filter(t => !pri || t.prioridad === pri);

    return [...filtrado].sort((a, b) => {
      if (ord === 'fecha-desc') return b.createdAt.localeCompare(a.createdAt);
      if (ord === 'fecha-asc')  return a.createdAt.localeCompare(b.createdAt);
      return this.prioOrden[a.prioridad] - this.prioOrden[b.prioridad];
    });
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.TAM_PAGINA)));

  pagina$ = computed(() => {
    const inicio = (this.pagina() - 1) * this.TAM_PAGINA;
    return this.filtrados().slice(inicio, inicio + this.TAM_PAGINA);
  });

  ngOnInit(): void {
    this.srv.listar().subscribe({
      next: t => { this.tickets.set(t); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.notif.error('No se pudo cargar tickets'); }
    });
  }

  onBuscar(v: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => { this.busqueda.set(v); this.pagina.set(1); }, 300);
  }

  onFiltroEstado(v: string):    void { this.filtroEstado.set(v as '' | Estado);       this.pagina.set(1); }
  onFiltroPrioridad(v: string): void { this.filtroPrioridad.set(v as '' | Prioridad); this.pagina.set(1); }
  onOrden(v: string):           void { this.orden.set(v as Orden);                    this.pagina.set(1); }

  irAPagina(n: number): void {
    if (n < 1 || n > this.totalPaginas()) return;
    this.pagina.set(n);
  }
}
