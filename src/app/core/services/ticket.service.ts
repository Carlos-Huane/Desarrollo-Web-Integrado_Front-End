import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CambioEstadoRequest,
  HistorialTicket,
  Ticket,
  TicketRequest
} from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/tickets`;

  listar(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.url);
  }

  porId(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/${id}`);
  }

  porCliente(clienteId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/cliente/${clienteId}`);
  }

  bandejaTecnico(tecnicoId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/tecnico/${tecnicoId}`);
  }

  crear(clienteId: number, req: TicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.url}/cliente/${clienteId}`, req);
  }

  cambiarEstado(
    ticketId: number,
    usuarioId: number,
    req: CambioEstadoRequest
  ): Observable<Ticket> {
    return this.http.patch<Ticket>(
      `${this.url}/${ticketId}/estado/${usuarioId}`,
      req
    );
  }

  historial(ticketId: number): Observable<HistorialTicket[]> {
    return this.http.get<HistorialTicket[]>(`${this.url}/${ticketId}/historial`);
  }
}
