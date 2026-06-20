import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlaService } from '../../core/services/sla.service';
import { SlaConfig } from '../../core/models/sla.model';

/*
 * ============================================================================
 * TODO — HU-SLA-01 (asignado al Development Team)
 * ----------------------------------------------------------------------------
 * Componente: configuración de SLA por prioridad.
 *
 * Lo que está hecho: carga + edición inline básica + guardado por fila.
 *
 * Falta:
 * - Validaciones (horas > 0, respuesta <= resolución).
 * - Confirmación al guardar con feedback visual (toast/snackbar).
 * - Reseteo a valores por defecto.
 * - Mostrar último editado por / fecha (si el back lo expone).
 *
 * Endpoints backend:
 *   GET /api/sla
 *   PUT /api/sla/{id}
 * ============================================================================
 */
@Component({
  selector: 'app-sla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page">
      <h1>Configuración de SLA</h1>
      <p class="lead">Tiempos máximos de respuesta y resolución por prioridad (en horas).</p>

      @if (cargando()) { <p>Cargando…</p> }
      @else {
        <table class="tabla">
          <thead>
            <tr><th>Prioridad</th><th>Respuesta (h)</th><th>Resolución (h)</th><th>Descripción</th><th></th></tr>
          </thead>
          <tbody>
            @for (s of items(); track s.id) {
              <tr>
                <td><strong>{{ s.prioridad }}</strong></td>
                <td><input type="number" min="1" [(ngModel)]="s.tiempoRespuestaHoras" /></td>
                <td><input type="number" min="1" [(ngModel)]="s.tiempoResolucionHoras" /></td>
                <td><input type="text" [(ngModel)]="s.descripcion" /></td>
                <td><button (click)="guardar(s)">Guardar</button></td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [`
    h1 { color: #1e3a8a; margin: 0 0 4px; }
    .lead { color: #475569; margin: 0 0 18px; }
    .tabla { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
    .tabla th, .tabla td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .tabla th { background: #f1f5f9; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
    input { padding: 7px 9px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 13px; width: 100%; }
    button { padding: 7px 14px; background: #1e40af; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
  `]
})
export class SlaComponent implements OnInit {
  private srv = inject(SlaService);

  items = signal<SlaConfig[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.srv.listar().subscribe(i => { this.items.set(i); this.cargando.set(false); });
  }

  guardar(s: SlaConfig): void {
    this.srv.actualizar(s.id, {
      tiempoRespuestaHoras: s.tiempoRespuestaHoras,
      tiempoResolucionHoras: s.tiempoResolucionHoras,
      descripcion: s.descripcion
    }).subscribe();
  }
}
