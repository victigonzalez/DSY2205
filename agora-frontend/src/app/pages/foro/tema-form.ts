import { NgClass } from '@angular/common';
import { Component, ElementRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CategoriaService } from '../../services/categoria.service';
import { NotificacionService } from '../../services/notificacion.service';
import { TemaService } from '../../services/tema.service';
import { ErrorCampo } from '../../shared/error-campo';
import { claseCampo, enfocarPrimerError } from '../../shared/formularios';
import { noSoloEspacios } from '../../validadores/validadores';

/** Publicar un tema nuevo (/temas/nuevo) o editar uno propio (/temas/:id/editar). */
@Component({
  selector: 'app-tema-form',
  imports: [NgClass, ReactiveFormsModule, RouterLink, ErrorCampo],
  template: `
    <section class="container-xl seccion">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9 col-xl-8">
          @if (noPermitido()) {
            <div class="vacio">
              <i class="bi bi-lock" aria-hidden="true"></i>
              <h1 class="h3">No puedes editar este tema</h1>
              <p>{{ noPermitido() }}</p>
              <a class="btn btn-primary" routerLink="/temas">Volver a los temas</a>
            </div>
          } @else {
            <h1>{{ esEdicion() ? 'Editar tema' : 'Nuevo tema' }}</h1>
            <p class="text-body-secondary">Un buen título es una pregunta o idea concreta. Explica el contexto en el contenido.</p>

            <form class="panel-formulario" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
              <div class="mb-3">
                <label for="categoria" class="form-label">Categoría</label>
                <select id="categoria" class="form-select" formControlName="categoriaId" required
                        [ngClass]="clase('categoriaId')" aria-describedby="categoria-error">
                  <option [ngValue]="null" disabled>Elige una categoría</option>
                  @for (c of categorias.todas(); track c.id) {
                    <option [ngValue]="c.id">{{ c.nombre }}</option>
                  }
                </select>
                <app-error-campo [control]="form.controls.categoriaId" [enviado]="enviado()" idError="categoria-error" />
              </div>
              <div class="mb-3">
                <label for="titulo" class="form-label">Título</label>
                <input id="titulo" class="form-control" formControlName="titulo" required minlength="5" maxlength="150"
                       [ngClass]="clase('titulo')" aria-describedby="titulo-ayuda titulo-error" />
                <div id="titulo-ayuda" class="form-text">{{ (form.controls.titulo.value ?? "").length }}/150 caracteres</div>
                <app-error-campo [control]="form.controls.titulo" [enviado]="enviado()" idError="titulo-error" />
              </div>
              <div class="mb-3">
                <label for="contenido" class="form-label">Contenido</label>
                <textarea id="contenido" class="form-control" rows="8" formControlName="contenido" required
                          minlength="20" maxlength="4000" [ngClass]="clase('contenido')"
                          aria-describedby="contenido-ayuda contenido-error"></textarea>
                <div id="contenido-ayuda" class="form-text">{{ (form.controls.contenido.value ?? "").length }}/4000 caracteres (mínimo 20)</div>
                <app-error-campo [control]="form.controls.contenido" [enviado]="enviado()" idError="contenido-error" />
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-primary" type="submit">{{ esEdicion() ? 'Guardar cambios' : 'Publicar tema' }}</button>
                <a class="btn btn-outline-secondary" [routerLink]="esEdicion() ? ['/temas', id()] : ['/temas']">Cancelar</a>
              </div>
            </form>
          }
        </div>
      </div>
    </section>
  `,
})
export class TemaFormPage implements OnInit {
  /** Presente solo al editar. */
  readonly id = input<string>();
  /** ?categoria=3 preselecciona la categoría al crear desde una categoría. */
  readonly categoria = input<string>();

  protected readonly categorias = inject(CategoriaService);
  private readonly temas = inject(TemaService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly router = inject(Router);
  private readonly raiz = inject(ElementRef).nativeElement as HTMLElement;

  protected readonly esEdicion = computed(() => !!this.id());
  protected readonly enviado = signal(false);
  protected readonly noPermitido = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).group({
    categoriaId: [null as number | null, [Validators.required]],
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150), noSoloEspacios]],
    contenido: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000), noSoloEspacios]],
  });

  ngOnInit(): void {
    if (this.esEdicion()) {
      const t = this.temas.porId(Number(this.id()));
      if (!t) return this.noPermitido.set('El tema no existe.');
      if (!this.temas.puedeEditar(t)) {
        return this.noPermitido.set(
          t.estado === 'BANEADO' ? 'El tema fue baneado por la moderación.' : 'Solo su autor puede editarlo.',
        );
      }
      this.form.setValue({ categoriaId: t.categoriaId, titulo: t.titulo, contenido: t.contenido });
    } else if (this.categoria()) {
      this.form.controls.categoriaId.setValue(Number(this.categoria()));
    }
  }

  protected clase(campo: 'categoriaId' | 'titulo' | 'contenido') {
    return claseCampo(this.form.controls[campo], this.enviado());
  }

  guardar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      enfocarPrimerError(this.form, this.raiz);
      return;
    }
    const v = this.form.getRawValue();
    const datos = { titulo: v.titulo!, contenido: v.contenido!, categoriaId: v.categoriaId! };
    const r = this.esEdicion() ? this.temas.editar(Number(this.id()), datos) : this.temas.publicar(datos);
    if (!r.ok) return this.notificaciones.error(r.mensaje);
    this.notificaciones.exito(this.esEdicion() ? 'Cambios guardados.' : 'Tema publicado.');
    this.router.navigate(['/temas', r.valor.id]);
  }
}
