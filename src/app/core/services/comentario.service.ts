import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComentarioRequest, ComentarioTicket } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/comentarios`;

  porTicket(ticketId: number, incluirInternos = false): Observable<ComentarioTicket[]> {
    const params = new HttpParams().set('incluirInternos', incluirInternos);
    return this.http.get<ComentarioTicket[]>(`${this.url}/ticket/${ticketId}`, { params });
  }

  crear(ticketId: number, autorId: number, req: ComentarioRequest): Observable<ComentarioTicket> {
    return this.http.post<ComentarioTicket>(
      `${this.url}/ticket/${ticketId}/usuario/${autorId}`, req
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
