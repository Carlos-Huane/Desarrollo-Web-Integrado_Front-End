import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SlaConfig, SlaUpdateRequest } from '../models/sla.model';

@Injectable({ providedIn: 'root' })
export class SlaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/sla`;

  listar(): Observable<SlaConfig[]> {
    return this.http.get<SlaConfig[]>(this.url);
  }

  actualizar(id: number, req: SlaUpdateRequest): Observable<SlaConfig> {
    return this.http.put<SlaConfig>(`${this.url}/${id}`, req);
  }
}
