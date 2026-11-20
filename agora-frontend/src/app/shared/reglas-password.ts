import { Component, input } from '@angular/core';

import { REGLAS_PASSWORD } from '../validadores/validadores';

/** Lista de chequeo en vivo de las reglas de seguridad de la contraseña. */
@Component({
  selector: 'app-reglas-password',
  template: `
    <ul class="reglas-password" [id]="idLista()" aria-live="polite">
      @for (r of reglas; track r.clave) {
        @let ok = r.cumple(valor() ?? '');
        <li [class.cumple]="ok">
          <i class="bi" [class.bi-check-circle-fill]="ok" [class.bi-circle]="!ok" aria-hidden="true"></i>
          {{ r.texto }}
          <span class="visually-hidden">{{ ok ? '(cumple)' : '(pendiente)' }}</span>
        </li>
      }
    </ul>
  `,
})
export class ReglasPassword {
  readonly valor = input<string | null>('');
  readonly idLista = input('reglas-password');
  readonly reglas = REGLAS_PASSWORD;
}
