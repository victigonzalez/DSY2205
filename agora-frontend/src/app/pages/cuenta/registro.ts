import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ErrorCampo } from '../../shared/error-campo';
import { claseCampo, enfocarPrimerError } from '../../shared/formularios';
import { Logo } from '../../shared/logo';
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

/** Registro de usuarios: toda cuenta nueva parte con el rol USUARIO. */
@Component({
  selector: 'app-registro',
  imports: [NgClass, ReactiveFormsModule, RouterLink, ErrorCampo, Logo, ReglasPassword],
  template: `
    <section class="pagina-cuenta">
      <div class="tarjeta-cuenta tarjeta-ancha">
        <app-logo />
        <h1 class="titulo-cuenta">Crea tu cuenta</h1>
        <p class="text-body-secondary">Con una cuenta puedes publicar temas y comentar en todas las categorías.</p>

        @if (error()) {
          <div class="alert alert-danger" role="alert">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="registrar()" novalidate>
          <div class="row g-3">
            <div class="col-12">
              <label for="nombre" class="form-label">Nombre y apellido</label>
              <input id="nombre" class="form-control" formControlName="nombre" required minlength="5" maxlength="100"
                     autocomplete="name" [ngClass]="clase('nombre')" aria-describedby="nombre-error" />
              <app-error-campo [control]="form.controls.nombre" [enviado]="enviado()" idError="nombre-error" />
            </div>
            <div class="col-12 col-md-6">
              <label for="username" class="form-label">Nombre de usuario</label>
              <div class="input-group has-validation">
                <span class="input-group-text">&#64;</span>
                <input id="username" class="form-control" formControlName="username" required minlength="3" maxlength="30"
                       autocomplete="username" [ngClass]="clase('username')" aria-describedby="username-ayuda username-error" />
              </div>
              <div id="username-ayuda" class="form-text">Es tu nombre público en el foro.</div>
              <app-error-campo [control]="form.controls.username" [enviado]="enviado()" idError="username-error" />
            </div>
            <div class="col-12 col-md-6">
              <label for="correo" class="form-label">Correo</label>
              <input id="correo" class="form-control" formControlName="correo" type="email" required maxlength="120"
                     autocomplete="email" [ngClass]="clase('correo')" aria-describedby="correo-error" />
              <app-error-campo [control]="form.controls.correo" [enviado]="enviado()" idError="correo-error" />
            </div>
            <div class="col-12 col-md-6">
              <label for="password" class="form-label">Contraseña</label>
              <input id="password" class="form-control" formControlName="password" type="password" required
                     minlength="8" [attr.maxlength]="max" autocomplete="new-password"
                     [ngClass]="clase('password')" aria-describedby="reglas-registro password-error" />
              <app-error-campo [control]="form.controls.password" [enviado]="enviado()" idError="password-error" />
            </div>
            <div class="col-12 col-md-6">
              <label for="confirmar" class="form-label">Repite la contraseña</label>
              <input id="confirmar" class="form-control" formControlName="confirmar" type="password" required
                     [attr.maxlength]="max" autocomplete="new-password"
                     [ngClass]="clase('confirmar')" aria-describedby="confirmar-error" />
              <app-error-campo [control]="form.controls.confirmar" [enviado]="enviado()" idError="confirmar-error" />
            </div>
            <div class="col-12">
              <app-reglas-password [valor]="form.controls.password.value" idLista="reglas-registro" />
            </div>
            <div class="col-12">
              <div class="form-check">
                <input id="normas" class="form-check-input" type="checkbox" formControlName="normas" required
                       [ngClass]="clase('normas')" aria-describedby="normas-error" />
                <label for="normas" class="form-check-label">
                  Acepto las normas del foro: respeto, nada de spam ni lenguaje ofensivo.
                </label>
                <app-error-campo [control]="form.controls.normas" [enviado]="enviado()" idError="normas-error" />
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-lg w-100 mt-4" type="submit">Crear cuenta</button>
        </form>
        <p class="mt-4 mb-0 text-center">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
      </div>
    </section>
  `,
})
export class RegistroPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly max = PASSWORD_MAX;
  protected readonly enviado = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), nombreValido]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), usernameValido,
        unico((v) => this.auth.usernameEnUso(v), 'usernameEnUso')]],
      correo: ['', [Validators.required, Validators.email, correoCompleto, Validators.maxLength(120),
        unico((v) => this.auth.correoEnUso(v), 'correoEnUso')]],
      password: ['', [Validators.required, passwordSegura]],
      confirmar: ['', [Validators.required]],
      normas: [false, [Validators.requiredTrue]],
    },
    { validators: coinciden('password', 'confirmar') },
  );

  protected clase(campo: keyof typeof this.form.controls) {
    return claseCampo(this.form.controls[campo], this.enviado());
  }

  registrar(): void {
    this.enviado.set(true);
    this.error.set(null);
    if (this.form.invalid) {
      enfocarPrimerError(this.form, this.raiz);
      return;
    }
    const { nombre, username, correo, password } = this.form.getRawValue();
    const r = this.auth.registrar({ nombre, username, correo, password });
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.notificaciones.exito(`¡Bienvenido/a a Ágora, ${r.valor.username}! Tu cuenta quedó creada.`);
    this.router.navigate(['/']);
  }
}
