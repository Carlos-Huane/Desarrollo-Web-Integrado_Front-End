import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

export interface NavItem {
  label: string;
  ruta: string;
  icono: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  protected auth = inject(AuthService);
  readonly titulo = input.required<string>();
  readonly navItems = input.required<NavItem[]>();

  cerrarSesion(): void {
    this.auth.logout();
  }
}
