import { TemaVista } from '../../models/modelos';
import { ESTRATEGIAS_ORDEN, EstrategiaOrden } from './estrategias-orden';

/**
 * PATRÓN STRATEGY — el CONTEXTO.
 *
 * Guarda la estrategia vigente y la aplica. Quien lo usa (TemaService) no
 * conoce los algoritmos de ordenamiento: solo pide "ordenar con la estrategia X".
 */
export class OrdenadorTemas {
  private estrategia: EstrategiaOrden;

  constructor(estrategiaInicial: EstrategiaOrden = ESTRATEGIAS_ORDEN[0]) {
    this.estrategia = estrategiaInicial;
  }

  /** Cambia la estrategia en tiempo de ejecución (ej: cuando el usuario elige otro orden). */
  usar(estrategia: EstrategiaOrden): this {
    this.estrategia = estrategia;
    return this;
  }

  /** Cambia la estrategia a partir de su id; si no existe, mantiene la actual. */
  usarPorId(id: string | null | undefined): this {
    const encontrada = ESTRATEGIAS_ORDEN.find((e) => e.id === id);
    if (encontrada) {
      this.estrategia = encontrada;
    }
    return this;
  }

  get estrategiaActual(): EstrategiaOrden {
    return this.estrategia;
  }

  ordenar(temas: readonly TemaVista[]): TemaVista[] {
    return this.estrategia.ordenar(temas);
  }
}
