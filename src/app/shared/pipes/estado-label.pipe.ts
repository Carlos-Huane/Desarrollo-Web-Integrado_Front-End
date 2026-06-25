import { Pipe, PipeTransform } from '@angular/core';
import { ESTADO_LABEL, Estado } from '../../core/models/estado.enum';

@Pipe({ name: 'estadoLabel', standalone: true })
export class EstadoLabelPipe implements PipeTransform {
  transform(value: Estado | null | undefined): string {
    return value ? ESTADO_LABEL[value] : '—';
  }
}
