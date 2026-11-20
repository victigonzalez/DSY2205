import { DatePipe, NgClass } from '@angular/common';
import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ROLES, Rol, Usuario } from '../../models/modelos';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Avatar } from '../../shared/avatar';
import { ErrorCampo } from '../../shared/error-campo';
import { claseCampo, enfocarPrimerError } from '../../shared/formularios';
import { ReglasPassword } from '../../shared/reglas-password';
import {
  PASSWORD_MAX,
  correoCompleto,
  nombreValido,
  passwordSegura,
  unico,
  usernameValido,
} from '../../validadores/validadores';

/** Gestión de usuarios (solo ADMIN): crear, modificar rol y estado, y eliminar. */
@Component({
  selector: 'app-admin-usuarios',
  imports: [NgClass, DatePipe, ReactiveFormsModule, ErrorCampo, ReglasPassword, Avatar],
  templateUrl: './admin-usuarios.html',
})
export class AdminUsuariosPage {
  protected readonly admin = inject(AdminService);
  protected readonly auth = inject(AuthService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly roles = ROLES;
  protected readonly max = PASSWORD_MAX;
  protected readonly filtroRol = signal<Rol | ''>('');
  protected readonly busqueda = signal('');

  protected readonly usuarios = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.admin
      .usuarios()
      .filter((u) => !this.filtroRol() || u.rol === this.filtroRol())
      .filter((u) => !q || u.nombre.toLowerCase().includes(q) || u.username.includes(q) || u.correo.includes(q));
  });

  /** null = formulario cerrado; 0 = creando; >0 = editando ese id. */
  protected readonly editandoId = signal<number | null>(null);
  protected readonly enviado = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), nombreValido]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), usernameValido,
      unico((v) => this.auth.usernameEnUso(v, this.editandoId() || undefined), 'usernameEnUso')]],
    correo: ['', [Validators.required, Validators.email, correoCompleto, Validators.maxLength(120),
      unico((v) => this.auth.correoEnUso(v, this.editandoId() || undefined), 'correoEnUso')]],
    rol: ['USUARIO' as Rol, [Validators.required]],
    activo: [true],
    password: ['', [passwordSegura]],
  });

  protected clase(campo: keyof typeof this.form.controls) {
    return claseCampo(this.form.controls[campo], this.enviado());
  }

  nuevo(): void {
    this.form.reset({ nombre: '', username: '', correo: '', rol: 'USUARIO', activo: true, password: '' });
    this.form.controls.password.setValidators([Validators.required, passwordSegura]);
    this.form.controls.password.updateValueAndValidity();
    this.enviado.set(false);
    this.editandoId.set(0);
  }

  editar(u: Usuario): void {
    this.form.reset({ nombre: u.nombre, username: u.username, correo: u.correo, rol: u.rol, activo: u.activo, password: '' });
    this.form.controls.password.setValidators([passwordSegura]);
    this.form.controls.password.updateValueAndValidity();
    this.enviado.set(false);
    this.editandoId.set(u.id);
  }

  cerrar(): void {
    this.editandoId.set(null);
  }

  guardar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      enfocarPrimerError(this.form, this.raiz);
      return;
    }
    const datos = this.form.getRawValue();
    const id = this.editandoId()!;
    const r = id === 0 ? this.admin.crearUsuario(datos) : this.admin.actualizarUsuario(id, datos);
    if (!r.ok) return this.notificaciones.error(r.mensaje);
    this.notificaciones.exito(id === 0 ? `Usuario ${r.valor.username} creado.` : `Usuario ${r.valor.username} actualizado.`);
    this.cerrar();
  }

  alternarActivo(u: Usuario): void {
    const r = this.admin.actualizarUsuario(u.id, { ...u, activo: !u.activo, password: '' });
    r.ok
      ? this.notificaciones.exito(`${u.username} ${u.activo ? 'desactivado' : 'activado'}.`)
      : this.notificaciones.error(r.mensaje);
  }

  eliminar(u: Usuario): void {
    if (!confirm(`¿Eliminar a ${u.username}? También se eliminarán sus temas y comentarios.`)) return;
    const r = this.admin.eliminarUsuario(u.id);
    r.ok ? this.notificaciones.exito(`Usuario ${u.username} eliminado.`) : this.notificaciones.error(r.mensaje);
    if (this.editandoId() === u.id) this.cerrar();
  }

  restablecer(): void {
    if (!confirm('¿Restablecer todos los usuarios, categorías, temas y comentarios a los datos de ejemplo?')) return;
    this.admin.restablecerDatos();
    this.cerrar();
    this.notificaciones.exito('Datos de ejemplo restablecidos.');
  }
}
