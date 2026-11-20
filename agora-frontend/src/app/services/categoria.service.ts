import { Injectable, computed, inject } from '@angular/core';

import { Categoria } from '../models/modelos';
import { DatosService } from './datos.service';

export interface CategoriaConConteo extends Categoria {
  cantidadTemas: number;
}

/** Consulta de categorías (la administración está en AdminService). */
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly datos = inject(DatosService);

  readonly todas = this.datos.categorias.items;

  /** Cada categoría con su cantidad de temas visibles. */
  readonly conConteo = computed<CategoriaConConteo[]>(() => {
    const temas = this.datos.temas.items().filter((t) => t.estado === 'ACTIVO');
    return this.datos.categorias
      .items()
      .map((c) => ({ ...c, cantidadTemas: temas.filter((t) => t.categoriaId === c.id).length }));
  });

  porSlug(slug: string): Categoria | undefined {
    return this.datos.categorias.items().find((c) => c.slug === slug);
  }

  porId(id: number): Categoria | undefined {
    return this.datos.categorias.buscar(id);
  }
}
