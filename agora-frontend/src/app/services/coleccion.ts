import { Signal, signal } from '@angular/core';

/**
 * Colección en memoria basada en un arreglo, compartida por los servicios.
 *
 * - Los datos viven en un ARREGLO de Angular (signal<T[]>): es la fuente de verdad.
 * - Los componentes que leen `items()` se actualizan solos cuando el arreglo cambia
 *   (los signals aplican el patrón Observer: el arreglo es el sujeto observado).
 * - Una copia se guarda en localStorage para que la demostración no se pierda
 *   al recargar la página. "Restablecer datos" vuelve al arreglo inicial.
 */
export class Coleccion<T extends { id: number }> {
  private readonly estado;
  readonly items: Signal<T[]>;

  constructor(
    private readonly clave: string,
    private readonly iniciales: T[],
  ) {
    this.estado = signal<T[]>(this.leer());
    this.items = this.estado.asReadonly();
  }

  buscar(id: number): T | undefined {
    return this.estado().find((x) => x.id === id);
  }

  /** Agrega un elemento asignándole el siguiente id disponible. */
  agregar(datos: Omit<T, 'id'>): T {
    const nuevo = { ...datos, id: this.siguienteId() } as T;
    this.guardar([...this.estado(), nuevo]);
    return nuevo;
  }

  /** Reemplaza el elemento con ese id aplicando los cambios. */
  actualizar(id: number, cambios: Partial<T>): T | undefined {
    let actualizado: T | undefined;
    this.guardar(
      this.estado().map((x) => {
        if (x.id !== id) return x;
        actualizado = { ...x, ...cambios, id };
        return actualizado;
      }),
    );
    return actualizado;
  }

  eliminarDonde(condicion: (x: T) => boolean): number {
    const antes = this.estado().length;
    this.guardar(this.estado().filter((x) => !condicion(x)));
    return antes - this.estado().length;
  }

  restablecer(): void {
    this.guardar(structuredClone(this.iniciales));
  }

  private siguienteId(): number {
    return this.estado().reduce((max, x) => Math.max(max, x.id), 0) + 1;
  }

  private guardar(lista: T[]): void {
    this.estado.set(lista);
    try {
      localStorage.setItem(this.clave, JSON.stringify(lista));
    } catch {
      /* almacenamiento no disponible (modo privado): los datos siguen en memoria */
    }
  }

  private leer(): T[] {
    try {
      const guardado = localStorage.getItem(this.clave);
      if (guardado) return JSON.parse(guardado) as T[];
    } catch {
      /* dato corrupto o almacenamiento bloqueado: se usan los datos iniciales */
    }
    return structuredClone(this.iniciales);
  }
}
