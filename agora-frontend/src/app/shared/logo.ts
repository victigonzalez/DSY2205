import { Component, input } from '@angular/core';

/**
 * Logo de Ágora: una burbuja de conversación cuya "cola" forma el trazo
 * inferior de una A. La plaza pública (ágora) donde se conversa.
 */
@Component({
  selector: 'app-logo',
  template: `
    <span class="logo" [class.logo-claro]="claro()">
      <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" focusable="false">
        <path
          d="M6 4h28a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H19l-9 7v-7H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
          class="logo-burbuja" />
        <path d="M13.5 25 20 10l6.5 15M16 19.5h8" class="logo-a" />
      </svg>
      @if (conTexto()) {
        <span class="logo-texto">Ágora</span>
      }
    </span>
  `,
})
export class Logo {
  readonly conTexto = input(true);
  readonly claro = input(false);
}
