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
    // El back recibe la entidad Subcategoria con relación @ManyToOne `categoria`.
    // Hay que mandar { categoria: { id } } en vez de categoriaId plano.
    return this.http.post<Subcategoria>(`${this.url}/subcategorias`, {
      nombre: req.nombre,
      descripcion: req.descripcion,
      activo: true,
      categoria: { id: req.categoriaId }
    });
  }

  actualizarSubcategoria(id: number, req: SubcategoriaRequest): Observable<Subcategoria> {
    return this.http.put<Subcategoria>(`${this.url}/subcategorias/${id}`, {
      nombre: req.nombre,
      descripcion: req.descripcion,
      activo: true,
      categoria: { id: req.categoriaId }
    });
  }

  activarSubcategoria(id: number): Observable<Subcategoria> {
    return this.http.patch<Subcategoria>(`${this.url}/subcategorias/${id}/activar`, {});
  }

  desactivarSubcategoria(id: number): Observable<Subcategoria> {
    return this.http.patch<Subcategoria>(`${this.url}/subcategorias/${id}/desactivar`, {});
  }
}
