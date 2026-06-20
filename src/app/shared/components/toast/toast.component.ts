import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (n of svc.mensajes(); track n.id) {
        <div class="toast" [class]="'toast--' + n.tipo">
          <span class="toast__icon">{{ icono(n.tipo) }}</span>
          <span class="toast__msg">{{ n.mensaje }}</span>
          <button type="button" class="toast__close" (click)="svc.descartar(n.id)" aria-label="Cerrar">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed; top: 16px; right: 16px;
      display: flex; flex-direction: column; gap: 8px;
      z-index: 9999;
      max-width: 360px;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,.10), 0 4px 6px -4px rgba(0,0,0,.05);
      border-left: 4px solid #94a3b8;
      animation: slide-in .2s ease-out;
    }
    .toast--success { border-left-color: #16a34a; }
    .toast--error   { border-left-color: #dc2626; }
    .toast--info    { border-left-color: #0ea5e9; }
    .toast--warning { border-left-color: #f59e0b; }
    .toast__icon { font-size: 18px; }
    .toast__msg  { flex: 1; font-size: 14px; color: #0f172a; }
    .toast__close {
      background: none; border: none; font-size: 20px; line-height: 1;
      color: #94a3b8; cursor: pointer; padding: 0 4px;
      &:hover { color: #0f172a; }
    }
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `]
})
export class ToastComponent {
  svc = inject(NotificacionService);

  icono(tipo: string): string {
    return tipo === 'success' ? '✓'
         : tipo === 'error'   ? '✕'
         : tipo === 'warning' ? '⚠'
         : 'ℹ';
  }
}
