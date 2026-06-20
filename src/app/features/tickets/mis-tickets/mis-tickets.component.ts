import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Ticket } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-mis-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <header class="head">
        <div>
          <h1>Mis tickets</h1>
          <p>Historial de incidencias que reportaste</p>
        </div>
        <a class="btn" routerLink="/cliente/tickets/nuevo">+ Nuevo ticket</a>
      </header>

      @if (cargando()) { <p class="placeholder">Cargando…</p> }
      @else if (tickets().length === 0) {
        <p class="placeholder">Aún no has creado tickets. Crea el primero con el botón de arriba.</p>
      }
      @else {
        <ul class="lista">
          @for (t of tickets(); track t.id) {
            <li [routerLink]="['/cliente/tickets', t.id]">
              <header>
                <strong>#{{ t.id }} · {{ t.titulo }}</strong>
                <div class="chips">
                  <span class="badge" [ngClass]="'badge--' + t.prioridad.toLowerCase()">{{ t.prioridad }}</span>
                  <span class="badge" [ngClass]="'badge--' + t.estado.toLowerCase()">{{ t.estado }}</span>
                </div>
              </header>
              <p>{{ t.descripcion }}</p>
              <footer>
                <small>{{ t.categoria.nombre }}</small>
                <small>{{ t.createdAt | date:'short' }}</small>
              </footer>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    h1 { margin: 0; color: #1e3a8a; }
    .head p { margin: 4px 0 0; color: #475569; font-size: 14px; }
    .btn { padding: 10px 16px; background: #1e40af; color: #fff; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; }
    .placeholder { color: #94a3b8; text-align: center; padding: 48px 24px; background: #fff; border-radius: 8px; }
    .lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .lista li { background: #fff; padding: 16px 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.05); cursor: pointer; transition: box-shadow .15s; }
    .lista li:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,.08); }
    .lista header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 6px; }
    .lista p { margin: 0 0 10px; color: #475569; font-size: 14px; }
    .lista footer { display: flex; gap: 12px; color: #94a3b8; font-size: 12px; }
    .chips { display: flex; gap: 6px; }
  `]
})
export class MisTicketsComponent implements OnInit {
  private srv = inject(TicketService);
  private auth = inject(AuthService);

  tickets = signal<Ticket[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    const sesion = this.auth.sesion();
    if (!sesion?.id) { this.cargando.set(false); return; }
    this.srv.porCliente(sesion.id).subscribe(t => {
      this.tickets.set(t);
      this.cargando.set(false);
    });
  }
}
