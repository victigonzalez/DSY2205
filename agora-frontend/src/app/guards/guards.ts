import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Rol } from '../models/modelos';
import { AuthService } from '../services/auth.service';

/** Solo usuarios con sesión iniciada. Si no, va al login y luego vuelve a la página pedida. */
export const autenticadoGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  return auth.autenticado()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** Solo visitantes sin sesión (login, registro, recuperar contraseña). */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? inject(Router).createUrlTree(['/']) : true;
};

/**
 * Solo los roles indicados en `data.roles` de la ruta.
 * Ej: { path: 'moderacion', canActivate: [rolGuard], data: { roles: ['ADMIN', 'MODERADOR'] } }
 */
export const rolGuard: CanActivateFn = (ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.autenticado()) {
    return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
  }
  const roles = (ruta.data['roles'] ?? []) as Rol[];
  return auth.tieneRol(...roles) ? true : router.createUrlTree(['/acceso-denegado']);
};
