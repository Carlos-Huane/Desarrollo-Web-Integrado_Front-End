import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <section class="page">
      <div class="card">
        <h1>404</h1>
        <p>La página que buscas no existe o fue movida.</p>
        <button type="button" class="btn" (click)="volver()">Volver al inicio</button>
      </div>
    </section>
  `,
  styles: [`
    .page { min-height: 100vh; display: grid; place-items: center; background: #f8fafc; padding: 24px; }
    .card { background: #fff; padding: 40px 32px; border-radius: 12px; max-width: 380px; text-align: center;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,.10); display: flex; flex-direction: column; gap: 14px; }
    h1 { margin: 0; color: #1e40af; font-size: 64px; line-height: 1; }
    p  { margin: 0 0 8px; color: #475569; font-size: 14px; }
    .btn { padding: 10px 16px; border-radius: 6px; border: none; background: #1e40af; color: #fff;
           font-weight: 600; font-size: 14px; cursor: pointer; &:hover { background: #1e3a8a; } }
  `]
})
export class NotFoundComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  volver(): void {
    const rol = this.auth.rol();
    this.router.navigateByUrl(rol ? this.auth.rutaInicialPorRol(rol) : '/login');
  }
}
