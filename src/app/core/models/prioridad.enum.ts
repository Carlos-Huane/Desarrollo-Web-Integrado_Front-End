export type Prioridad = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA' | 'SIN_ASIGNAR';

export const PRIORIDADES: Prioridad[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA', 'SIN_ASIGNAR'];

export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  CRITICA: 'Crítica',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
  SIN_ASIGNAR: 'Sin asignar'
};
