import { Injectable } from '@angular/core';

import {
  CATEGORIAS_INICIALES,
  COMENTARIOS_INICIALES,
  TEMAS_INICIALES,
  USUARIOS_INICIALES,
} from '../data/datos-iniciales';
import { Categoria, Comentario, Tema, Usuario } from '../models/modelos';
import { Coleccion } from './coleccion';

/**
 * Único lugar donde viven los arreglos de la aplicación (servicio singleton,
 * providedIn: 'root'). Los demás servicios aplican la lógica de negocio sobre ellos.
 */
@Injectable({ providedIn: 'root' })
export class DatosService {
  readonly usuarios = new Coleccion<Usuario>('agora.usuarios', USUARIOS_INICIALES);
  readonly categorias = new Coleccion<Categoria>('agora.categorias', CATEGORIAS_INICIALES);
  readonly temas = new Coleccion<Tema>('agora.temas', TEMAS_INICIALES);
  readonly comentarios = new Coleccion<Comentario>('agora.comentarios', COMENTARIOS_INICIALES);

  /** Vuelve todos los arreglos a los datos de ejemplo. */
  restablecerTodo(): void {
    this.usuarios.restablecer();
    this.categorias.restablecer();
    this.temas.restablecer();
    this.comentarios.restablecer();
  }
}

/** Fecha y hora local en formato ISO sin zona (igual al de los datos de ejemplo). */
export function ahora(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
}
