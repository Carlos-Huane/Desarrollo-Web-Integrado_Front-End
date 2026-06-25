import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  template: `
    <section class="page">
      <div class="card">
        <div class="card__icon">🔒</div>
        <h1>Acceso no autorizado</h1>
        <p>Tu rol actual ({{ auth.rol() ?? '—' }}) no tiene permiso para ver esta sección.</p>
        <button type="button" class="btn" (click)="irAInicio()">Ir a mi inicio</button>
        <button type="button" class="btn btn--ghost" (click)="cerrarSesion()">Cerrar sesión</button>
      </div>
    </section>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f8fafc;
      padding: 24px;
    }
    .card {
      background: #fff; padding: 40px 32px; border-radius: 12px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,.10);
      max-width: 420px; text-align: center;
      display: flex; flex-direction: column; gap: 12px;
    }
    .card__icon { font-size: 48px; }
    h1 { margin: 0; color: #1e3a8a; font-size: 22px; }
    p  { margin: 0 0 12px; color: #475569; font-size: 14px; }
    .btn {
      padding: 10px 16px; border-radius: 6px; border: none;
      font-weight: 600; font-size: 14px; cursor: pointer;
      background: #1e40af; color: #fff;
      &:hover { background: #1e3a8a; }
      &--ghost { background: transparent; color: #475569;
        &:hover { background: #f1f5f9; } }
    }
  `]
})
export class NoAutorizadoComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  irAInicio(): void {
    const rol = this.auth.rol();
    this.router.navigateByUrl(rol ? this.auth.rutaInicialPorRol(rol) : '/login');
  }

  cerrarSesion(): void { this.auth.logout(); }
}
