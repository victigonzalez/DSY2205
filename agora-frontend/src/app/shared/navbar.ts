import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';
import { Avatar } from './avatar';
import { Logo } from './logo';

/**
 * Barra de navegación responsiva (Bootstrap navbar-expand-lg):
 * en móvil y tablet se colapsa en el botón de menú.
 * Los enlaces cambian según el rol del usuario conectado.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule, Logo, Avatar],
  template: `
    <nav class="navbar navbar-expand-lg navbar-agora sticky-top" aria-label="Navegación principal">
      <div class="container-xl">
        <a class="navbar-brand" routerLink="/" aria-label="Ágora, ir al inicio"><app-logo [claro]="true" /></a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal"
                aria-controls="menu-principal" aria-expanded="false" aria-label="Abrir menú">
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>

        <div class="collapse navbar-collapse" id="menu-principal">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link" routerLink="/temas" routerLinkActive="active">Temas</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/categorias" routerLinkActive="active">Categorías</a></li>
            @if (auth.puedeModerar()) {
              <li class="nav-item"><a class="nav-link" routerLink="/moderacion" routerLinkActive="active">Moderación</a></li>
            }
            @if (auth.esAdmin()) {
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Administración</a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/admin/usuarios">Usuarios</a></li>
                  <li><a class="dropdown-item" routerLink="/admin/categorias">Categorías</a></li>
                </ul>
              </li>
            }
          </ul>

          <form class="buscador-nav my-2 my-lg-0 me-lg-3" role="search" (ngSubmit)="buscar()">
            <i class="bi bi-search" aria-hidden="true"></i>
            <input class="form-control" type="search" name="q" [(ngModel)]="texto"
                   placeholder="Buscar en el foro" aria-label="Buscar en el foro" maxlength="80" />
          </form>

          @if (auth.usuarioActual(); as u) {
            <a class="btn btn-acento me-lg-2 mb-2 mb-lg-0" routerLink="/temas/nuevo">
              <i class="bi bi-plus-lg" aria-hidden="true"></i> Nuevo tema
            </a>
            <div class="dropdown">
              <button class="btn btn-usuario dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <app-avatar [nombre]="u.nombre" [username]="u.username" [tam]="30" />
                <span>{{ u.username }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-lg-end">
                <li><span class="dropdown-item-text small text-body-secondary">Rol: {{ u.rol }}</span></li>
                <li><a class="dropdown-item" routerLink="/perfil"><i class="bi bi-person me-2" aria-hidden="true"></i>Mi perfil</a></li>
                <li><a class="dropdown-item" routerLink="/mis-temas"><i class="bi bi-chat-square-text me-2" aria-hidden="true"></i>Mis temas</a></li>
                <li><hr class="dropdown-divider" /></li>
                <li><button class="dropdown-item" type="button" (click)="salir()"><i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Cerrar sesión</button></li>
              </ul>
            </div>
          } @else {
            <div class="d-flex gap-2">
              <a class="btn btn-outline-light" routerLink="/login">Iniciar sesión</a>
              <a class="btn btn-acento" routerLink="/registro">Crear cuenta</a>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  protected texto = '';

  buscar(): void {
    const q = this.texto.trim();
    this.router.navigate(['/temas'], { queryParams: q ? { q } : {} });
    this.texto = '';
  }

  salir(): void {
    const nombre = this.auth.usuarioActual()?.username;
    this.auth.cerrarSesion();
    this.notificaciones.exito(`Sesión cerrada. Hasta pronto, ${nombre}.`);
    this.router.navigate(['/']);
  }
}
