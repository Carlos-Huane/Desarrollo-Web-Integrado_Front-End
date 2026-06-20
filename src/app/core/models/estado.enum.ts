export type Estado = 'NUEVO' | 'EN_ATENCION' | 'ESCALADO' | 'RESUELTO' | 'CERRADO';

export const ESTADOS: Estado[] = ['NUEVO', 'EN_ATENCION', 'ESCALADO', 'RESUELTO', 'CERRADO'];

export const ESTADO_LABEL: Record<Estado, string> = {
  NUEVO: 'Nuevo',
  EN_ATENCION: 'En atención',
  ESCALADO: 'Escalado',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado'
};
