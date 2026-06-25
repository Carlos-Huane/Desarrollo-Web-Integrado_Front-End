import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaRanking, TecnicoRanking } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/ranking`;

  rankingTecnicos(): Observable<TecnicoRanking[]> {
    return this.http.get<TecnicoRanking[]>(`${this.url}/tecnicos`);
  }

  topTecnicos(limite: number): Observable<TecnicoRanking[]> {
    return this.http.get<TecnicoRanking[]>(`${this.url}/tecnicos/top/${limite}`);
  }

  rankingCategorias(): Observable<CategoriaRanking[]> {
    return this.http.get<CategoriaRanking[]>(`${this.url}/categorias`);
  }

  topCategorias(limite: number): Observable<CategoriaRanking[]> {
    return this.http.get<CategoriaRanking[]>(`${this.url}/categorias/top/${limite}`);
  }
}
