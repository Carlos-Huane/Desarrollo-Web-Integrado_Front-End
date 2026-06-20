import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ---------- ADMIN ----------
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/listar/usuarios-listar.component').then(m => m.UsuariosListarComponent)
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () =>
          import('./features/usuarios/formulario/usuario-formulario.component').then(m => m.UsuarioFormularioComponent)
      },
      {
        path: 'usuarios/:id/editar',
        loadComponent: () =>
          import('./features/usuarios/formulario/usuario-formulario.component').then(m => m.UsuarioFormularioComponent)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/listar/categorias-listar.component').then(m => m.CategoriasListarComponent)
      },
      {
        path: 'categorias/:id/subcategorias',
        loadComponent: () =>
          import('./features/categorias/subcategorias/subcategorias.component').then(m => m.SubcategoriasComponent)
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./features/tickets/listar/tickets-listar.component').then(m => m.TicketsListarComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/detalle/ticket-detalle.component').then(m => m.TicketDetalleComponent)
      },
      {
        path: 'sla',
        loadComponent: () =>
          import('./features/sla/sla.component').then(m => m.SlaComponent)
      }
    ]
  },

  // ---------- TECNICO ----------
  {
    path: 'tecnico',
    canActivate: [authGuard, roleGuard(['TECNICO'])],
    loadComponent: () =>
      import('./layouts/tecnico-layout/tecnico-layout.component').then(m => m.TecnicoLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'bandeja' },
      {
        path: 'bandeja',
        loadComponent: () =>
          import('./features/tickets/bandeja-tecnico/bandeja-tecnico.component').then(m => m.BandejaTecnicoComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/detalle/ticket-detalle.component').then(m => m.TicketDetalleComponent)
      }
    ]
  },

  // ---------- CLIENTE ----------
  {
    path: 'cliente',
    canActivate: [authGuard, roleGuard(['CLIENTE'])],
    loadComponent: () =>
      import('./layouts/cliente-layout/cliente-layout.component').then(m => m.ClienteLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'mis-tickets' },
      {
        path: 'mis-tickets',
        loadComponent: () =>
          import('./features/tickets/mis-tickets/mis-tickets.component').then(m => m.MisTicketsComponent)
      },
      {
        path: 'tickets/nuevo',
        loadComponent: () =>
          import('./features/tickets/crear/ticket-crear.component').then(m => m.TicketCrearComponent)
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./features/tickets/detalle/ticket-detalle.component').then(m => m.TicketDetalleComponent)
      }
    ]
  },

  {
    path: 'no-autorizado',
    loadComponent: () =>
      import('./features/errores/no-autorizado.component').then(m => m.NoAutorizadoComponent)
  },

  {
    path: '**',
    loadComponent: () =>
      import('./features/errores/not-found.component').then(m => m.NotFoundComponent)
  }
];
