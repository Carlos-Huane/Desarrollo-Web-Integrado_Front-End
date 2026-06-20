import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Usuario } from '../../../core/models/usuario.model';
import { Rol, ROLES } from '../../../core/models/rol.enum';

@Component({
  selector: 'app-usuarios-listar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios-listar.component.html',
  styleUrl: './usuarios-listar.component.scss'
})
export class UsuariosListarComponent implements OnInit {
  private srv = inject(UsuarioService);
  private notif = inject(NotificacionService);
  private confirm = inject(ConfirmService);

  roles = ROLES;

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  busqueda = signal('');
  filtroRol = signal<'' | Rol>('');
  filtroEstado = signal<'' | 'activos' | 'inactivos'>('');

  pagina = signal(1);
  readonly TAM_PAGINA = 10;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();
    const est = this.filtroEstado();
    return this.usuarios()
      .filter(u => !q
        || `${u.nombre} ${u.apellido}`.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q))
      .filter(u => !rol || u.rol === rol)
      .filter(u => !est || (est === 'activos' ? u.activo : !u.activo));
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.TAM_PAGINA)));

  pagina$ = computed(() => {
    const inicio = (this.pagina() - 1) * this.TAM_PAGINA;
    return this.filtrados().slice(inicio, inicio + this.TAM_PAGINA);
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.srv.listar().subscribe({
      next: u => { this.usuarios.set(u); this.cargando.set(false); },
      error: () => {
        this.error.set('No se pudo cargar usuarios');
        this.cargando.set(false);
        this.notif.error('No se pudo cargar la lista de usuarios');
      }
    });
  }

  onBuscar(valor: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.busqueda.set(valor);
      this.pagina.set(1);
    }, 300);
  }

  onFiltroRol(valor: string): void {
    this.filtroRol.set(valor as '' | Rol);
    this.pagina.set(1);
  }

  onFiltroEstado(valor: string): void {
    this.filtroEstado.set(valor as '' | 'activos' | 'inactivos');
    this.pagina.set(1);
  }

  irAPagina(n: number): void {
    if (n < 1 || n > this.totalPaginas()) return;
    this.pagina.set(n);
  }

  async toggleActivo(u: Usuario): Promise<void> {
    if (u.activo) {
      const ok = await this.confirm.preguntar({
        titulo: 'Desactivar usuario',
        mensaje: `${u.nombre} ${u.apellido} no podrá iniciar sesión hasta que lo reactives.`,
        textoConfirmar: 'Desactivar',
        tipo: 'peligro'
      });
      if (!ok) return;
    }

    const op$ = u.activo ? this.srv.desactivar(u.id) : this.srv.activar(u.id);
    op$.subscribe({
      next: () => {
        this.notif.success(`Usuario ${u.activo ? 'desactivado' : 'activado'}`);
        this.cargar();
      },
      error: () => this.notif.error('No se pudo cambiar el estado del usuario')
    });
  }
}
