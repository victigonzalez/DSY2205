import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { MENSAJES_ERROR } from '../validadores/validadores';

/**
 * Muestra el primer error de un campo, solo cuando el usuario ya lo tocó
 * o intentó enviar el formulario. Usa los textos de MENSAJES_ERROR.
 */
@Component({
  selector: 'app-error-campo',
  // Angular 22 usa OnPush por defecto; los errores del formulario no son signals,
  // así que este componente se revisa en cada ciclo (Eager) para mostrarlos a tiempo.
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (mensaje; as m) {
      <div class="invalid-feedback d-block" [id]="idError()">{{ m }}</div>
    }
  `,
})
export class ErrorCampo {
  readonly control = input.required<AbstractControl | null>();
  readonly enviado = input(false);
  readonly idError = input('');

  /** Getter: se evalúa en cada detección de cambios (los errores del formulario no son signals). */
  get mensaje(): string | null {
    const c = this.control();
    if (!c || !c.errors || !(c.touched || c.dirty || this.enviado())) return null;
    const [clave, detalle] = Object.entries(c.errors)[0];
    return MENSAJES_ERROR[clave]?.(detalle) ?? 'El valor no es válido.';
  }
}
