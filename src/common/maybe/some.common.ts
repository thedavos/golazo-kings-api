import { Option } from './maybe.common';
import { none } from './none.common';

class SomeImpl<T> extends Option<T> {
  private readonly _value: T;

  private constructor(value: T) {
    super();
    this._value = value; // Almacena el valor
  }

  static of<T>(value: NonNullable<T>): Option<T> {
    if (value === null || value === undefined) {
      throw new Error(
        'SomeImpl.of received null or undefined. This should be handled by fromValue.',
      );
    }

    return new SomeImpl(value);
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  map<U>(fn: (value: T) => NonNullable<U>): Option<U> {
    // Aplica la función al valor y envuelve el resultado en un nuevo Some
    return some<U>(fn(this._value));
  }

  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    // Aplica la función al valor y retorna el Option resultante directamente
    return fn(this._value);
  }

  // getOrElse en Some retorna su propio valor, ignorando el valor predeterminado
  getOrElse(defaultValue: T): T; // Sobrecarga si el default es del mismo tipo T
  getOrElse<U>(defaultValue: U): T | U; // Sobrecarga general, pero siempre retornará T
  getOrElse(): T {
    return this._value;
  }

  // orElse en Some ignora el alternativo y se retorna a sí mismo
  orElse(): Option<T> {
    return this;
  }

  orElseGet(): Option<T> {
    return this;
  }

  unwrapOrThrow(): T {
    return this._value;
  }

  getOrThrow(): T {
    return this._value;
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    // Si el predicado es true, mantiene el Some. Si es false, se convierte en None.
    if (predicate(this._value)) {
      return this;
    } else {
      return none<T>();
    }
  }

  // Implementación de toNullable para Some: retorna el valor presente
  toNullable(): T | null {
    return this._value;
  }

  // Implementación de toUndefined para Some: retorna el valor presente
  toUndefined(): T | undefined {
    return this._value;
  }

  // Implementación de ifSome para Some: ejecuta el callback
  ifSome(callback: (value: T) => void): void {
    callback(this._value);
  }

  // Implementación de ifNone para Some: no hace nada
  ifNone(): void {
    // No-op
  }

  // Implementación de tap para Some: ejecuta el callback y retorna la instancia (Some)
  tap(callback: (value: T) => void): Option<T> {
    callback(this._value);
    return this;
  }

  // Implementación de match para Some: ejecuta onSome
  match<R>(onSome: (value: T) => R): R {
    return onSome(this._value);
  }
}

/**
 * Crea una instancia de Some con el valor proporcionado.
 * @param value El valor que está presente. Debe ser no nulo ni indefinido.
 * @returns Una instancia de Option<T> (concretamente, un Some<T>).
 */
export const some = <T>(value: NonNullable<T>): Option<T> => SomeImpl.of(value); // Delega la creación a la clase concreta
