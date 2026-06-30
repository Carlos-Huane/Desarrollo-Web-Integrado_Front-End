import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'badgeClass', standalone: true })
export class BadgeClassPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const normalized = value?.trim().toLowerCase();
    return normalized ? `badge badge--${normalized}` : 'badge';
  }
}
