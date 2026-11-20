import { Injectable, signal } from '@angular/core';

export interface Notificacion {
  id: number;
  tipo: 'exito' | 'error';
  texto: string;
}

/** Mensajes breves de confirmación o error que aparecen en una esquina de la pantalla. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private siguiente = 1;
  readonly mensajes = signal<Notificacion[]>([]);

  exito(texto: string): void {
    this.mostrar('exito', texto);
  }

  error(texto: string): void {
    this.mostrar('error', texto);
  }

  cerrar(id: number): void {
    this.mensajes.update((lista) => lista.filter((m) => m.id !== id));
  }

  private mostrar(tipo: Notificacion['tipo'], texto: string): void {
    const id = this.siguiente++;
    this.mensajes.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), tipo === 'error' ? 6000 : 3500);
  }
}
