import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'success' | 'error' | 'info' | 'warning';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private contador = 0;
  readonly mensajes = signal<Notificacion[]>([]);

  success(mensaje: string): void { this.emitir('success', mensaje); }
  error(mensaje: string):   void { this.emitir('error',   mensaje); }
  info(mensaje: string):    void { this.emitir('info',    mensaje); }
  warning(mensaje: string): void { this.emitir('warning', mensaje); }

  descartar(id: number): void {
    this.mensajes.update(arr => arr.filter(m => m.id !== id));
  }

  private emitir(tipo: TipoNotificacion, mensaje: string): void {
    const n: Notificacion = { id: ++this.contador, tipo, mensaje };
    this.mensajes.update(arr => [...arr, n]);
    setTimeout(() => this.descartar(n.id), 4000);
  }
}
