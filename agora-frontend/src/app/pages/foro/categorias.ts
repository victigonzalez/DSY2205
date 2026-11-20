import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoriaService } from '../../services/categoria.service';

/** Todas las categorías del foro con su cantidad de temas. */
@Component({
  selector: 'app-categorias',
  imports: [RouterLink],
  template: `
    <section class="cabecera-listado">
      <div class="container-xl">
        <h1>Categorías</h1>
        <p class="mb-0">{{ categorias.todas().length }} temáticas para conversar. Elige una para ver sus temas.</p>
      </div>
    </section>
    <section class="container-xl seccion">
      <div class="row g-3">
        @for (c of categorias.conConteo(); track c.id) {
          <div class="col-12 col-md-6 col-xl-4">
            <a class="tesela-categoria tesela-grande" [routerLink]="['/categorias', c.slug]" [style.--cat]="c.color">
              <i class="bi {{ c.icono }}" aria-hidden="true"></i>
              <span class="tesela-nombre">{{ c.nombre }}</span>
              <span class="tesela-descripcion">{{ c.descripcion }}</span>
              <span class="tesela-conteo">{{ c.cantidadTemas }} {{ c.cantidadTemas === 1 ? 'tema' : 'temas' }}</span>
            </a>
          </div>
        }
      </div>
    </section>
  `,
})
export class CategoriasPage {
  protected readonly categorias = inject(CategoriaService);
}
