import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios-listar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios-listar.component.html',
  styleUrl: './usuarios-listar.component.scss'
})
export class UsuariosListarComponent implements OnInit {
  private srv = inject(UsuarioService);
  private notif = inject(NotificacionService);
  private confirm = inject(ConfirmService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

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
