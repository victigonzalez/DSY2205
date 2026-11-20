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
import { PASSWORD_MAX, coinciden, correoCompleto, passwordSegura } from '../../validadores/validadores';

/**
 * Recuperar contraseña en dos pasos:
 *  1. El usuario indica su correo y se genera un código de 6 dígitos.
 *  2. Ingresa el código y su nueva contraseña.
 * Simulación: el código se muestra en pantalla en lugar de enviarse por email.
 */
@Component({
  selector: 'app-recuperar',
  imports: [NgClass, ReactiveFormsModule, RouterLink, ErrorCampo, Logo, ReglasPassword],
  template: `
    <section class="pagina-cuenta">
      <div class="tarjeta-cuenta">
        <app-logo />
        <h1 class="titulo-cuenta">Recupera tu contraseña</h1>

        <ol class="pasos" aria-label="Pasos para recuperar la contraseña">
          <li [class.actual]="paso() === 1" [class.hecho]="paso() === 2">Tu correo</li>
          <li [class.actual]="paso() === 2">Código y nueva contraseña</li>
        </ol>

        @if (error()) {
          <div class="alert alert-danger" role="alert">{{ error() }}</div>
        }

        @if (paso() === 1) {
          <p class="text-body-secondary">Escribe el correo de tu cuenta y te enviaremos un código de verificación.</p>
          <form [formGroup]="formCorreo" (ngSubmit)="pedirCodigo()" novalidate>
            <label for="correo" class="form-label">Correo</label>
            <input id="correo" class="form-control" formControlName="correo" type="email" required maxlength="120"
                   autocomplete="email" [ngClass]="claseCorreo()" aria-describedby="correo-error" />
            <app-error-campo [control]="formCorreo.controls.correo" [enviado]="enviado()" idError="correo-error" />
            <button class="btn btn-primary w-100 mt-3" type="submit">Enviar código</button>
          </form>
        } @else {
          <div class="alert alert-info" role="status">
            <strong>Simulación de correo:</strong> enviamos a {{ correo() }} el código
            <span class="codigo-demo">{{ codigo() }}</span>. Vence en 10 minutos.
          </div>
          <form [formGroup]="formClave" (ngSubmit)="restablecer()" novalidate>
            <div class="mb-3">
              <label for="codigo" class="form-label">Código de 6 dígitos</label>
              <input id="codigo" class="form-control codigo-input" formControlName="codigo" inputmode="numeric"
                     required pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"
                     [ngClass]="clase('codigo')" aria-describedby="codigo-error" />
              <app-error-campo [control]="formClave.controls.codigo" [enviado]="enviado()" idError="codigo-error" />
            </div>
            <div class="mb-3">
              <label for="nueva" class="form-label">Nueva contraseña</label>
              <input id="nueva" class="form-control" formControlName="nueva" type="password" required minlength="8"
                     [attr.maxlength]="max" autocomplete="new-password" [ngClass]="clase('nueva')"
                     aria-describedby="reglas-recuperar nueva-error" />
              <app-error-campo [control]="formClave.controls.nueva" [enviado]="enviado()" idError="nueva-error" />
              <app-reglas-password [valor]="formClave.controls.nueva.value" idLista="reglas-recuperar" />
            </div>
            <div class="mb-3">
              <label for="confirmar" class="form-label">Repite la nueva contraseña</label>
              <input id="confirmar" class="form-control" formControlName="confirmar" type="password" required
                     [attr.maxlength]="max" autocomplete="new-password" [ngClass]="clase('confirmar')"
                     aria-describedby="confirmar-error" />
              <app-error-campo [control]="formClave.controls.confirmar" [enviado]="enviado()" idError="confirmar-error" />
            </div>
            <button class="btn btn-primary w-100" type="submit">Cambiar contraseña</button>
            <button class="btn btn-link w-100 mt-2" type="button" (click)="volverAlPaso1()">Usar otro correo</button>
          </form>
        }
        <p class="mt-4 mb-0 text-center"><a routerLink="/login">Volver a iniciar sesión</a></p>
      </div>
    </section>
  `,
})
export class RecuperarPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly max = PASSWORD_MAX;
  protected readonly paso = signal<1 | 2>(1);
  protected readonly enviado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly correo = signal('');
  protected readonly codigo = signal('');

  protected readonly formCorreo = this.fb.group({
    correo: ['', [Validators.required, Validators.email, correoCompleto, Validators.maxLength(120)]],
  });

  protected readonly formClave = this.fb.group(
    {
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      nueva: ['', [Validators.required, passwordSegura]],
      confirmar: ['', [Validators.required]],
    },
    { validators: coinciden('nueva', 'confirmar') },
  );

  protected claseCorreo() {
    return claseCampo(this.formCorreo.controls.correo, this.enviado());
  }

  protected clase(campo: keyof typeof this.formClave.controls) {
    return claseCampo(this.formClave.controls[campo], this.enviado());
  }

  pedirCodigo(): void {
    this.enviado.set(true);
    this.error.set(null);
    if (this.formCorreo.invalid) {
      enfocarPrimerError(this.formCorreo, this.raiz);
      return;
    }
    const correo = this.formCorreo.getRawValue().correo;
    const r = this.auth.solicitarCodigo(correo);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.correo.set(correo.trim().toLowerCase());
    this.codigo.set(r.valor);
    this.enviado.set(false);
    this.paso.set(2);
  }

  restablecer(): void {
    this.enviado.set(true);
    this.error.set(null);
    if (this.formClave.invalid) {
      enfocarPrimerError(this.formClave, this.raiz);
      return;
    }
    const { codigo, nueva } = this.formClave.getRawValue();
    const r = this.auth.restablecerPassword(this.correo(), codigo, nueva);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.notificaciones.exito('Contraseña actualizada. Ya puedes iniciar sesión con la nueva.');
    this.router.navigate(['/login']);
  }

  volverAlPaso1(): void {
    this.paso.set(1);
    this.enviado.set(false);
    this.error.set(null);
    this.formClave.reset();
  }
}
