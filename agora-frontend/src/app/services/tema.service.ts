import { Injectable, computed, inject } from '@angular/core';

import { Resultado, Tema, TemaVista, exito, fallo } from '../models/modelos';
import { OrdenadorTemas } from '../patrones/orden-temas/ordenador-temas';
import { AuthService } from './auth.service';
import { DatosService, ahora } from './datos.service';

export interface FiltrosTemas {
  categoriaId?: number | null;
  texto?: string | null;
  autorId?: number | null;
  /** Id de la estrategia de orden (patrón Strategy). */
  orden?: string | null;
}

export interface DatosTema {
  titulo: string;
  contenido: string;
  categoriaId: number;
}

/** Búsqueda, visualización, publicación, edición y eliminación de temas. */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly datos = inject(DatosService);
  private readonly auth = inject(AuthService);

  /** Todos los temas con autor, categoría y conteo de comentarios visibles resueltos. */
  readonly vistas = computed<TemaVista[]>(() => {
    const usuarios = this.datos.usuarios.items();
    const categorias = this.datos.categorias.items();
    const comentarios = this.datos.comentarios.items().filter((c) => c.estado === 'ACTIVO');
    return this.datos.temas.items().map((t) => {
      const propios = comentarios.filter((c) => c.temaId === t.id);
      const ultimaActividad = propios.reduce(
        (max, c) => (c.fechaCreacion > max ? c.fechaCreacion : max),
        t.fechaEdicion ?? t.fechaCreacion,
      );
      return {
        ...t,
        autor: usuarios.find((u) => u.id === t.autorId),
        categoria: categorias.find((c) => c.id === t.categoriaId),
        cantidadComentarios: propios.length,
        ultimaActividad,
      };
    });
  });

  /** Solo los temas que el público puede ver (no baneados). */
  readonly visibles = computed(() => this.vistas().filter((t) => t.estado === 'ACTIVO'));

  /**
   * Búsqueda con filtros combinables. El orden lo decide la estrategia elegida
   * (OrdenadorTemas = contexto del patrón Strategy).
   */
  buscar(filtros: FiltrosTemas): TemaVista[] {
    const texto = filtros.texto?.trim().toLowerCase() ?? '';
    const resultado = this.visibles().filter(
      (t) =>
        (!filtros.categoriaId || t.categoriaId === filtros.categoriaId) &&
        (!filtros.autorId || t.autorId === filtros.autorId) &&
        (!texto || t.titulo.toLowerCase().includes(texto) || t.contenido.toLowerCase().includes(texto)),
    );
    return new OrdenadorTemas().usarPorId(filtros.orden).ordenar(resultado);
  }

  porId(id: number): TemaVista | undefined {
    return this.vistas().find((t) => t.id === id);
  }

  /** Los temas del usuario conectado, incluidos los baneados (para que sepa por qué). */
  readonly misTemas = computed(() => {
    const u = this.auth.usuarioActual();
    return u ? this.vistas().filter((t) => t.autorId === u.id) : [];
  });

  // ------------------------------------------------------------------ Escritura

  publicar(datos: DatosTema): Resultado<Tema> {
    const u = this.auth.usuarioActual();
    if (!u) return fallo('Inicia sesión para publicar un tema.');
    if (!this.datos.categorias.buscar(datos.categoriaId)) return fallo('La categoría elegida ya no existe.');

    const tema = this.datos.temas.agregar({
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      categoriaId: datos.categoriaId,
      autorId: u.id,
      estado: 'ACTIVO',
      fechaCreacion: ahora(),
    });
    return exito(tema);
  }

  /** Solo el autor edita su tema, y no si fue baneado. */
  editar(id: number, datos: DatosTema): Resultado<Tema> {
    const u = this.auth.usuarioActual();
    const t = this.datos.temas.buscar(id);
    if (!t) return fallo('El tema no existe.');
    if (!u || t.autorId !== u.id) return fallo('Solo el autor puede editar este tema.');
    if (t.estado === 'BANEADO') return fallo('Un tema baneado no se puede editar.');

    const actualizado = this.datos.temas.actualizar(id, {
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      categoriaId: datos.categoriaId,
      fechaEdicion: ahora(),
    })!;
    return exito(actualizado);
  }

  puedeEditar(t: Tema): boolean {
    return this.auth.usuarioActual()?.id === t.autorId && t.estado === 'ACTIVO';
  }

  puedeEliminar(t: Tema): boolean {
    return this.auth.usuarioActual()?.id === t.autorId || this.auth.puedeModerar();
  }

  /** El autor o un moderador eliminan el tema junto con sus comentarios. */
  eliminar(id: number): Resultado {
    const t = this.datos.temas.buscar(id);
    if (!t) return fallo('El tema no existe.');
    if (!this.puedeEliminar(t)) return fallo('Solo el autor o un moderador puede eliminar este tema.');
    this.datos.comentarios.eliminarDonde((c) => c.temaId === id);
    this.datos.temas.eliminarDonde((x) => x.id === id);
    return exito(undefined);
  }
}
