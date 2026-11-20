import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ComentarioService, ComentarioVista } from '../../services/comentario.service';
import { ModeracionService } from '../../services/moderacion.service';
import { NotificacionService } from '../../services/notificacion.service';
import { TemaService } from '../../services/tema.service';
import { Avatar } from '../../shared/avatar';
import { ErrorCampo } from '../../shared/error-campo';
import { FechaRelativaPipe } from '../../shared/fecha-relativa.pipe';
import { claseCampo } from '../../shared/formularios';
import { noSoloEspacios } from '../../validadores/validadores';

type Objetivo = { tipo: 'tema' | 'comentario'; id: number };

/**
 * Detalle de un tema: la publicación y la conversación en burbujas.
 * Permite comentar, editar/eliminar lo propio y, a moderadores, banear.
 */
@Component({
  selector: 'app-tema-detalle',
  imports: [NgClass, NgTemplateOutlet, DatePipe, FormsModule, ReactiveFormsModule, RouterLink, Avatar, ErrorCampo, FechaRelativaPipe],
  templateUrl: './tema-detalle.html',
})
export class TemaDetallePage {
  readonly id = input.required<string>();

  protected readonly auth = inject(AuthService);
  protected readonly temas = inject(TemaService);
  protected readonly comentarios = inject(ComentarioService);
  private readonly moderacion = inject(ModeracionService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly tema = computed(() => this.temas.porId(Number(this.id())));
  /** Un tema baneado solo lo ven su autor y los moderadores (con el motivo). */
  protected readonly visible = computed(() => {
    const t = this.tema();
    if (!t) return false;
    return t.estado === 'ACTIVO' || this.auth.puedeModerar() || this.auth.usuarioActual()?.id === t.autorId;
  });
  protected readonly conversacion = computed<ComentarioVista[]>(() => {
    this.temas.vistas(); // se recalcula cuando cambian los datos
    return this.tema() ? this.comentarios.deTema(this.tema()!.id) : [];
  });

  // Nuevo comentario
  protected readonly nuevo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2000), noSoloEspacios],
  });
  protected readonly enviado = signal(false);

  // Edición de un comentario propio
  protected readonly editando = signal<number | null>(null);
  protected readonly edicion = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2000), noSoloEspacios],
  });

  // Baneo (moderadores)
  protected readonly baneando = signal<Objetivo | null>(null);
  protected readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(250), noSoloEspacios],
  });
  protected readonly motivosRapidos = ['Spam o publicidad', 'Lenguaje ofensivo', 'Fuera de tema', 'Contenido duplicado'];

  protected clase = claseCampo;

  comentar(): void {
    this.enviado.set(true);
    if (this.nuevo.invalid) {
      this.nuevo.markAsTouched();
      return;
    }
    const r = this.comentarios.comentar(this.tema()!.id, this.nuevo.value);
    if (!r.ok) {
      this.notificaciones.error(r.mensaje);
      return;
    }
    this.nuevo.reset();
    this.enviado.set(false);
    this.notificaciones.exito('Comentario publicado.');
  }

  editar(c: ComentarioVista): void {
    this.edicion.reset(c.contenido);
    this.editando.set(c.id);
  }

  guardarEdicion(id: number): void {
    if (this.edicion.invalid) {
      this.edicion.markAsTouched();
      return;
    }
    const r = this.comentarios.editar(id, this.edicion.value);
    if (!r.ok) return this.notificaciones.error(r.mensaje);
    this.editando.set(null);
    this.notificaciones.exito('Comentario editado.');
  }

  eliminarComentario(id: number): void {
    if (!confirm('¿Eliminar este comentario? Esta acción no se puede deshacer.')) return;
    const r = this.comentarios.eliminar(id);
    r.ok ? this.notificaciones.exito('Comentario eliminado.') : this.notificaciones.error(r.mensaje);
  }

  eliminarTema(): void {
    if (!confirm('¿Eliminar este tema y todos sus comentarios? Esta acción no se puede deshacer.')) return;
    const r = this.temas.eliminar(this.tema()!.id);
    if (!r.ok) return this.notificaciones.error(r.mensaje);
    this.notificaciones.exito('Tema eliminado.');
    this.router.navigate(['/temas']);
  }

  abrirBaneo(objetivo: Objetivo): void {
    this.motivo.reset();
    this.baneando.set(objetivo);
  }

  confirmarBaneo(): void {
    const o = this.baneando();
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
    this.baneando.set(null);
    this.notificaciones.exito(o.tipo === 'tema' ? 'Tema baneado.' : 'Comentario baneado.');
  }

  desbanearTema(): void {
    const r = this.moderacion.desbanearTema(this.tema()!.id);
    r.ok ? this.notificaciones.exito('Tema restaurado: vuelve a estar visible.') : this.notificaciones.error(r.mensaje);
  }
}
