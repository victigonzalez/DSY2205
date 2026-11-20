import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TemaVista } from '../models/modelos';
import { Avatar } from './avatar';
import { FechaRelativaPipe } from './fecha-relativa.pipe';

/** Una fila de la lista de temas. La barra lateral de color identifica la categoría. */
@Component({
  selector: 'app-tema-item',
  imports: [RouterLink, Avatar, FechaRelativaPipe],
  template: `
    @let t = tema();
    <article class="tema-item" [style.--cat]="t.categoria?.color">
      <app-avatar class="d-none d-sm-block" [nombre]="t.autor?.nombre" [username]="t.autor?.username" [tam]="40" />
      <div class="tema-item-cuerpo">
        <h3 class="tema-item-titulo">
          <a [routerLink]="['/temas', t.id]">{{ t.titulo }}</a>
        </h3>
        @if (mostrarExtracto()) {
          <p class="tema-item-extracto">{{ t.contenido }}</p>
        }
        <div class="tema-item-meta">
          @if (mostrarCategoria() && t.categoria) {
            <a class="chip-categoria" [routerLink]="['/categorias', t.categoria.slug]">
              <i class="bi {{ t.categoria.icono }}" aria-hidden="true"></i>{{ t.categoria.nombre }}
            </a>
          }
          <span>{{ t.autor?.username ?? 'usuario eliminado' }}</span>
          <span>{{ t.fechaCreacion | fechaRelativa }}</span>
          @if (t.estado === 'BANEADO') {
            <span class="badge text-bg-danger">Baneado</span>
          }
        </div>
      </div>
      <a class="tema-item-respuestas" [routerLink]="['/temas', t.id]"
         [attr.aria-label]="t.cantidadComentarios + ' comentarios'">
        <span class="burbuja-contador">{{ t.cantidadComentarios }}</span>
        <span class="d-none d-md-block">{{ t.cantidadComentarios === 1 ? 'respuesta' : 'respuestas' }}</span>
      </a>
    </article>
  `,
})
export class TemaItem {
  readonly tema = input.required<TemaVista>();
  readonly mostrarCategoria = input(true);
  readonly mostrarExtracto = input(true);
}
