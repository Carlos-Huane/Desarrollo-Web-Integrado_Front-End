import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  CategoriaRequest,
  Subcategoria,
  SubcategoriaRequest
} from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/categorias`;

  listarActivas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.url);
  }

  listarTodas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.url}/todas`);
  }

  crear(req: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, req);
  }

  actualizar(id: number, req: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.url}/${id}`, req);
  }

  activar(id: number): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${id}/activar`, {});
  }

  desactivar(id: number): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${id}/desactivar`, {});
  }

  subcategoriasPorCategoria(idCategoria: number): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${this.url}/${idCategoria}/subcategorias`);
  }

  crearSubcategoria(req: SubcategoriaRequest): Observable<Subcategoria> {
    return this.http.post<Subcategoria>(`${this.url}/subcategorias`, req);
  }
}
