import { Component, DestroyRef, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Footer } from './shared/footer';
import { Navbar } from './shared/navbar';
import { Notificaciones } from './shared/notificaciones';

/** Estructura de todas las páginas: barra de navegación, contenido, pie y notificaciones. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Notificaciones],
  template: `
    <a class="saltar-contenido" href="#principal">Saltar al contenido</a>
    <app-navbar />
    <main id="principal" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
    <app-notificaciones />
  `,
})
export class App {
  constructor() {
    // En móvil, al navegar se cierra el menú desplegado y la vista vuelve arriba.
    const sub = inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const menu = document.getElementById('menu-principal');
        const bs = (window as unknown as { bootstrap?: any }).bootstrap;
        if (menu?.classList.contains('show') && bs) bs.Collapse.getOrCreateInstance(menu).hide();
        window.scrollTo({ top: 0 });
      });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
}
