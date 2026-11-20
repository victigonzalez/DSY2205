import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Categoria } from '../../models/modelos';
import { AdminService } from '../../services/admin.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ErrorCampo } from '../../shared/error-campo';
import { claseCampo, enfocarPrimerError } from '../../shared/formularios';
import { colorHex, noSoloEspacios, unico } from '../../validadores/validadores';

/** Íconos disponibles para las categorías (Bootstrap Icons). */
const ICONOS = [
  { clase: 'bi-cpu', nombre: 'Procesador' },
  { clase: 'bi-controller', nombre: 'Control' },
  { clase: 'bi-dice-5', nombre: 'Dado' },
  { clase: 'bi-film', nombre: 'Película' },
  { clase: 'bi-trophy', nombre: 'Trofeo' },
  { clase: 'bi-music-note-beamed', nombre: 'Música' },
  { clase: 'bi-book', nombre: 'Libro' },
  { clase: 'bi-camera', nombre: 'Cámara' },
  { clase: 'bi-palette', nombre: 'Arte' },
  { clase: 'bi-globe2', nombre: 'Mundo' },
  { clase: 'bi-cup-hot', nombre: 'Café' },
  { clase: 'bi-heart-pulse', nombre: 'Salud' },
];

/** Gestión de categorías (solo ADMIN). */
@Component({
  selector: 'app-admin-categorias',
  imports: [NgClass, ReactiveFormsModule, RouterLink, ErrorCampo],
  template: `
    <section class="cabecera-listado cabecera-admin">
      <div class="container-xl d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-end">
        <div>
          <h1>Categorías</h1>
          <p class="mb-0">El foro debe tener al menos 5 categorías. Una categoría con temas no se puede eliminar.</p>
        </div>
        <button class="btn btn-acento" type="button" (click)="nueva()"><i class="bi bi-plus-lg" aria-hidden="true"></i> Nueva categoría</button>
      </div>
    </section>

    <section class="container-xl seccion">
      <div class="row g-4">
        <div class="col-12" [class.col-xl-7]="editandoId() !== null">
          <div class="table-responsive tabla-panel">
            <table class="table align-middle mb-0">
              <caption class="visually-hidden">Categorías del foro</caption>
              <thead><tr><th scope="col">Categoría</th><th scope="col" class="d-none d-md-table-cell">Descripción</th><th scope="col">Temas</th><th scope="col" class="text-end">Acciones</th></tr></thead>
              <tbody>
                @for (c of admin.categorias(); track c.id) {
                  @let n = admin.temasPorCategoria().get(c.id) ?? 0;
                  <tr>
                    <td>
                      <span class="icono-categoria" [style.--cat]="c.color"><i class="bi {{ c.icono }}" aria-hidden="true"></i></span>
                      <a [routerLink]="['/categorias', c.slug]">{{ c.nombre }}</a>
                    </td>
                    <td class="d-none d-md-table-cell text-body-secondary">{{ c.descripcion }}</td>
                    <td>{{ n }}</td>
                    <td class="text-end text-nowrap">
                      <button class="btn btn-sm btn-outline-primary" type="button" (click)="editar(c)" [attr.aria-label]="'Editar ' + c.nombre"><i class="bi bi-pencil" aria-hidden="true"></i></button>
                      <button class="btn btn-sm btn-outline-danger ms-1" type="button" (click)="eliminar(c)" [attr.aria-label]="'Eliminar ' + c.nombre"
                              [disabled]="n > 0 || admin.categorias().length <= 5"
                              [title]="n > 0 ? 'Tiene temas publicados' : admin.categorias().length <= 5 ? 'El foro necesita al menos 5 categorías' : 'Eliminar'">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        @if (editandoId() !== null) {
          <div class="col-12 col-xl-5">
            <form class="panel-formulario" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 mb-0">{{ editandoId() === 0 ? 'Nueva categoría' : 'Editar categoría' }}</h2>
                <button type="button" class="btn-close" (click)="editandoId.set(null)" aria-label="Cerrar formulario"></button>
              </div>
              <div class="mb-3">
                <label for="c-nombre" class="form-label">Nombre</label>
                <input id="c-nombre" class="form-control" formControlName="nombre" required minlength="3" maxlength="60" [ngClass]="clase('nombre')" />
                <app-error-campo [control]="form.controls.nombre" [enviado]="enviado()" />
              </div>
              <div class="mb-3">
                <label for="c-descripcion" class="form-label">Descripción</label>
                <textarea id="c-descripcion" class="form-control" rows="2" formControlName="descripcion" required minlength="10" maxlength="250" [ngClass]="clase('descripcion')"></textarea>
                <app-error-campo [control]="form.controls.descripcion" [enviado]="enviado()" />
              </div>
              <fieldset class="mb-3">
                <legend class="form-label fs-6">Ícono</legend>
                <div class="selector-iconos">
                  @for (i of iconos; track i.clase) {
                    <input type="radio" class="btn-check" formControlName="icono" [id]="'ico-' + i.clase" [value]="i.clase" />
                    <label class="btn btn-outline-secondary" [for]="'ico-' + i.clase" [title]="i.nombre">
                      <i class="bi {{ i.clase }}" aria-hidden="true"></i><span class="visually-hidden">{{ i.nombre }}</span>
                    </label>
                  }
                </div>
              </fieldset>
              <div class="mb-3">
                <label for="c-color" class="form-label">Color identificador</label>
                <div class="d-flex gap-2 align-items-center">
                  <input id="c-color" class="form-control form-control-color" type="color" formControlName="color" required />
                  <code>{{ form.controls.color.value }}</code>
                </div>
                <app-error-campo [control]="form.controls.color" [enviado]="enviado()" />
              </div>
              <div class="vista-previa mb-3" [style.--cat]="form.controls.color.value">
                <i class="bi {{ form.controls.icono.value }}" aria-hidden="true"></i> {{ form.controls.nombre.value || 'Vista previa' }}
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary" type="submit">{{ editandoId() === 0 ? 'Crear categoría' : 'Guardar cambios' }}</button>
                <button class="btn btn-outline-secondary" type="button" (click)="editandoId.set(null)">Cancelar</button>
              </div>
            </form>
          </div>
        }
      </div>
    </section>
  `,
})
export class AdminCategoriasPage {
  protected readonly admin = inject(AdminService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly iconos = ICONOS;
  protected readonly editandoId = signal<number | null>(null);
  protected readonly enviado = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), noSoloEspacios,
      unico((v) => this.admin.nombreCategoriaEnUso(v, this.editandoId() || undefined), 'categoriaEnUso')]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(250), noSoloEspacios]],
    icono: ['bi-book', [Validators.required]],
    color: ['#2B50D6', [Validators.required, colorHex]],
  });

  protected clase(campo: keyof typeof this.form.controls) {
    return claseCampo(this.form.controls[campo], this.enviado());
  }

  nueva(): void {
    this.form.reset({ nombre: '', descripcion: '', icono: 'bi-book', color: '#2B50D6' });
    this.enviado.set(false);
    this.editandoId.set(0);
  }

  editar(c: Categoria): void {
    this.form.reset({ nombre: c.nombre, descripcion: c.descripcion, icono: c.icono, color: c.color });
    this.enviado.set(false);
    this.editandoId.set(c.id);
  }

  guardar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      enfocarPrimerError(this.form, this.raiz);
      return;
    }
    const v = this.form.getRawValue();
    const datos = { ...v, slug: '' };
    const id = this.editandoId()!;
    const r = id === 0 ? this.admin.crearCategoria(datos) : this.admin.actualizarCategoria(id, datos);
    if (!r.ok) return this.notificaciones.error(r.mensaje);
    this.notificaciones.exito(id === 0 ? `Categoría "${r.valor.nombre}" creada.` : 'Categoría actualizada.');
    this.editandoId.set(null);
  }

  eliminar(c: Categoria): void {
    if (this.admin.categorias().length <= 5) {
      return this.notificaciones.error('El foro debe mantener al menos 5 categorías.');
    }
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    const r = this.admin.eliminarCategoria(c.id);
    r.ok ? this.notificaciones.exito('Categoría eliminada.') : this.notificaciones.error(r.mensaje);
  }
}
