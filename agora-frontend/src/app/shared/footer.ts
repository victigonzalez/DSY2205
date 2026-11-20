import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoriaService } from '../services/categoria.service';
import { Logo } from './logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Logo],
  template: `
    <footer class="footer-agora">
      <div class="container-xl">
        <div class="row g-4">
          <div class="col-12 col-md-5">
            <app-logo [claro]="true" />
            <p class="mt-3 mb-0">Una plaza para conversar con respeto sobre lo que te gusta.</p>
          </div>
          <div class="col-6 col-md-4">
            <h2 class="footer-titulo">Categorías</h2>
            <ul class="list-unstyled mb-0">
              @for (c of categorias.todas(); track c.id) {
                <li><a [routerLink]="['/categorias', c.slug]">{{ c.nombre }}</a></li>
              }
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <h2 class="footer-titulo">Tu cuenta</h2>
            <ul class="list-unstyled mb-0">
              <li><a routerLink="/registro">Crear cuenta</a></li>
              <li><a routerLink="/login">Iniciar sesión</a></li>
              <li><a routerLink="/recuperar">Recuperar contraseña</a></li>
              <li><a routerLink="/perfil">Mi perfil</a></li>
            </ul>
          </div>
        </div>
        <p class="footer-legal">Ágora es un proyecto de Desarrollo Full Stack III (DSY2205), creado por Victor Gonzalez Arenas en 2026.</p>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly categorias = inject(CategoriaService);
}
