import { Rol } from './rol.enum';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  token: string;
  email: string;
  rol: Rol;
  nombreCompleto: string;
}

export interface SesionUsuario {
  id: number;
  email: string;
  rol: Rol;
  nombreCompleto: string;
}
