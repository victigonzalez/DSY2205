import { Injectable, computed, inject } from '@angular/core';

import { Categoria, Resultado, Rol, Usuario, exito, fallo } from '../models/modelos';
import { AuthService } from './auth.service';
import { DatosService, ahora } from './datos.service';

export interface DatosUsuarioAdmin {
  nombre: string;
  username: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  /** Obligatoria al crear; opcional al editar (vacía = no cambia). */
  password?: string;
}

export type DatosCategoria = Omit<Categoria, 'id'>;

/** Gestión de usuarios y categorías (solo ADMIN). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly datos = inject(DatosService);
  private readonly auth = inject(AuthService);

  readonly usuarios = this.datos.usuarios.items;
  readonly categorias = this.datos.categorias.items;

  /** Cantidad de temas por categoría (todos los estados). */
  readonly temasPorCategoria = computed(() => {
    const mapa = new Map<number, number>();
    for (const t of this.datos.temas.items()) mapa.set(t.categoriaId, (mapa.get(t.categoriaId) ?? 0) + 1);
    return mapa;
  });

  // ------------------------------------------------------------------ Usuarios

  crearUsuario(d: DatosUsuarioAdmin): Resultado<Usuario> {
    if (!this.auth.esAdmin()) return fallo('Solo un administrador puede crear usuarios.');
    if (!d.password) return fallo('La contraseña es obligatoria al crear un usuario.');
    if (this.auth.usernameEnUso(d.username)) return fallo(`El usuario "${d.username}" ya está en uso.`);
    if (this.auth.correoEnUso(d.correo)) return fallo(`El correo ${d.correo} ya tiene una cuenta.`);
    return exito(
      this.datos.usuarios.agregar({
        nombre: d.nombre.trim(),
        username: d.username.trim().toLowerCase(),
        correo: d.correo.trim().toLowerCase(),
        password: d.password,
        rol: d.rol,
        activo: d.activo,
        fechaRegistro: ahora(),
      }),
    );
  }

  actualizarUsuario(id: number, d: DatosUsuarioAdmin): Resultado<Usuario> {
    if (!this.auth.esAdmin()) return fallo('Solo un administrador puede modificar usuarios.');
    if (this.auth.usernameEnUso(d.username, id)) return fallo(`El usuario "${d.username}" ya está en uso.`);
    if (this.auth.correoEnUso(d.correo, id)) return fallo(`El correo ${d.correo} ya tiene una cuenta.`);
    const propio = this.auth.usuarioActual()?.id === id;
    if (propio && (d.rol !== 'ADMIN' || !d.activo)) {
      return fallo('No puedes quitarte el rol de administrador ni desactivar tu propia cuenta.');
    }
    const cambios: Partial<Usuario> = {
      nombre: d.nombre.trim(),
      username: d.username.trim().toLowerCase(),
      correo: d.correo.trim().toLowerCase(),
      rol: d.rol,
      activo: d.activo,
    };
    if (d.password) cambios.password = d.password;
    const u = this.datos.usuarios.actualizar(id, cambios);
    return u ? exito(u) : fallo('El usuario no existe.');
  }

  /** Elimina al usuario con sus temas y comentarios (igual que ON DELETE CASCADE en Oracle). */
  eliminarUsuario(id: number): Resultado {
    if (!this.auth.esAdmin()) return fallo('Solo un administrador puede eliminar usuarios.');
    if (this.auth.usuarioActual()?.id === id) return fallo('No puedes eliminar tu propia cuenta.');
    const temasDelUsuario = this.datos.temas.items().filter((t) => t.autorId === id).map((t) => t.id);
    this.datos.comentarios.eliminarDonde((c) => c.autorId === id || temasDelUsuario.includes(c.temaId));
    this.datos.temas.eliminarDonde((t) => t.autorId === id);
    return this.datos.usuarios.eliminarDonde((u) => u.id === id) ? exito(undefined) : fallo('El usuario no existe.');
  }

  // ------------------------------------------------------------------ Categorías

  crearCategoria(d: DatosCategoria): Resultado<Categoria> {
    if (!this.auth.esAdmin()) return fallo('Solo un administrador puede crear categorías.');
    if (this.nombreCategoriaEnUso(d.nombre)) return fallo(`Ya existe la categoría "${d.nombre}".`);
    return exito(this.datos.categorias.agregar({ ...d, nombre: d.nombre.trim(), slug: crearSlug(d.nombre) }));
  }

  actualizarCategoria(id: number, d: DatosCategoria): Resultado<Categoria> {
    if (!this.auth.esAdmin()) return fallo('Solo un administrador puede modificar categorías.');
    if (this.nombreCategoriaEnUso(d.nombre, id)) return fallo(`Ya existe la categoría "${d.nombre}".`);
    const c = this.datos.categorias.actualizar(id, { ...d, nombre: d.nombre.trim(), slug: crearSlug(d.nombre) });
    return c ? exito(c) : fallo('La categoría no existe.');
  }

  eliminarCategoria(id: number): Resultado {
    if (!this.auth.esAdmin()) return fallo('Solo un administrador puede eliminar categorías.');
    const cantidad = this.temasPorCategoria().get(id) ?? 0;
    if (cantidad > 0) {
      return fallo(`No se puede eliminar: tiene ${cantidad} tema(s). Muévelos o elimínalos primero.`);
    }
    return this.datos.categorias.eliminarDonde((c) => c.id === id) ? exito(undefined) : fallo('La categoría no existe.');
  }

  nombreCategoriaEnUso(nombre: string, excluirId?: number): boolean {
    const clave = nombre.trim().toLowerCase();
    return this.datos.categorias.items().some((c) => c.nombre.toLowerCase() === clave && c.id !== excluirId);
  }

  restablecerDatos(): void {
    this.datos.restablecerTodo();
  }
}

/** "Cine y Series" → "cine-y-series" (sin tildes ni símbolos). */
export function crearSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
