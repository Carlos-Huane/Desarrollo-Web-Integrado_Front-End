import { Estado } from './estado.enum';
import { Prioridad } from './prioridad.enum';
import { Usuario } from './usuario.model';
import { Categoria, Subcategoria } from './categoria.model';

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: Estado;
  createdAt: string;
  updatedAt?: string;
  fechaResolucion?: string;
  alertaSlaEnviada: boolean;
  cliente: Usuario;
  tecnico?: Usuario;
  categoria: Categoria;
  subcategoria?: Subcategoria;
}

export interface TicketRequest {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  categoriaId: number;
  subcategoriaId?: number;
}

export interface CambioEstadoRequest {
  nuevoEstado: Estado;
  comentario?: string;
  tecnicoId?: number;
}

export interface HistorialTicket {
  id: number;
  ticketId: number;
  estadoAnterior?: Estado;
  estadoNuevo: Estado;
  comentario?: string;
  fechaCambio: string;
  usuario: Usuario;
}
