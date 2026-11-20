import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `
    <section class="container-xl seccion">
      <div class="vacio">
        <i class="bi bi-shield-lock" aria-hidden="true"></i>
        <h1 class="h3">Esta sección es solo para {{ auth.rol() === 'MODERADOR' ? 'administradores' : 'el equipo del foro' }}</h1>
        <p>Tu cuenta ({{ auth.rol() ?? 'sin sesión' }}) no tiene permiso para entrar aquí.</p>
        <a class="btn btn-primary" routerLink="/">Ir al inicio</a>
      </div>
    </section>
  `,
})
export class AccesoDenegadoPage {
  protected readonly auth = inject(AuthService);
}

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <section class="container-xl seccion">
      <div class="vacio">
        <i class="bi bi-signpost-split" aria-hidden="true"></i>
        <h1 class="h3">Esta página no existe</h1>
        <p>Revisa la dirección o vuelve a la plaza principal.</p>
        <a class="btn btn-primary" routerLink="/">Ir al inicio</a>
      </div>
    </section>
  `,
})
export class NoEncontradoPage {}
