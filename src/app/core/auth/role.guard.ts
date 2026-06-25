import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from '../models/rol.enum';

export const roleGuard = (rolesPermitidos: Rol[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const rolActual = auth.rol();
    if (rolActual && rolesPermitidos.includes(rolActual)) return true;

    router.navigate([rolActual ? '/no-autorizado' : '/login']);
    return false;
  };
};
