import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, SesionUsuario } from '../models/auth.model';
import { Rol } from '../models/rol.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly endpoint = `${environment.apiBaseUrl}/auth`;

  readonly sesion = signal<SesionUsuario | null>(this.leerSesion());
  readonly isAuthenticated = computed(() => this.sesion() !== null);
  readonly rol = computed<Rol | null>(() => this.sesion()?.rol ?? null);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.endpoint}/login`, req).pipe(
      tap(res => this.guardarSesion(res))
    );
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    this.sesion.set(null);
    this.router.navigateByUrl('/login');
  }

  obtenerToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  rutaInicialPorRol(rol: Rol): string {
    switch (rol) {
      case 'ADMIN':   return '/admin/dashboard';
      case 'TECNICO': return '/tecnico/bandeja';
      case 'CLIENTE': return '/cliente/mis-tickets';
    }
  }

  private guardarSesion(res: LoginResponse): void {
    localStorage.setItem(environment.tokenKey, res.token);
    const sesion: SesionUsuario = {
      id: res.id,
      email: res.email,
      rol: res.rol,
      nombreCompleto: res.nombreCompleto
    };
    localStorage.setItem(environment.userKey, JSON.stringify(sesion));
    this.sesion.set(sesion);
  }

  private leerSesion(): SesionUsuario | null {
    const raw = localStorage.getItem(environment.userKey);
    if (!raw) return null;
    try { return JSON.parse(raw) as SesionUsuario; } catch { return null; }
  }
}
