import { Injectable, signal } from '@angular/core';

export interface ConfirmConfig {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'normal' | 'peligro';
}

interface PendingDialog extends ConfirmConfig {
  resolver: (ok: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly dialog = signal<PendingDialog | null>(null);

  preguntar(config: ConfirmConfig): Promise<boolean> {
    return new Promise<boolean>(resolver => {
      this.dialog.set({
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        tipo: 'normal',
        ...config,
        resolver
      });
    });
  }

  confirmar(): void { this.dialog()?.resolver(true);  this.dialog.set(null); }
  cancelar():  void { this.dialog()?.resolver(false); this.dialog.set(null); }
}
