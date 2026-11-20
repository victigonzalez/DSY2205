import { Routes } from '@angular/router';

import { autenticadoGuard, invitadoGuard, rolGuard } from './guards/guards';

/**
 * Rutas de Ágora. Cada página se carga bajo demanda (loadComponent).
 * Acceso:
 *   público           → inicio, temas, categorías, detalle de tema
 *   sin sesión        → login, registro, recuperar contraseña
 *   con sesión        → perfil, publicar/editar tema, mis temas
 *   ADMIN o MODERADOR → moderación
 *   ADMIN             → administración de usuarios y categorías
 */
export const routes: Routes = [
  { path: '', title: 'Ágora | La plaza para conversar', loadComponent: () => import('./pages/inicio/inicio').then((m) => m.InicioPage) },

  { path: 'login', title: 'Iniciar sesión | Ágora', canActivate: [invitadoGuard], loadComponent: () => import('./pages/cuenta/login').then((m) => m.LoginPage) },
  { path: 'registro', title: 'Crear cuenta | Ágora', canActivate: [invitadoGuard], loadComponent: () => import('./pages/cuenta/registro').then((m) => m.RegistroPage) },
  { path: 'recuperar', title: 'Recuperar contraseña | Ágora', canActivate: [invitadoGuard], loadComponent: () => import('./pages/cuenta/recuperar').then((m) => m.RecuperarPage) },
  { path: 'perfil', title: 'Mi perfil | Ágora', canActivate: [autenticadoGuard], loadComponent: () => import('./pages/cuenta/perfil').then((m) => m.PerfilPage) },

  { path: 'temas', title: 'Temas | Ágora', loadComponent: () => import('./pages/foro/temas').then((m) => m.TemasPage) },
  { path: 'temas/nuevo', title: 'Nuevo tema | Ágora', canActivate: [autenticadoGuard], loadComponent: () => import('./pages/foro/tema-form').then((m) => m.TemaFormPage) },
  { path: 'temas/:id/editar', title: 'Editar tema | Ágora', canActivate: [autenticadoGuard], loadComponent: () => import('./pages/foro/tema-form').then((m) => m.TemaFormPage) },
  { path: 'temas/:id', title: 'Tema | Ágora', loadComponent: () => import('./pages/foro/tema-detalle').then((m) => m.TemaDetallePage) },
  { path: 'categorias', title: 'Categorías | Ágora', loadComponent: () => import('./pages/foro/categorias').then((m) => m.CategoriasPage) },
  { path: 'categorias/:slug', title: 'Categoría | Ágora', loadComponent: () => import('./pages/foro/temas').then((m) => m.TemasPage) },
  { path: 'mis-temas', title: 'Mis temas | Ágora', canActivate: [autenticadoGuard], loadComponent: () => import('./pages/foro/mis-temas').then((m) => m.MisTemasPage) },

  { path: 'moderacion', title: 'Moderación | Ágora', canActivate: [rolGuard], data: { roles: ['ADMIN', 'MODERADOR'] }, loadComponent: () => import('./pages/moderacion/moderacion').then((m) => m.ModeracionPage) },
  { path: 'admin/usuarios', title: 'Usuarios | Ágora', canActivate: [rolGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/admin/admin-usuarios').then((m) => m.AdminUsuariosPage) },
  { path: 'admin/categorias', title: 'Categorías · Administración | Ágora', canActivate: [rolGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/admin/admin-categorias').then((m) => m.AdminCategoriasPage) },

  { path: 'acceso-denegado', title: 'Sin permiso | Ágora', loadComponent: () => import('./pages/errores').then((m) => m.AccesoDenegadoPage) },
  { path: '**', title: 'Página no encontrada | Ágora', loadComponent: () => import('./pages/errores').then((m) => m.NoEncontradoPage) },
];
