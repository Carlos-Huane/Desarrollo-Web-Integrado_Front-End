import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
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
      error: () => { this.error.set('No se pudo cargar usuarios'); this.cargando.set(false); }
    });
  }

  toggleActivo(u: Usuario): void {
    const op$ = u.activo ? this.srv.desactivar(u.id) : this.srv.activar(u.id);
    op$.subscribe(() => this.cargar());
  }
}
