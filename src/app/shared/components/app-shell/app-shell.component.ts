import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
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
  private router = inject(Router);

  readonly titulo = input.required<string>();
  readonly navItems = input.required<NavItem[]>();

  sidebarAbierto = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.sidebarAbierto.set(false));
  }

  toggleSidebar(): void { this.sidebarAbierto.update(v => !v); }
  cerrarSidebar(): void { this.sidebarAbierto.set(false); }
  cerrarSesion():  void { this.auth.logout(); }
}
