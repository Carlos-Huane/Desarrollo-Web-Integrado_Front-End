import { Component } from '@angular/core';
import { AppShellComponent, NavItem } from '../../shared/components/app-shell/app-shell.component';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [AppShellComponent],
  template: `<app-shell [titulo]="'Mis tickets · TelecoPerú'" [navItems]="items" />`
})
export class ClienteLayoutComponent {
  items: NavItem[] = [
    { label: 'Mis tickets',  ruta: '/cliente/mis-tickets',   icono: '🎫' },
    { label: 'Nuevo ticket', ruta: '/cliente/tickets/nuevo', icono: '➕' }
  ];
}
