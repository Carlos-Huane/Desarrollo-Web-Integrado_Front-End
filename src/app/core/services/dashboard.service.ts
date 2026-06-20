import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Conteo,
  ResumenDashboard,
  TecnicoConteo
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/dashboard`;

  resumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(`${this.url}/resumen`);
  }

  ticketsPorEstado(): Observable<Conteo[]> {
    return this.http.get<Conteo[]>(`${this.url}/tickets-por-estado`);
  }

  ticketsPorPrioridad(): Observable<Conteo[]> {
    return this.http.get<Conteo[]>(`${this.url}/tickets-por-prioridad`);
  }

  ticketsPorCategoria(): Observable<Conteo[]> {
    return this.http.get<Conteo[]>(`${this.url}/tickets-por-categoria`);
  }

  ticketsPorTecnico(): Observable<TecnicoConteo[]> {
    return this.http.get<TecnicoConteo[]>(`${this.url}/tickets-por-tecnico`);
  }
}
