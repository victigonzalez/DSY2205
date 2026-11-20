import { Component, computed, input } from '@angular/core';

const TONOS = ['#2B50D6', '#7A3FD1', '#C2410C', '#BE185D', '#4F7A28', '#0E7490'];

/** Iniciales del usuario en un círculo; el color depende del username (siempre el mismo). */
@Component({
  selector: 'app-avatar',
  template: `<span class="avatar" [style.background]="color()" [style.--tam.px]="tam()" aria-hidden="true">{{ iniciales() }}</span>`,
})
export class Avatar {
  readonly nombre = input<string | undefined>('');
  readonly username = input<string | undefined>('');
  readonly tam = input(36);

  readonly iniciales = computed(() =>
    (this.nombre() || '?')
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join(''),
  );

  readonly color = computed(() => {
    const u = this.username() || '';
    const suma = [...u].reduce((s, c) => s + c.charCodeAt(0), 0);
    return TONOS[suma % TONOS.length];
  });
}
