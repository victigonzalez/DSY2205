import { TemaVista } from '../../models/modelos';

/**
 * PATRÓN DE DISEÑO STRATEGY — ordenamiento de temas.
 *
 * PROBLEMA: la lista de temas se puede ordenar de varias formas (recientes,
 * con más respuestas, alfabético, sin responder). Resolverlo con un gran
 * switch/if dentro del servicio o del componente mezcla responsabilidades y
 * obliga a modificar ese código cada vez que se agrega un criterio nuevo.
 *
 * SOLUCIÓN: cada criterio es una ESTRATEGIA independiente que implementa la
 * misma interfaz. El CONTEXTO (OrdenadorTemas) recibe la estrategia elegida
 * por el usuario y la aplica, sin saber cómo ordena cada una.
 * Agregar un criterio = crear una clase nueva y registrarla. Nada más cambia.
 */
export interface EstrategiaOrden {
  /** Identificador usado en la URL (?orden=populares). */
  readonly id: string;
  /** Texto que ve el usuario en el selector. */
  readonly etiqueta: string;
  /** Devuelve una NUEVA lista ordenada (no modifica la original). */
  ordenar(temas: readonly TemaVista[]): TemaVista[];
}

const porFechaDesc = (a: string, b: string) => b.localeCompare(a);

/** Estrategia 1: la actividad más reciente primero (nuevo tema o nuevo comentario). */
export class OrdenRecientes implements EstrategiaOrden {
  readonly id = 'recientes';
  readonly etiqueta = 'Actividad reciente';
  ordenar(temas: readonly TemaVista[]): TemaVista[] {
    return [...temas].sort((a, b) => porFechaDesc(a.ultimaActividad, b.ultimaActividad));
  }
}

/** Estrategia 2: los temas con más comentarios primero; empate → el más reciente. */
export class OrdenPopulares implements EstrategiaOrden {
  readonly id = 'populares';
  readonly etiqueta = 'Más comentados';
  ordenar(temas: readonly TemaVista[]): TemaVista[] {
    return [...temas].sort(
      (a, b) => b.cantidadComentarios - a.cantidadComentarios || porFechaDesc(a.fechaCreacion, b.fechaCreacion),
    );
  }
}

/** Estrategia 3: por título, de la A a la Z, respetando tildes y la ñ. */
export class OrdenAlfabetico implements EstrategiaOrden {
  readonly id = 'alfabetico';
  readonly etiqueta = 'Título (A-Z)';
  private readonly comparador = new Intl.Collator('es', { sensitivity: 'base', ignorePunctuation: true });
  ordenar(temas: readonly TemaVista[]): TemaVista[] {
    return [...temas].sort((a, b) => this.comparador.compare(a.titulo, b.titulo));
  }
}

/** Estrategia 4: primero los temas que nadie ha respondido, para que no queden olvidados. */
export class OrdenSinResponder implements EstrategiaOrden {
  readonly id = 'sin-responder';
  readonly etiqueta = 'Sin responder primero';
  ordenar(temas: readonly TemaVista[]): TemaVista[] {
    return [...temas].sort(
      (a, b) =>
        Number(a.cantidadComentarios > 0) - Number(b.cantidadComentarios > 0) ||
        porFechaDesc(a.fechaCreacion, b.fechaCreacion),
    );
  }
}

/** Catálogo de estrategias disponibles (alimenta el selector de la vista). */
export const ESTRATEGIAS_ORDEN: readonly EstrategiaOrden[] = [
  new OrdenRecientes(),
  new OrdenPopulares(),
  new OrdenAlfabetico(),
  new OrdenSinResponder(),
];
