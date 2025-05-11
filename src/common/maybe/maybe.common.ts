// import { some } from './some.common';
// import { none } from './none.common';

/**
 * Clase abstracta base para el patrón Maybe/Option.
 * Representa un valor que puede estar presente (Some) o ausente (None).
 * @template T El tipo del valor que puede estar presente.
 */
export abstract class Option<T> {
  protected constructor() {}

  /**
   * Indica si la instancia de Option contiene un valor (es un Some).
   */
  abstract isSome(): boolean;

  /**
   * Indica si la instancia de Option no contiene un valor (es un None).
   */
  abstract isNone(): boolean;

  /**
   * Aplica una función al valor si está presente (si es Some).
   * Si es Some<T>, retorna Some<U> con el resultado de la función.
   * Si es None, retorna None<U>.
   * @param fn La función a aplicar al valor.
   * @returns Un nuevo Option<U>.
   */
  abstract map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Aplica una función que retorna un Option a un valor si está presente (si es Some).
   * Si es Some<T>, retorna el resultado Option<U> de la función directamente ("aplana" un Option anidado).
   * Si es None, retorna None<U>. Útil para encadenar operaciones que pueden fallar.
   * @param fn La función a aplicar que retorna un Option.
   * @returns Un nuevo Option<U>.
   */
  abstract flatMap<U>(fn: (value: T) => Option<U>): Option<U>;

  /**
   * Si es Some, aplica un predicado al valor. Si el predicado retorna true, mantiene el Some.
   * Si el predicado retorna false, se convierte en None.
   * Si es None, sigue siendo None.
   * @param predicate La función que verifica el valor.
   * @returns Un nuevo Option<T>.
   */
  abstract filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Retorna el valor si está presente (si es Some).
   * Si es None, retorna el valor predeterminado proporcionado.
   * @param defaultValue El valor a retornar si es None. Puede ser de cualquier tipo U.
   * @returns El valor presente (de tipo T) o el valor predeterminado (de tipo U).
   */
  abstract getOrElse<U>(defaultValue: U): T | U;

  /**
   * Si es None, ejecuta la función `getDefault` y retorna el Option resultante.
   * Si es Some, retorna la propia instancia.
   * Útil para proporcionar un Option de respaldo si el actual está vacío, sin crear el Option de respaldo innecesariamente.
   * @param getDefault Función que retorna el Option alternativo si la instancia actual es None.
   * @returns La instancia actual si es Some, o el Option del resultado de `getDefault` si es None.
   */
  abstract orElseGet(getDefault: () => Option<T>): Option<T>;

  /**
   * Si es None, retorna el Option alternativo proporcionado.
   * Si es Some, retorna la propia instancia (ignora el alternativo).
   * Útil para proporcionar un valor de respaldo opcional.
   * @param alternative El Option a retornar si la instancia actual es None.
   * @returns La instancia actual si es Some, o el alternativo si es None.
   */
  abstract orElse(alternative: Option<T>): Option<T>;

  /**
   * Retorna el valor si está presente (si es Some).
   * Si es None, lanza un error.
   * Útil cuando estás seguro de que el valor debe estar presente, o para el final de una cadena.
   * @param errorMessage Mensaje de error opcional si es None.
   * @returns El valor presente de tipo T.
   * @throws Error si es None.
   */
  abstract unwrapOrThrow(errorMessage?: string): T;

  /**
   * Retorna el valor si está presente (si es Some).
   * Si es None, lanza un error de fábrica.
   * Útil cuando estás seguro de que el valor debe estar presente, o para el final de una cadena.
   * @param errorFactory Fábrica de errores personalizados.
   * @returns El valor presente de tipo T.
   * @throws Error si es None.
   */
  abstract getOrThrow<R extends Error>(errorFactory: () => R): T;

  /**
   * Convierte el Option a un tipo nullable de TypeScript (`T | null`).
   * @returns El valor presente si es Some, o `null` si es None.
   */
  abstract toNullable(): T | null;

  /**
   * Convierte el Option a un tipo undefinable de TypeScript (`T | undefined`).
   * @returns El valor presente si es Some, o `undefined` si es None.
   */
  abstract toUndefined(): T | undefined;

  /**
   * Ejecuta una función con el valor si está presente (si es Some).
   * No afecta el Option en sí (usado para efectos secundarios como loguear).
   * @param callback La función a ejecutar con el valor.
   */
  abstract ifSome(callback: (value: T) => void): void;

  /**
   * Ejecuta una función si el valor está ausente (si es None).
   * No afecta el Option en sí (usado para efectos secundarios como loguear).
   * @param callback La función a ejecutar.
   */
  abstract ifNone(callback: () => void): void;

  /**
   * Ejecuta una función con el valor si está presente (si es Some) y retorna la misma instancia de Option.
   * Útil para realizar efectos secundarios dentro de una cadena de operaciones.
   * @param callback La función a ejecutar con el valor.
   * @returns La instancia actual de Option.
   */
  abstract tap(callback: (value: T) => void): Option<T>;

  /**
   * Realiza pattern matching sobre el Option.
   * Ejecuta `onSome` si es Some, o `onNone` si es None.
   * @param onSome Función a ejecutar si es Some, recibe el valor.
   * @param onNone Función a ejecutar si es None.
   * @returns El resultado de la función ejecutada (onSome o onNone).
   */
  abstract match<R>(onSome: (value: T) => R, onNone: () => R): R;
}
