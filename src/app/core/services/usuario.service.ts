import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/usuarios`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  listarActivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/activos`);
  }

  listarTecnicos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/tecnicos`);
  }

  porId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  crear(req: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, req);
  }

  actualizar(id: number, req: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, req);
  }

  activar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.url}/${id}/desactivar`, {});
  }
}
