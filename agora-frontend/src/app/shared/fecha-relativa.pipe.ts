import { Pipe, PipeTransform } from '@angular/core';

/** "hace 5 min", "hace 3 h", "ayer", "hace 4 días" o la fecha (12 nov 2026) si es más antigua. */
@Pipe({ name: 'fechaRelativa' })
export class FechaRelativaPipe implements PipeTransform {
  transform(iso: string | undefined | null): string {
    if (!iso) return '';
    const fecha = new Date(iso);
    const seg = Math.round((Date.now() - fecha.getTime()) / 1000);
    if (seg < 60) return 'recién';
    const min = Math.round(seg / 60);
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    const dias = Math.round(h / 24);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;
    return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
