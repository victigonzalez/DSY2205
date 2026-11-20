import { Component, OnChanges, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ESTRATEGIAS_ORDEN } from '../../patrones/orden-temas/estrategias-orden';
import { AuthService } from '../../services/auth.service';
import { CategoriaService } from '../../services/categoria.service';
import { TemaService } from '../../services/tema.service';
import { TemaItem } from '../../shared/tema-item';

/**
 * Búsqueda de temas (/temas) y temas de una categoría (/categorias/:slug).
 * Los filtros viven en la URL (?q=...&orden=...) para poder compartir la búsqueda.
 */
@Component({
  selector: 'app-temas',
  imports: [FormsModule, RouterLink, TemaItem],
  template: `
    @let cat = categoria();
    <section class="cabecera-listado" [style.--cat]="cat?.color">
      <div class="container-xl">
        @if (cat) {
          <nav aria-label="Ruta de navegación">
            <ol class="breadcrumb mb-2">
              <li class="breadcrumb-item"><a routerLink="/categorias">Categorías</a></li>
              <li class="breadcrumb-item active" aria-current="page">{{ cat.nombre }}</li>
            </ol>
          </nav>
          <h1><i class="bi {{ cat.icono }} me-2" aria-hidden="true"></i>{{ cat.nombre }}</h1>
          <p class="mb-0">{{ cat.descripcion }}</p>
        } @else if (slug()) {
          <h1>Categoría no encontrada</h1>
          <p class="mb-0">La categoría "{{ slug() }}" no existe. <a routerLink="/categorias">Ver todas las categorías</a>.</p>
        } @else {
          <h1>Temas</h1>
          <p class="mb-0">Busca por palabra clave, filtra por categoría y elige cómo ordenar.</p>
        }
      </div>
    </section>

    <section class="container-xl seccion">
      <form class="filtros row g-2 align-items-end" role="search" (ngSubmit)="aplicar()">
        <div class="col-12 col-md">
          <label for="filtro-texto" class="form-label">Palabra clave</label>
          <input id="filtro-texto" class="form-control" type="search" name="texto" [(ngModel)]="texto"
                 placeholder="Título o contenido" maxlength="80" />
        </div>
        @if (!slug()) {
          <div class="col-6 col-md-3">
            <label for="filtro-categoria" class="form-label">Categoría</label>
            <select id="filtro-categoria" class="form-select" name="categoria" [(ngModel)]="categoriaSel" (ngModelChange)="aplicar()">
              <option [ngValue]="null">Todas</option>
              @for (c of categorias.todas(); track c.id) {
                <option [ngValue]="c.id">{{ c.nombre }}</option>
              }
            </select>
          </div>
        }
        <div class="col-6 col-md-3">
          <label for="filtro-orden" class="form-label">Ordenar por</label>
          <select id="filtro-orden" class="form-select" name="orden" [(ngModel)]="ordenSel" (ngModelChange)="aplicar()">
            @for (e of estrategias; track e.id) {
              <option [value]="e.id">{{ e.etiqueta }}</option>
            }
          </select>
        </div>
        <div class="col-12 col-md-auto d-flex gap-2">
          <button class="btn btn-primary flex-fill" type="submit">Buscar</button>
          @if (hayFiltros()) {
            <button class="btn btn-outline-secondary flex-fill" type="button" (click)="limpiar()">Limpiar</button>
          }
        </div>
      </form>

      <div class="d-flex justify-content-between align-items-center my-3 flex-wrap gap-2">
        <p class="mb-0 text-body-secondary" aria-live="polite">
          {{ resultados().length }} {{ resultados().length === 1 ? 'tema encontrado' : 'temas encontrados' }}
          @if (q()) { para "{{ q() }}" }
        </p>
        @if (auth.autenticado()) {
          <a class="btn btn-acento btn-sm" routerLink="/temas/nuevo" [queryParams]="cat ? { categoria: cat.id } : {}">
            <i class="bi bi-plus-lg" aria-hidden="true"></i> Nuevo tema
          </a>
        }
      </div>

      <div class="lista-temas">
        @for (t of resultados(); track t.id) {
          <app-tema-item [tema]="t" [mostrarCategoria]="!cat" />
        } @empty {
          <div class="vacio">
            <i class="bi bi-chat-square-dots" aria-hidden="true"></i>
            <p>No hay temas que coincidan con tu búsqueda.</p>
            @if (auth.autenticado()) {
              <a class="btn btn-primary" routerLink="/temas/nuevo">Abre el primer tema</a>
            } @else {
              <button class="btn btn-outline-primary" type="button" (click)="limpiar()">Ver todos los temas</button>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class TemasPage implements OnChanges {
  // Parámetros de la URL (withComponentInputBinding)
  readonly slug = input<string>();
  readonly q = input<string>();
  readonly orden = input<string>();
  /** ?cat=3 → filtro por categoría en /temas */
  readonly categoriaParam = input<string>(undefined, { alias: 'cat' });
  readonly categoria = computed(() => (this.slug() ? this.categorias.porSlug(this.slug()!) : undefined));

  protected readonly auth = inject(AuthService);
  protected readonly categorias = inject(CategoriaService);
  private readonly temas = inject(TemaService);
  private readonly router = inject(Router);

  protected readonly estrategias = ESTRATEGIAS_ORDEN;

  // Estado del formulario, sincronizado con la URL
  protected texto = '';
  protected ordenSel = 'recientes';
  protected categoriaSel: number | null = null;

  protected readonly resultados = computed(() => {
    if (this.slug() && !this.categoria()) return [];
    return this.temas.buscar({
      texto: this.q(),
      categoriaId: this.categoria()?.id ?? (this.categoriaParam() ? Number(this.categoriaParam()) : null),
      orden: this.orden() ?? 'recientes',
    });
  });

  protected readonly hayFiltros = computed(
    () => !!this.q() || !!this.categoriaParam() || (this.orden() ?? 'recientes') !== 'recientes',
  );

  ngOnChanges(): void {
    this.texto = this.q() ?? '';
    this.ordenSel = this.orden() ?? 'recientes';
    this.categoriaSel = this.categoriaParam() ? Number(this.categoriaParam()) : null;
  }

  aplicar(): void {
    const texto = this.texto.trim();
    this.router.navigate([], {
      queryParams: {
        q: texto || null,
        orden: this.ordenSel !== 'recientes' ? this.ordenSel : null,
        cat: this.categoriaSel ?? null,
      },
    });
  }

  limpiar(): void {
    this.texto = '';
    this.ordenSel = 'recientes';
    this.categoriaSel = null;
    this.router.navigate([], { queryParams: {} });
  }
}
