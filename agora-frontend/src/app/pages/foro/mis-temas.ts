import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrdenadorTemas } from '../../patrones/orden-temas/ordenador-temas';
import { OrdenRecientes } from '../../patrones/orden-temas/estrategias-orden';
import { TemaService } from '../../services/tema.service';
import { TemaItem } from '../../shared/tema-item';

/** Temas publicados por el usuario conectado, incluidos los baneados (con el motivo). */
@Component({
  selector: 'app-mis-temas',
  imports: [RouterLink, TemaItem],
  template: `
    <section class="cabecera-listado">
      <div class="container-xl">
        <h1>Mis temas</h1>
        <p class="mb-0">{{ temas().length }} {{ temas().length === 1 ? 'tema publicado' : 'temas publicados' }}.</p>
      </div>
    </section>
    <section class="container-xl seccion">
      <div class="lista-temas">
        @for (t of temas(); track t.id) {
          <app-tema-item [tema]="t" />
          @if (t.estado === 'BANEADO') {
            <p class="nota-baneo"><i class="bi bi-info-circle" aria-hidden="true"></i> Motivo del baneo: {{ t.motivoBaneo }}</p>
          }
        } @empty {
          <div class="vacio">
            <i class="bi bi-pencil-square" aria-hidden="true"></i>
            <p>Todavía no publicas ningún tema.</p>
            <a class="btn btn-primary" routerLink="/temas/nuevo">Publicar mi primer tema</a>
          </div>
        }
      </div>
    </section>
  `,
})
export class MisTemasPage {
  private readonly servicio = inject(TemaService);
  /** Strategy usado directamente: los propios temas por actividad reciente. */
  protected readonly temas = computed(() => new OrdenadorTemas(new OrdenRecientes()).ordenar(this.servicio.misTemas()));
}
