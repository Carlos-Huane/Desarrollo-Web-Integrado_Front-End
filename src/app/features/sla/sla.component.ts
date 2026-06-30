import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlaService } from '../../core/services/sla.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { SlaConfig } from '../../core/models/sla.model';

@Component({
  selector: 'app-sla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <h1>Configuración de SLA</h1>
      <p class="lead">Tiempos máximos de respuesta y resolución por prioridad (en horas).</p>

      @if (cargando()) { <p class="placeholder">Cargando…</p> }
      @else {
        <table class="tabla">
          <thead>
            <tr>
              <th>Prioridad</th>
              <th>Respuesta (h)</th>
              <th>Resolución (h)</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (s of items(); track s.id) {
              <tr [class.invalido]="!esValido(s)" [class.guardando]="guardandoId() === s.id">
                <td><strong>{{ s.prioridad }}</strong></td>
                <td><input type="number" min="1" [(ngModel)]="s.tiempoRespuestaHoras" [disabled]="guardandoId() === s.id" /></td>
                <td><input type="number" min="1" [(ngModel)]="s.tiempoResolucionHoras" [disabled]="guardandoId() === s.id" /></td>
                <td><input type="text" [(ngModel)]="s.descripcion" [disabled]="guardandoId() === s.id" /></td>
                <td>
                  <button (click)="guardar(s)"
                          [disabled]="!esValido(s) || !esModificado(s) || guardandoId() === s.id">
                    {{ guardandoId() === s.id ? 'Guardando…' : (esModificado(s) ? 'Guardar' : 'Sin cambios') }}
                  </button>
                </td>
              </tr>
              @if (!esValido(s)) {
                <tr class="fila-error">
                  <td colspan="5">{{ obtenerError(s) }}</td>
                </tr>
              }
            }
          </tbody>
        </table>
        <p class="hint">Reglas: ambos valores deben ser mayores a 0 y respuesta ≤ resolución.</p>
      }
    </section>
  `,
  styles: [`
    h1 { color: #1e3a8a; margin: 0 0 4px; }
    .lead { color: #475569; margin: 0 0 18px; }
    .tabla { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .tabla th, .tabla td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; vertical-align: middle; }
    .tabla th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
    .tabla tr.invalido { background: #fef2f2; }
    .tabla tr.guardando { opacity: 0.7; }
    .fila-error td { padding: 10px 14px; background: #fee2e2; color: #991b1b; font-size: 13px; border-bottom: 1px solid #fecaca; }
    input { padding: 7px 9px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; width: 100%; box-sizing: border-box; }
    button {
      padding: 7px 14px; background: #1e40af; color: #fff; border: none; border-radius: 6px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      &:disabled { background: #94a3b8; cursor: not-allowed; }
    }
    .placeholder { color: #94a3b8; padding: 24px; text-align: center; }
    .hint { margin: 10px 2px 0; font-size: 12px; color: #94a3b8; }
  `]
})
export class SlaComponent implements OnInit {
  private srv = inject(SlaService);
  private notif = inject(NotificacionService);

  items = signal<SlaConfig[]>([]);
  cargando = signal(true);
  guardandoId = signal<number | null>(null);
  private originalItems = new Map<number, SlaConfig>();

  ngOnInit(): void {
    this.srv.listar().subscribe({
      next: i => {
        this.items.set(i);
        this.originalItems.clear();
        i.forEach(s => this.originalItems.set(s.id, { ...s }));
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); this.notif.error('No se pudo cargar la configuración'); }
    });
  }

  obtenerError(s: SlaConfig): string | null {
    if (s.tiempoRespuestaHoras == null || s.tiempoRespuestaHoras <= 0) {
      return 'El tiempo de respuesta debe ser al menos 1 hora.';
    }
    if (s.tiempoResolucionHoras == null || s.tiempoResolucionHoras <= 0) {
      return 'El tiempo de resolución debe ser al menos 1 hora.';
    }
    if (s.tiempoRespuestaHoras > s.tiempoResolucionHoras) {
      return 'La respuesta no puede ser mayor que la resolución.';
    }
    if (!s.descripcion?.trim()) {
      return 'La descripción no puede estar vacía.';
    }
    return null;
  }

  esValido(s: SlaConfig): boolean {
    return this.obtenerError(s) === null;
  }

  esModificado(s: SlaConfig): boolean {
    const original = this.originalItems.get(s.id);
    if (!original) return true;
    return original.tiempoRespuestaHoras !== s.tiempoRespuestaHoras
        || original.tiempoResolucionHoras !== s.tiempoResolucionHoras
        || (original.descripcion ?? '') !== (s.descripcion ?? '');
  }

  guardar(s: SlaConfig): void {
    if (!this.esValido(s)) {
      this.notif.warning('Revisa los valores antes de guardar');
      return;
    }
    if (!this.esModificado(s)) {
      this.notif.info('No hay cambios para guardar');
      return;
    }

    this.guardandoId.set(s.id);
    this.srv.actualizar(s.id, {
      tiempoRespuestaHoras: s.tiempoRespuestaHoras,
      tiempoResolucionHoras: s.tiempoResolucionHoras,
      descripcion: s.descripcion
    }).subscribe({
      next: () => {
        this.originalItems.set(s.id, { ...s });
        this.guardandoId.set(null);
        this.notif.success(`SLA de ${s.prioridad} actualizado`);
      },
      error: () => { this.guardandoId.set(null); this.notif.error('No se pudo guardar'); }
    });
  }
}
