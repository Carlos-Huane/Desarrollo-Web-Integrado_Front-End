import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TicketService } from '../../core/services/ticket.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Ticket } from '../../core/models/ticket.model';
import { Estado } from '../../core/models/estado.enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private ticketSrv = inject(TicketService);
  private usuarioSrv = inject(UsuarioService);

  cargando = signal(true);
  totalTickets = signal(0);
  totalNuevos = signal(0);
  totalEnAtencion = signal(0);
  totalResueltos = signal(0);
  totalCerrados = signal(0);
  totalTecnicos = signal(0);

  ngOnInit(): void {
    forkJoin({
      tickets: this.ticketSrv.listar(),
      tecnicos: this.usuarioSrv.listarTecnicos()
    }).subscribe({
      next: ({ tickets, tecnicos }) => {
        this.calcular(tickets);
        this.totalTecnicos.set(tecnicos.length);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  private calcular(tickets: Ticket[]): void {
    this.totalTickets.set(tickets.length);
    const count = (e: Estado) => tickets.filter(t => t.estado === e).length;
    this.totalNuevos.set(count('NUEVO'));
    this.totalEnAtencion.set(count('EN_ATENCION'));
    this.totalResueltos.set(count('RESUELTO'));
    this.totalCerrados.set(count('CERRADO'));
  }
}
