/**
 * Modelos del dominio de Ágora (mismos conceptos que las tablas de Oracle).
 * En esta entrega el frontend trabaja con arreglos en memoria, sin llamar al backend.
 */

/** Tipos de usuario y sus privilegios. */
export type Rol = 'ADMIN' | 'MODERADOR' | 'USUARIO';

export const ROLES: { valor: Rol; nombre: string; descripcion: string }[] = [
  { valor: 'USUARIO', nombre: 'Usuario', descripcion: 'Publica temas y comenta' },
  { valor: 'MODERADOR', nombre: 'Moderador', descripcion: 'Además banea contenido que incumple las normas' },
  { valor: 'ADMIN', nombre: 'Administrador', descripcion: 'Además gestiona usuarios y categorías' },
];

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  correo: string;
  /** Simulación de frontend: en el backend real se guarda cifrada con BCrypt. */
  password: string;
  rol: Rol;
  activo: boolean;
  fechaRegistro: string;
  bio?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  /** Clase de Bootstrap Icons, ej: 'bi-controller'. */
  icono: string;
  /** Color identificador de la categoría en todo el sitio. */
  color: string;
}

/** Estado de moderación de temas y comentarios. */
export type Estado = 'ACTIVO' | 'BANEADO';

export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  fechaEdicion?: string;
  estado: Estado;
  motivoBaneo?: string;
  categoriaId: number;
  autorId: number;
}

export interface Comentario {
  id: number;
  contenido: string;
  fechaCreacion: string;
  fechaEdicion?: string;
  estado: Estado;
  motivoBaneo?: string;
  temaId: number;
  autorId: number;
}

/** Tema con sus datos relacionados ya resueltos, listo para mostrar en pantalla. */
export interface TemaVista extends Tema {
  autor: Usuario | undefined;
  categoria: Categoria | undefined;
  cantidadComentarios: number;
  ultimaActividad: string;
}

/** Resultado de una operación que puede fallar con un mensaje para el usuario. */
export type Resultado<T = void> = { ok: true; valor: T } | { ok: false; mensaje: string };

export const exito = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
export const fallo = (mensaje: string): Resultado<never> => ({ ok: false, mensaje });
