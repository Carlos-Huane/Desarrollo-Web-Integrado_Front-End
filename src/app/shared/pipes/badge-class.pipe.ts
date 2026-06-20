import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'badgeClass', standalone: true })
export class BadgeClassPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? `badge badge--${value.toLowerCase()}` : 'badge';
  }
}
