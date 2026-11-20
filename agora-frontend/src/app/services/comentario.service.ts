import { Injectable, inject } from '@angular/core';

import { Comentario, Resultado, Usuario, exito, fallo } from '../models/modelos';
import { AuthService } from './auth.service';
import { DatosService, ahora } from './datos.service';

export interface ComentarioVista extends Comentario {
  autor: Usuario | undefined;
}

/** Comentar temas, y editar o eliminar comentarios. */
@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private readonly datos = inject(DatosService);
  private readonly auth = inject(AuthService);

  /** Comentarios visibles de un tema, en orden de conversación (más antiguo primero). */
  deTema(temaId: number): ComentarioVista[] {
    const usuarios = this.datos.usuarios.items();
    return this.datos.comentarios
      .items()
      .filter((c) => c.temaId === temaId && c.estado === 'ACTIVO')
      .sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion))
      .map((c) => ({ ...c, autor: usuarios.find((u) => u.id === c.autorId) }));
  }

  comentar(temaId: number, contenido: string): Resultado<Comentario> {
    const u = this.auth.usuarioActual();
    if (!u) return fallo('Inicia sesión para comentar.');
    const tema = this.datos.temas.buscar(temaId);
    if (!tema) return fallo('El tema ya no existe.');
    if (tema.estado === 'BANEADO') return fallo('No se puede comentar un tema baneado.');

    return exito(
      this.datos.comentarios.agregar({
        contenido: contenido.trim(),
        temaId,
        autorId: u.id,
        estado: 'ACTIVO',
        fechaCreacion: ahora(),
      }),
    );
  }

  puedeEditar(c: Comentario): boolean {
    return this.auth.usuarioActual()?.id === c.autorId;
  }

  puedeEliminar(c: Comentario): boolean {
    return this.puedeEditar(c) || this.auth.puedeModerar();
  }

  editar(id: number, contenido: string): Resultado<Comentario> {
    const c = this.datos.comentarios.buscar(id);
    if (!c) return fallo('El comentario no existe.');
    if (!this.puedeEditar(c)) return fallo('Solo el autor puede editar su comentario.');
    return exito(this.datos.comentarios.actualizar(id, { contenido: contenido.trim(), fechaEdicion: ahora() })!);
  }

  eliminar(id: number): Resultado {
    const c = this.datos.comentarios.buscar(id);
    if (!c) return fallo('El comentario no existe.');
    if (!this.puedeEliminar(c)) return fallo('Solo el autor o un moderador puede eliminar este comentario.');
    this.datos.comentarios.eliminarDonde((x) => x.id === id);
    return exito(undefined);
  }
}
