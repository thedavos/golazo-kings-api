import { Option } from './maybe.common';

class NoneImpl extends Option<never> {
  private static readonly _instance: NoneImpl = new NoneImpl();

  private constructor() {
    super();
    if (NoneImpl._instance) {
      throw new Error(
        'Cannot instantiate NoneImpl directly. Use NoneImpl.of() or none() factory function.',
      );
    }
  }

  static get instance(): NoneImpl {
    return NoneImpl._instance;
  }

  static of<T>(): Option<T> {
    return NoneImpl._instance as Option<T>;
  }

  isSome(): boolean {
    return false;
  }
  isNone(): boolean {
    return true;
  }

  map<U>(): Option<U> {
    // Mapear sobre None siempre resulta en un None (el tipo U es el tipo del resultado de la función)
    return none<U>();
  }

  flatMap<U>(): Option<U> {
    // Flat map sobre None siempre resulta en un None
    return none<U>();
  }

  // getOrElse en None siempre retorna el valor predeterminado proporcionado, cuyo tipo es U.
  getOrElse<U>(defaultValue: U): U {
    return defaultValue;
  }

  // orElse en None retorna el alternativo proporcionado
  orElse(alternative: Option<never>): Option<never>; // Sobrecarga específica
  orElse(alternative: Option<any>): Option<any> {
    return alternative as Option<unknown>;
  }

  // Implementación de orElseGet para None: ejecuta la función y retorna el Option resultante
  orElseGet(getDefault: () => Option<never>): Option<never>; // Sobrecarga específica
  orElseGet(getDefault: () => Option<any>): Option<any> {
    return getDefault() as Option<unknown>;
  }

  unwrapOrThrow(errorMessage?: string): never {
    const msg = errorMessage || 'Attempted to unwrap a None value.';
    throw new Error(msg);
  }

  getOrThrow<R extends Error>(errorFactory: () => R): never {
    throw errorFactory();
  }

  filter(): Option<never> {
    return none<never>();
  }

  // Implementación de toNullable para None: retorna null
  toNullable(): null {
    return null;
  }

  // Implementación de toUndefined para None: retorna undefined
  toUndefined(): undefined {
    return undefined;
  }

  // Implementación de ifSome para None: no hace nada
  ifSome(): void {
    // No-op
  }

  // Implementación de ifNone para None: ejecuta el callback
  ifNone(callback: () => void): void {
    callback();
  }

  // Implementación de tap para None: no hace nada y retorna la instancia (None)
  tap(): Option<never> {
    return this;
  }

  // Implementación de match para None: ejecuta onNone
  match<R>(_: any, onNone: () => R): R {
    return onNone();
  }
}

/**
 * Crea una instancia de None. Representa la ausencia de un valor.
 * @returns Una instancia de Option<T> (concretamente, el Singleton None).
 */
export const none = <T>(): Option<T> => NoneImpl.of<T>();
