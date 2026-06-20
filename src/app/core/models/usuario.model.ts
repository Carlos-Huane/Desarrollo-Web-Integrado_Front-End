import { Rol } from './rol.enum';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: Rol;
  activo: boolean;
  createdAt?: string;
}

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono?: string;
  rol: Rol;
}
