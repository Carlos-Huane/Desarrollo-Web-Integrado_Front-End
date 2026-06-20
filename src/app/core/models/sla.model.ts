import { Prioridad } from './prioridad.enum';

export interface SlaConfig {
  id: number;
  prioridad: Prioridad;
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
  descripcion?: string;
}

export interface SlaUpdateRequest {
  tiempoRespuestaHoras: number;
  tiempoResolucionHoras: number;
  descripcion?: string;
}
