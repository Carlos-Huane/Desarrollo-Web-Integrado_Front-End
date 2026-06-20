import { Pipe, PipeTransform } from '@angular/core';
import { PRIORIDAD_LABEL, Prioridad } from '../../core/models/prioridad.enum';

@Pipe({ name: 'prioridadLabel', standalone: true })
export class PrioridadLabelPipe implements PipeTransform {
  transform(value: Prioridad | null | undefined): string {
    return value ? PRIORIDAD_LABEL[value] : '—';
  }
}
