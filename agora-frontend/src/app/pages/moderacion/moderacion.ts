import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ModeracionService } from '../../services/moderacion.service';
import { NotificacionService } from '../../services/notificacion.service';
import { TemaService } from '../../services/tema.service';
import { ErrorCampo } from '../../shared/error-campo';
import { FechaRelativaPipe } from '../../shared/fecha-relativa.pipe';
import { claseCampo } from '../../shared/formularios';
import { noSoloEspacios } from '../../validadores/validadores';

type Pestana = 'temas' | 'comentarios' | 'baneados';
type Objetivo = { tipo: 'tema' | 'comentario'; id: number; titulo: string };

/** Panel de moderación (ADMIN y MODERADOR): revisar, banear y restaurar contenido. */
@Component({
  selector: 'app-moderacion',
  imports: [NgClass, FormsModule, ReactiveFormsModule, RouterLink, ErrorCampo, FechaRelativaPipe],
  templateUrl: './moderacion.html',
})
export class ModeracionPage {
  protected readonly moderacion = inject(ModeracionService);
  private readonly temasService = inject(TemaService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly pestana = signal<Pestana>('temas');
  protected readonly filtro = signal('');

  protected readonly temas = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    return [...this.temasService.vistas()]
      .filter((t) => t.estado === 'ACTIVO')
      .filter((t) => !f || t.titulo.toLowerCase().includes(f) || t.autor?.username.includes(f))
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  });

  protected readonly comentarios = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    return this.moderacion
      .comentarios()
      .filter((c) => c.estado === 'ACTIVO')
      .filter((c) => !f || c.contenido.toLowerCase().includes(f) || c.autor?.username.includes(f));
  });

  protected readonly temasBaneados = computed(() => this.temasService.vistas().filter((t) => t.estado === 'BANEADO'));
  protected readonly comentariosBaneados = computed(() => this.moderacion.comentarios().filter((c) => c.estado === 'BANEADO'));

  protected readonly objetivo = signal<Objetivo | null>(null);
  protected readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(250), noSoloEspacios],
  });
  protected readonly motivosRapidos = ['Spam o publicidad', 'Lenguaje ofensivo', 'Fuera de tema', 'Contenido duplicado'];
  protected clase = claseCampo;

  abrir(o: Objetivo): void {
    this.motivo.reset();
    this.objetivo.set(o);
  }

  confirmar(): void {
    const o = this.objetivo();
    if (!o) return;
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }
    const r =
      o.tipo === 'tema'
        ? this.moderacion.banearTema(o.id, this.motivo.value)
        : this.moderacion.banearComentario(o.id, this.motivo.value);
    if (!r.ok) return this.notificaciones.error(r.mensaje);
    this.objetivo.set(null);
    this.notificaciones.exito(o.tipo === 'tema' ? 'Tema baneado.' : 'Comentario baneado.');
  }

  restaurarTema(id: number): void {
    const r = this.moderacion.desbanearTema(id);
    r.ok ? this.notificaciones.exito('Tema restaurado.') : this.notificaciones.error(r.mensaje);
  }

  restaurarComentario(id: number): void {
    const r = this.moderacion.desbanearComentario(id);
    r.ok ? this.notificaciones.exito('Comentario restaurado.') : this.notificaciones.error(r.mensaje);
  }
}
