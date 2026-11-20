import { DatePipe, NgClass } from '@angular/common';
import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { TemaService } from '../../services/tema.service';
import { Avatar } from '../../shared/avatar';
import { ErrorCampo } from '../../shared/error-campo';
import { claseCampo, enfocarPrimerError } from '../../shared/formularios';
import { ReglasPassword } from '../../shared/reglas-password';
import {
  PASSWORD_MAX,
  coinciden,
  correoCompleto,
  nombreValido,
  passwordSegura,
  unico,
  usernameValido,
} from '../../validadores/validadores';

/** Modificación de perfil: datos personales y cambio de contraseña. */
@Component({
  selector: 'app-perfil',
  imports: [NgClass, DatePipe, ReactiveFormsModule, RouterLink, ErrorCampo, ReglasPassword, Avatar],
  template: `
    @if (auth.usuarioActual(); as u) {
    <section class="container-xl seccion">
      <div class="cabecera-perfil">
        <app-avatar [nombre]="u.nombre" [username]="u.username" [tam]="72" />
        <div>
          <h1 class="mb-1">{{ u.nombre }}</h1>
          <p class="mb-0 text-body-secondary">
            &#64;{{ u.username }}, {{ etiquetaRol() }}. Miembro desde {{ u.fechaRegistro | date: 'MMMM yyyy' }}.
            <a routerLink="/mis-temas">{{ cantidadTemas() }} {{ cantidadTemas() === 1 ? 'tema publicado' : 'temas publicados' }}</a>
          </p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <form class="panel-formulario" [formGroup]="formPerfil" (ngSubmit)="guardarPerfil()" novalidate>
            <h2 class="h4">Datos del perfil</h2>
            <div class="row g-3">
              <div class="col-12">
                <label for="nombre" class="form-label">Nombre y apellido</label>
                <input id="nombre" class="form-control" formControlName="nombre" required minlength="5" maxlength="100"
                       [ngClass]="clase(formPerfil.controls.nombre, enviadoPerfil())" aria-describedby="nombre-error" />
                <app-error-campo [control]="formPerfil.controls.nombre" [enviado]="enviadoPerfil()" idError="nombre-error" />
              </div>
              <div class="col-12 col-md-6">
                <label for="username" class="form-label">Nombre de usuario</label>
                <input id="username" class="form-control" formControlName="username" required minlength="3" maxlength="30"
                       [ngClass]="clase(formPerfil.controls.username, enviadoPerfil())" aria-describedby="username-error" />
                <app-error-campo [control]="formPerfil.controls.username" [enviado]="enviadoPerfil()" idError="username-error" />
              </div>
              <div class="col-12 col-md-6">
                <label for="correo" class="form-label">Correo</label>
                <input id="correo" class="form-control" type="email" formControlName="correo" required maxlength="120"
                       [ngClass]="clase(formPerfil.controls.correo, enviadoPerfil())" aria-describedby="correo-error" />
                <app-error-campo [control]="formPerfil.controls.correo" [enviado]="enviadoPerfil()" idError="correo-error" />
              </div>
              <div class="col-12">
                <label for="bio" class="form-label">Sobre ti <span class="text-body-secondary">(opcional)</span></label>
                <textarea id="bio" class="form-control" rows="3" formControlName="bio" maxlength="200"
                          [ngClass]="clase(formPerfil.controls.bio, enviadoPerfil())" aria-describedby="bio-ayuda bio-error"></textarea>
                <div id="bio-ayuda" class="form-text">{{ formPerfil.controls.bio.value.length }}/200 caracteres</div>
                <app-error-campo [control]="formPerfil.controls.bio" [enviado]="enviadoPerfil()" idError="bio-error" />
              </div>
            </div>
            <div class="d-flex gap-2 mt-4">
              <button class="btn btn-primary" type="submit" [disabled]="formPerfil.pristine">Guardar cambios</button>
              <button class="btn btn-outline-secondary" type="button" (click)="descartar()" [disabled]="formPerfil.pristine">Descartar</button>
            </div>
          </form>
        </div>

        <div class="col-12 col-lg-5">
          <form class="panel-formulario" [formGroup]="formClave" (ngSubmit)="cambiarClave()" novalidate>
            <h2 class="h4">Cambiar contraseña</h2>
            <div class="mb-3">
              <label for="actual" class="form-label">Contraseña actual</label>
              <input id="actual" class="form-control" type="password" formControlName="actual" required
                     [attr.maxlength]="max" autocomplete="current-password"
                     [ngClass]="clase(formClave.controls.actual, enviadoClave())" aria-describedby="actual-error" />
              <app-error-campo [control]="formClave.controls.actual" [enviado]="enviadoClave()" idError="actual-error" />
            </div>
            <div class="mb-3">
              <label for="nueva" class="form-label">Nueva contraseña</label>
              <input id="nueva" class="form-control" type="password" formControlName="nueva" required minlength="8"
                     [attr.maxlength]="max" autocomplete="new-password"
                     [ngClass]="clase(formClave.controls.nueva, enviadoClave())" aria-describedby="reglas-perfil nueva-error" />
              <app-error-campo [control]="formClave.controls.nueva" [enviado]="enviadoClave()" idError="nueva-error" />
              <app-reglas-password [valor]="formClave.controls.nueva.value" idLista="reglas-perfil" />
            </div>
            <div class="mb-3">
              <label for="confirmar" class="form-label">Repite la nueva contraseña</label>
              <input id="confirmar" class="form-control" type="password" formControlName="confirmar" required
                     [attr.maxlength]="max" autocomplete="new-password"
                     [ngClass]="clase(formClave.controls.confirmar, enviadoClave())" aria-describedby="confirmar-error" />
              <app-error-campo [control]="formClave.controls.confirmar" [enviado]="enviadoClave()" idError="confirmar-error" />
            </div>
            <button class="btn btn-primary" type="submit">Cambiar contraseña</button>
          </form>
        </div>
      </div>
    </section>
    }
  `,
})
export class PerfilPage {
  protected readonly auth = inject(AuthService);
  private readonly temas = inject(TemaService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly max = PASSWORD_MAX;
  protected readonly enviadoPerfil = signal(false);
  protected readonly enviadoClave = signal(false);
  protected readonly cantidadTemas = computed(() => this.temas.misTemas().length);
  protected readonly etiquetaRol = computed(
    () => ({ ADMIN: 'administrador', MODERADOR: 'moderador', USUARIO: 'usuario' })[this.auth.rol() ?? 'USUARIO'],
  );

  private readonly idActual = this.auth.usuarioActual()!.id;

  protected readonly formPerfil = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), nombreValido]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), usernameValido,
      unico((v) => this.auth.usernameEnUso(v, this.idActual), 'usernameEnUso')]],
    correo: ['', [Validators.required, Validators.email, correoCompleto, Validators.maxLength(120),
      unico((v) => this.auth.correoEnUso(v, this.idActual), 'correoEnUso')]],
    bio: ['', [Validators.maxLength(200)]],
  });

  protected readonly formClave = this.fb.group(
    {
      actual: ['', [Validators.required]],
      nueva: ['', [Validators.required, passwordSegura]],
      confirmar: ['', [Validators.required]],
    },
    { validators: coinciden('nueva', 'confirmar') },
  );

  constructor() {
    this.descartar();
  }

  protected clase = claseCampo;

  descartar(): void {
    const u = this.auth.usuarioActual()!;
    this.formPerfil.reset({ nombre: u.nombre, username: u.username, correo: u.correo, bio: u.bio ?? '' });
    this.enviadoPerfil.set(false);
  }

  guardarPerfil(): void {
    this.enviadoPerfil.set(true);
    if (this.formPerfil.invalid) {
      enfocarPrimerError(this.formPerfil, this.raiz);
      return;
    }
    const r = this.auth.actualizarPerfil(this.formPerfil.getRawValue());
    if (!r.ok) {
      this.notificaciones.error(r.mensaje);
      return;
    }
    this.notificaciones.exito('Perfil actualizado.');
    this.descartar();
  }

  cambiarClave(): void {
    this.enviadoClave.set(true);
    if (this.formClave.invalid) {
      enfocarPrimerError(this.formClave, this.raiz);
      return;
    }
    const { actual, nueva } = this.formClave.getRawValue();
    const r = this.auth.cambiarPassword(actual, nueva);
    if (!r.ok) {
      this.notificaciones.error(r.mensaje);
      return;
    }
    this.notificaciones.exito('Contraseña cambiada.');
    this.formClave.reset();
    this.enviadoClave.set(false);
  }
}
