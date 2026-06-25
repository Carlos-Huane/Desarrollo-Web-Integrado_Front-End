import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private contador = signal(0);
  readonly cargando = computed(() => this.contador() > 0);

  inicio(): void { this.contador.update(n => n + 1); }
  fin():    void { this.contador.update(n => Math.max(0, n - 1)); }
}
