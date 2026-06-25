import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (svc.cargando()) {
      <div class="loading-bar" role="progressbar" aria-label="Cargando"></div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed; top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #1e40af, transparent);
      background-size: 200% 100%;
      z-index: 10000;
      animation: slide 1.2s infinite linear;
    }
    @keyframes slide {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }
  `]
})
export class LoadingBarComponent {
  svc = inject(LoadingService);
}
