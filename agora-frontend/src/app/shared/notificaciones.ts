import { Component, inject } from '@angular/core';

import { NotificacionService } from '../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  template: `
    <div class="notificaciones" aria-live="polite" aria-atomic="false">
      @for (m of servicio.mensajes(); track m.id) {
        <div class="notificacion" [class.notificacion-error]="m.tipo === 'error'" role="status">
          <i class="bi" [class.bi-check-circle-fill]="m.tipo === 'exito'" [class.bi-exclamation-octagon-fill]="m.tipo === 'error'" aria-hidden="true"></i>
          <span>{{ m.texto }}</span>
          <button type="button" class="btn-close btn-close-white ms-auto" (click)="servicio.cerrar(m.id)" aria-label="Cerrar mensaje"></button>
        </div>
      }
    </div>
  `,
})
export class Notificaciones {
  protected readonly servicio = inject(NotificacionService);
}
