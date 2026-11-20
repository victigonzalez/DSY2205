import { Injectable, computed, inject, signal } from '@angular/core';

import { Resultado, Rol, Usuario, exito, fallo } from '../models/modelos';
import { DatosService, ahora } from './datos.service';

const CLAVE_SESION = 'agora.sesion';
/** Minutos de validez del código de recuperación. */
const VIGENCIA_CODIGO_MIN = 10;

export interface DatosRegistro {
  nombre: string;
  username: string;
  correo: string;
  password: string;
}

export interface DatosPerfil {
  nombre: string;
  username: string;
  correo: string;
  bio: string;
}

/**
 * Sesión del usuario: inicio y cierre de sesión, registro, recuperación de
 * contraseña y modificación del perfil.
 *
 * `usuarioActual` es un signal (patrón Observer): la barra de navegación,
 * los guards y las páginas reaccionan solos cuando alguien inicia o cierra sesión.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly datos = inject(DatosService);

  private readonly idSesion = signal<number | null>(this.leerSesion());
  /** Códigos de recuperación pendientes: correo → { código, vence }. */
  private readonly codigos = new Map<string, { codigo: string; vence: number }>();

  /** Usuario conectado (o null). Se recalcula si cambian sus datos en el arreglo. */
  readonly usuarioActual = computed<Usuario | null>(() => {
    const id = this.idSesion();
    const u = id === null ? undefined : this.datos.usuarios.items().find((x) => x.id === id);
    return u && u.activo ? u : null;
  });

  readonly autenticado = computed(() => this.usuarioActual() !== null);
  readonly rol = computed<Rol | null>(() => this.usuarioActual()?.rol ?? null);
  readonly esAdmin = computed(() => this.rol() === 'ADMIN');
  readonly puedeModerar = computed(() => this.rol() === 'ADMIN' || this.rol() === 'MODERADOR');

  tieneRol(...roles: Rol[]): boolean {
    const r = this.rol();
    return r !== null && roles.includes(r);
  }

  // ------------------------------------------------------------------ Inicio de sesión

  /** Acepta username o correo. El mensaje de error no revela si la cuenta existe. */
  iniciarSesion(usuarioOCorreo: string, password: string): Resultado<Usuario> {
    const clave = usuarioOCorreo.trim().toLowerCase();
    const u = this.datos.usuarios
      .items()
      .find((x) => x.username.toLowerCase() === clave || x.correo.toLowerCase() === clave);

    if (!u || u.password !== password) {
      return fallo('Usuario o contraseña incorrectos.');
    }
    if (!u.activo) {
      return fallo('Tu cuenta está desactivada. Escribe a un administrador para reactivarla.');
    }
    this.guardarSesion(u.id);
    return exito(u);
  }

  cerrarSesion(): void {
    this.guardarSesion(null);
  }

  // ------------------------------------------------------------------ Registro

  registrar(datos: DatosRegistro): Resultado<Usuario> {
    const username = datos.username.trim().toLowerCase();
    const correo = datos.correo.trim().toLowerCase();
    if (this.usernameEnUso(username)) return fallo(`El usuario "${username}" ya está en uso.`);
    if (this.correoEnUso(correo)) return fallo(`El correo ${correo} ya tiene una cuenta.`);

    const nuevo = this.datos.usuarios.agregar({
      nombre: datos.nombre.trim(),
      username,
      correo,
      password: datos.password,
      rol: 'USUARIO',
      activo: true,
      fechaRegistro: ahora(),
    });
    this.guardarSesion(nuevo.id);
    return exito(nuevo);
  }

  // ------------------------------------------------------------------ Recuperar contraseña

  /**
   * Paso 1: genera un código de 6 dígitos para el correo indicado.
   * Simulación: en vez de enviar un email, el código se devuelve para mostrarlo en pantalla.
   */
  solicitarCodigo(correo: string): Resultado<string> {
    const clave = correo.trim().toLowerCase();
    const u = this.datos.usuarios.items().find((x) => x.correo === clave);
    if (!u) return fallo('No hay ninguna cuenta registrada con ese correo.');
    if (!u.activo) return fallo('La cuenta asociada a ese correo está desactivada.');

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.codigos.set(clave, { codigo, vence: Date.now() + VIGENCIA_CODIGO_MIN * 60_000 });
    return exito(codigo);
  }

  /** Paso 2: valida el código y cambia la contraseña. */
  restablecerPassword(correo: string, codigo: string, nueva: string): Resultado {
    const clave = correo.trim().toLowerCase();
    const pendiente = this.codigos.get(clave);
    if (!pendiente || pendiente.codigo !== codigo.trim()) {
      return fallo('El código no es correcto. Revisa los 6 dígitos o solicita uno nuevo.');
    }
    if (Date.now() > pendiente.vence) {
      this.codigos.delete(clave);
      return fallo(`El código venció (dura ${VIGENCIA_CODIGO_MIN} minutos). Solicita uno nuevo.`);
    }
    const u = this.datos.usuarios.items().find((x) => x.correo === clave)!;
    if (u.password === nueva) return fallo('La nueva contraseña debe ser distinta de la anterior.');

    this.datos.usuarios.actualizar(u.id, { password: nueva });
    this.codigos.delete(clave);
    return exito(undefined);
  }

  // ------------------------------------------------------------------ Perfil

  actualizarPerfil(cambios: DatosPerfil): Resultado<Usuario> {
    const u = this.usuarioActual();
    if (!u) return fallo('Tu sesión terminó. Inicia sesión otra vez.');
    const username = cambios.username.trim().toLowerCase();
    const correo = cambios.correo.trim().toLowerCase();
    if (this.usernameEnUso(username, u.id)) return fallo(`El usuario "${username}" ya está en uso.`);
    if (this.correoEnUso(correo, u.id)) return fallo(`El correo ${correo} ya tiene una cuenta.`);

    const actualizado = this.datos.usuarios.actualizar(u.id, {
      nombre: cambios.nombre.trim(),
      username,
      correo,
      bio: cambios.bio.trim(),
    })!;
    return exito(actualizado);
  }

  cambiarPassword(actual: string, nueva: string): Resultado {
    const u = this.usuarioActual();
    if (!u) return fallo('Tu sesión terminó. Inicia sesión otra vez.');
    if (u.password !== actual) return fallo('La contraseña actual no es correcta.');
    if (actual === nueva) return fallo('La nueva contraseña debe ser distinta de la actual.');
    this.datos.usuarios.actualizar(u.id, { password: nueva });
    return exito(undefined);
  }

  // ------------------------------------------------------------------ Validaciones de unicidad

  usernameEnUso(username: string, excluirId?: number): boolean {
    const clave = username.trim().toLowerCase();
    return this.datos.usuarios.items().some((x) => x.username === clave && x.id !== excluirId);
  }

  correoEnUso(correo: string, excluirId?: number): boolean {
    const clave = correo.trim().toLowerCase();
    return this.datos.usuarios.items().some((x) => x.correo === clave && x.id !== excluirId);
  }

  // ------------------------------------------------------------------ Persistencia de la sesión

  private guardarSesion(id: number | null): void {
    this.idSesion.set(id);
    try {
      if (id === null) sessionStorage.removeItem(CLAVE_SESION);
      else sessionStorage.setItem(CLAVE_SESION, String(id));
    } catch {
      /* sin almacenamiento: la sesión dura mientras la pestaña esté abierta */
    }
  }

  private leerSesion(): number | null {
    try {
      const v = sessionStorage.getItem(CLAVE_SESION);
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  }
}
