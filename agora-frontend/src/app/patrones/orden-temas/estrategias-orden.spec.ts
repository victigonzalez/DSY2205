import { TemaVista } from '../../models/modelos';
import {
  ESTRATEGIAS_ORDEN,
  OrdenAlfabetico,
  OrdenPopulares,
  OrdenRecientes,
  OrdenSinResponder,
} from './estrategias-orden';
import { OrdenadorTemas } from './ordenador-temas';

/** Crea un tema mínimo para las pruebas. */
const tema = (id: number, titulo: string, fecha: string, comentarios: number, actividad = fecha): TemaVista => ({
  id, titulo, contenido: '', fechaCreacion: fecha, estado: 'ACTIVO', categoriaId: 1, autorId: 1,
  autor: undefined, categoria: undefined, cantidadComentarios: comentarios, ultimaActividad: actividad,
});

const TEMAS = [
  tema(1, 'Ñandúes en Chile', '2026-11-01T10:00:00', 2, '2026-11-10T10:00:00'),
  tema(2, '¿Árboles nativos?', '2026-11-05T10:00:00', 0),
  tema(3, 'Bandas de rock', '2026-11-03T10:00:00', 5),
  tema(4, 'Zapatillas', '2026-11-04T10:00:00', 0),
];
const ids = (lista: TemaVista[]) => lista.map((t) => t.id);

describe('Patrón Strategy: ordenamiento de temas', () => {
  it('OrdenRecientes usa la última actividad (un comentario nuevo sube el tema)', () => {
    expect(ids(new OrdenRecientes().ordenar(TEMAS))).toEqual([1, 2, 4, 3]);
  });

  it('OrdenPopulares pone primero los más comentados', () => {
    expect(ids(new OrdenPopulares().ordenar(TEMAS))).toEqual([3, 1, 2, 4]);
  });

  it('OrdenAlfabetico respeta tildes, ñ y signos de interrogación', () => {
    expect(ids(new OrdenAlfabetico().ordenar(TEMAS))).toEqual([2, 3, 1, 4]);
  });

  it('OrdenSinResponder pone primero los temas sin comentarios', () => {
    expect(ids(new OrdenSinResponder().ordenar(TEMAS))).toEqual([2, 4, 3, 1]);
  });

  it('las estrategias no modifican la lista original', () => {
    const copia = [...TEMAS];
    ESTRATEGIAS_ORDEN.forEach((e) => e.ordenar(TEMAS));
    expect(TEMAS).toEqual(copia);
  });

  it('el contexto OrdenadorTemas cambia de estrategia en tiempo de ejecución', () => {
    const ordenador = new OrdenadorTemas();
    expect(ordenador.estrategiaActual.id).toBe('recientes');
    expect(ids(ordenador.usarPorId('populares').ordenar(TEMAS))[0]).toBe(3);
    expect(ids(ordenador.usar(new OrdenAlfabetico()).ordenar(TEMAS))[0]).toBe(2);
  });

  it('un id de estrategia desconocido mantiene la estrategia actual', () => {
    expect(new OrdenadorTemas().usarPorId('no-existe').estrategiaActual.id).toBe('recientes');
  });
});
