import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ErrorCampo } from '../../shared/error-campo';
import { claseCampo, enfocarPrimerError } from '../../shared/formularios';
import { Logo } from '../../shared/logo';

/** Inicio de sesión con username o correo. */
@Component({
  selector: 'app-login',
  imports: [NgClass, ReactiveFormsModule, RouterLink, ErrorCampo, Logo],
  template: `
    <section class="pagina-cuenta">
      <div class="tarjeta-cuenta">
        <app-logo />
        <h1 class="titulo-cuenta">Inicia sesión</h1>
        <p class="text-body-secondary">Entra para publicar temas y responder.</p>

        @if (error()) {
          <div class="alert alert-danger d-flex gap-2" role="alert">
            <i class="bi bi-exclamation-octagon-fill" aria-hidden="true"></i><span>{{ error() }}</span>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
          <div class="mb-3">
            <label for="usuario" class="form-label">Usuario o correo</label>
            <input id="usuario" class="form-control" formControlName="usuario" type="text" required
                   minlength="3" maxlength="120" autocomplete="username"
                   [ngClass]="clase('usuario')" aria-describedby="usuario-error" />
            <app-error-campo [control]="form.controls.usuario" [enviado]="enviado()" idError="usuario-error" />
          </div>
          <div class="mb-3">
            <div class="d-flex justify-content-between">
              <label for="password" class="form-label">Contraseña</label>
              <a routerLink="/recuperar" class="small">¿La olvidaste?</a>
            </div>
            <div class="input-group has-validation">
              <input id="password" class="form-control" formControlName="password" [type]="ver() ? 'text' : 'password'"
                     required maxlength="20" autocomplete="current-password"
                     [ngClass]="clase('password')" aria-describedby="password-error" />
              <button class="btn btn-outline-secondary" type="button" (click)="ver.set(!ver())"
                      [attr.aria-label]="ver() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <i class="bi" [class.bi-eye]="!ver()" [class.bi-eye-slash]="ver()" aria-hidden="true"></i>
              </button>
            </div>
            <app-error-campo [control]="form.controls.password" [enviado]="enviado()" idError="password-error" />
          </div>
          <button class="btn btn-primary w-100 btn-lg" type="submit">Iniciar sesión</button>
        </form>

        <p class="mt-4 mb-0 text-center">¿No tienes cuenta? <a routerLink="/registro">Créala aquí</a></p>
      </div>

      <aside class="cuentas-demo" aria-labelledby="titulo-demo">
        <h2 id="titulo-demo" class="h6">Cuentas de prueba</h2>
        <p class="small text-body-secondary">Haz clic en una para completar el formulario.</p>
        @for (c of demo; track c.usuario) {
          <button type="button" class="cuenta-demo" (click)="usar(c.usuario, c.password)">
            <strong>{{ c.usuario }}</strong> <span>{{ c.rol }}</span> <code>{{ c.password }}</code>
          </button>
        }
      </aside>
    </section>
  `,
})
export class LoginPage {
  /** Ruta a la que volver después de iniciar sesión (?volver=/temas/nuevo). */
  readonly volver = input<string>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
  });
  protected readonly enviado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ver = signal(false);

  protected readonly demo = [
    { usuario: 'admin', password: 'Admin#123', rol: 'Administrador' },
    { usuario: 'moderador', password: 'Moder#123', rol: 'Moderador' },
    { usuario: 'victor', password: 'Usuario#123', rol: 'Usuario' },
  ];

  protected clase(campo: 'usuario' | 'password') {
    return claseCampo(this.form.controls[campo], this.enviado());
  }

  usar(usuario: string, password: string): void {
    this.form.setValue({ usuario, password });
    this.error.set(null);
  }

  entrar(): void {
    this.enviado.set(true);
    this.error.set(null);
    if (this.form.invalid) {
      enfocarPrimerError(this.form, this.raiz);
      return;
    }
    const { usuario, password } = this.form.getRawValue();
    const r = this.auth.iniciarSesion(usuario, password);
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.notificaciones.exito(`Hola, ${r.valor.nombre.split(' ')[0]}. Iniciaste sesión.`);
    const destino = this.volver()?.startsWith('/') ? this.volver()! : '/';
    this.router.navigateByUrl(destino);
  }
}
