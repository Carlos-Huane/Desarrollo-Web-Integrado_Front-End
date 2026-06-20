import { Component } from '@angular/core';
import { AppShellComponent, NavItem } from '../../shared/components/app-shell/app-shell.component';

@Component({
  selector: 'app-tecnico-layout',
  standalone: true,
  imports: [AppShellComponent],
  template: `<app-shell [titulo]="'Técnico · TelecoPerú'" [navItems]="items" />`
})
export class TecnicoLayoutComponent {
  items: NavItem[] = [
    { label: 'Mi bandeja', ruta: '/tecnico/bandeja', icono: '📥' }
  ];
}
