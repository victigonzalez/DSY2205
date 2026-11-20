import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { CategoriaService } from '../../services/categoria.service';
import { TemaService } from '../../services/tema.service';
import { TemaItem } from '../../shared/tema-item';

/** Portada: buscador, categorías y conversaciones recientes. */
@Component({
  selector: 'app-inicio',
  imports: [FormsModule, RouterLink, TemaItem],
  templateUrl: './inicio.html',
})
export class InicioPage {
  protected readonly auth = inject(AuthService);
  protected readonly categorias = inject(CategoriaService);
  private readonly temas = inject(TemaService);
  private readonly router = inject(Router);

  protected texto = '';

  /** Strategy "recientes" para la lista principal y "sin-responder" para la barra lateral. */
  protected readonly recientes = computed(() => this.temas.buscar({ orden: 'recientes' }).slice(0, 6));
  protected readonly sinResponder = computed(() =>
    this.temas.buscar({ orden: 'sin-responder' }).filter((t) => t.cantidadComentarios === 0).slice(0, 4),
  );
  protected readonly populares = computed(() => this.temas.buscar({ orden: 'populares' }).slice(0, 4));
  protected readonly totalTemas = computed(() => this.temas.visibles().length);

  buscar(): void {
    const q = this.texto.trim();
    this.router.navigate(['/temas'], { queryParams: q ? { q } : {} });
  }
}
