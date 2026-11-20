import { Injectable, computed, inject } from '@angular/core';

import { Resultado, exito, fallo } from '../models/modelos';
import { AuthService } from './auth.service';
import { DatosService } from './datos.service';

/** Banear y desbanear temas y comentarios (solo ADMIN o MODERADOR). */
@Injectable({ providedIn: 'root' })
export class ModeracionService {
  private readonly datos = inject(DatosService);
  private readonly auth = inject(AuthService);

  readonly resumen = computed(() => {
    const temas = this.datos.temas.items();
    const comentarios = this.datos.comentarios.items();
    return {
      temasActivos: temas.filter((t) => t.estado === 'ACTIVO').length,
      temasBaneados: temas.filter((t) => t.estado === 'BANEADO').length,
      comentariosActivos: comentarios.filter((c) => c.estado === 'ACTIVO').length,
      comentariosBaneados: comentarios.filter((c) => c.estado === 'BANEADO').length,
    };
  });

  /** Comentarios del foro con su tema y autor resueltos (para el panel de moderación). */
  readonly comentarios = computed(() => {
    const usuarios = this.datos.usuarios.items();
    const temas = this.datos.temas.items();
    return [...this.datos.comentarios.items()]
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
      .map((c) => ({
        ...c,
        autor: usuarios.find((u) => u.id === c.autorId),
        tema: temas.find((t) => t.id === c.temaId),
      }));
  });

  banearTema(id: number, motivo: string): Resultado {
    const error = this.validar(motivo);
    if (error) return fallo(error);
    const t = this.datos.temas.buscar(id);
    if (!t) return fallo('El tema no existe.');
    if (t.estado === 'BANEADO') return fallo('Ese tema ya está baneado.');
    this.datos.temas.actualizar(id, { estado: 'BANEADO', motivoBaneo: motivo.trim() });
    return exito(undefined);
  }

  desbanearTema(id: number): Resultado {
    if (!this.auth.puedeModerar()) return fallo('Solo un administrador o moderador puede hacerlo.');
    const t = this.datos.temas.buscar(id);
    if (!t) return fallo('El tema no existe.');
    if (t.estado === 'ACTIVO') return fallo('Ese tema no está baneado.');
    this.datos.temas.actualizar(id, { estado: 'ACTIVO', motivoBaneo: undefined });
    return exito(undefined);
  }

  banearComentario(id: number, motivo: string): Resultado {
    const error = this.validar(motivo);
    if (error) return fallo(error);
    const c = this.datos.comentarios.buscar(id);
    if (!c) return fallo('El comentario no existe.');
    if (c.estado === 'BANEADO') return fallo('Ese comentario ya está baneado.');
    this.datos.comentarios.actualizar(id, { estado: 'BANEADO', motivoBaneo: motivo.trim() });
    return exito(undefined);
  }

  desbanearComentario(id: number): Resultado {
    if (!this.auth.puedeModerar()) return fallo('Solo un administrador o moderador puede hacerlo.');
    const c = this.datos.comentarios.buscar(id);
    if (!c) return fallo('El comentario no existe.');
    if (c.estado === 'ACTIVO') return fallo('Ese comentario no está baneado.');
    this.datos.comentarios.actualizar(id, { estado: 'ACTIVO', motivoBaneo: undefined });
    return exito(undefined);
  }

  private validar(motivo: string): string | null {
    if (!this.auth.puedeModerar()) return 'Solo un administrador o moderador puede banear contenido.';
    const largo = motivo?.trim().length ?? 0;
    if (largo < 5 || largo > 250) return 'El motivo debe tener entre 5 y 250 caracteres.';
    return null;
  }
}
