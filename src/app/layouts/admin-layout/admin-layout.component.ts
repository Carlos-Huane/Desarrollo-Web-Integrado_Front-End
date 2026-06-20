import { Component } from '@angular/core';
import { AppShellComponent, NavItem } from '../../shared/components/app-shell/app-shell.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [AppShellComponent],
  template: `<app-shell [titulo]="'Admin · TelecoPerú'" [navItems]="items" />`
})
export class AdminLayoutComponent {
  items: NavItem[] = [
    { label: 'Dashboard',  ruta: '/admin/dashboard',  icono: '⌂' },
    { label: 'Usuarios',   ruta: '/admin/usuarios',   icono: '👤' },
    { label: 'Categorías', ruta: '/admin/categorias', icono: '🗂' },
    { label: 'Tickets',    ruta: '/admin/tickets',    icono: '🎫' },
    { label: 'SLA',        ruta: '/admin/sla',        icono: '⏱' }
  ];
}
