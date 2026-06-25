import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (svc.dialog(); as d) {
      <div class="overlay" (click)="svc.cancelar()">
        <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <h2 class="modal__title">{{ d.titulo }}</h2>
          <p class="modal__msg">{{ d.mensaje }}</p>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" (click)="svc.cancelar()">
              {{ d.textoCancelar }}
            </button>
            <button type="button"
                    class="btn"
                    [class.btn--peligro]="d.tipo === 'peligro'"
                    [class.btn--primary]="d.tipo !== 'peligro'"
                    (click)="svc.confirmar()">
              {{ d.textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(15,23,42,.5);
      display: grid; place-items: center;
      z-index: 9998;
      animation: fade .15s ease-out;
    }
    .modal {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
      padding: 24px;
      max-width: 440px;
      width: calc(100% - 32px);
      animation: pop .15s ease-out;
    }
    .modal__title { margin: 0 0 8px; color: #1e3a8a; font-size: 18px; }
    .modal__msg   { margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.5; }
    .modal__actions { display: flex; justify-content: flex-end; gap: 8px; }
    .btn { padding: 9px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 14px; cursor: pointer; }
    .btn--primary { background: #1e40af; color: #fff; &:hover { background: #1e3a8a; } }
    .btn--peligro { background: #dc2626; color: #fff; &:hover { background: #b91c1c; } }
    .btn--ghost   { background: #f1f5f9; color: #475569; &:hover { background: #e2e8f0; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pop  { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class ConfirmDialogComponent {
  svc = inject(ConfirmService);
}
