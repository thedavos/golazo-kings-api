import { BaseError } from './error.common';

/**
 * Representa el resultado de una operación que puede tener éxito o fallar.
 * Contiene un valor de éxito de tipo T o un valor de error de tipo E.
 * Usa los métodos estáticos `Result.success(value)` o `Result.fail(error)` para crear instancias.
 * Verifica el estado usando las propiedades `isSuccess` o `isFail` antes de acceder a `value` o `error`.
 */
export class Result<T, E extends BaseError> {
  public readonly isSuccess: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  // Constructor privado para forzar el uso de los métodos estáticos (factorías)
  private constructor(isSuccess: boolean, value?: T, error?: E) {
    // Validación interna para asegurar la coherencia del estado
    if (isSuccess && error !== undefined) {
      throw new Error(
        'InvalidOperation: Un resultado exitoso no puede contener un error.',
      );
    }
    if (!isSuccess && value !== undefined) {
      throw new Error(
        'InvalidOperation: Un resultado fallido no puede contener un valor.',
      );
    }
    // Un resultado fallido DEBE tener un error
    if (!isSuccess && error === undefined) {
      throw new Error(
        'InvalidOperation: Un resultado fallido debe contener un error.',
      );
    }

    this.isSuccess = isSuccess;
    this._value = value;
    this._error = error;
  }

  /** Verifica si el resultado es un fallo. */
  public get isFail(): boolean {
    return !this.isSuccess;
  }

  /**
   * Obtiene el valor de éxito.
   * @throws {E} Lanza el error contenido (de tipo E) si el resultado es un fallo.
   */
  public get value(): T {
    if (!this.isSuccess) {
      // Lanza el error específico E contenido.
      // _error está garantizado que existe por la lógica del constructor.
      throw this._error!;
    }
    // _value está garantizado que existe aquí.
    return this._value!;
  }

  /**
   * Obtiene el valor del error.
   * @throws {Error} Lanza un error genérico si el resultado es exitoso (no debería accederse al error).
   */
  public get error(): E {
    if (this.isSuccess) {
      throw new Error('No se puede acceder al error de un resultado exitoso.');
    }
    // _error está garantizado que existe aquí.
    return this._error!;
  }

  /**
   * Crea una instancia de Result exitosa.
   * El parámetro de tipo E es necesario para la compatibilidad de tipos, aunque no se use directamente aquí.
   * @param value El valor de éxito.
   */
  public static success<T, E extends BaseError>(value: T): Result<T, E> {
    // Pasamos undefined para el argumento del error
    return new Result<T, E>(true, value, undefined);
  }

  /**
   * Crea una instancia de Result fallida.
   * Preserva el tipo específico del error E.
   * @param error El valor del error.
   */
  public static fail<T, E extends BaseError>(error: E): Result<T, E> {
    // Pasamos undefined para el argumento del valor
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Devuelve el valor de éxito contenido o lanza el error si es un fallo.
   * Idéntico a acceder al getter `value`.
   */
  public unwrap(): T {
    return this.value; // Reutiliza la lógica del getter
  }

  /**
   * Devuelve el valor de éxito contenido o un valor por defecto proporcionado si es un fallo.
   * @param defaultValue El valor a devolver si el resultado es un fallo.
   */
  public unwrapOr(defaultValue: T): T {
    return this.isSuccess ? this._value! : defaultValue;
  }

  /**
   * Devuelve el valor de éxito contenido o lo calcula a partir del error si es un fallo.
   * @param fn Una función que toma el error E y devuelve un valor de tipo T.
   */
  public unwrapOrElse(fn: (error: E) => T): T {
    return this.isSuccess ? this._value! : fn(this._error!);
  }

  /**
   * Mapea un `Result<T, E>` a `Result<U, E>` aplicando una función al valor de éxito contenido,
   * dejando el valor de error E intacto y preservando su tipo específico.
   * @param fn La función a aplicar al valor de éxito.
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    return this.isSuccess
      ? Result.success(fn(this._value!)) // Devuelve Result<U, E>
      : Result.fail<U, E>(this._error!); // Devuelve Result<U, E> preservando el error original
  }

  /**
   * Mapea un `Result<T, E>` a `Result<T, F>` aplicando una función al valor de error contenido E,
   * dejando el valor de éxito T intacto. Preserva T y el nuevo tipo de error F.
   * @param fn La función a aplicar al valor de error E.
   */
  public mapError<F extends BaseError>(fn: (error: E) => F): Result<T, F> {
    return this.isSuccess
      ? Result.success<T, F>(this._value!) // Devuelve Result<T, F> preservando el valor original
      : Result.fail(fn(this._error!)); // Devuelve Result<T, F> con el nuevo error F
  }

  /**
   * Llama a la función `fn` proporcionada si el resultado es exitoso, devolviendo el `Result` producido por `fn`.
   * Si el resultado es un fallo, devuelve el `Result` de fallo original, preservando el tipo de error E.
   * Útil para encadenar operaciones que devuelven `Result`. También conocido como `flatMap` o `bind`.
   * @param fn Una función que toma el valor de éxito T y devuelve un nuevo `Result<U, E>`.
   */
  public andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess
      ? fn(this._value!) // fn ya devuelve Result<U, E>
      : Result.fail<U, E>(this._error!); // Devuelve Result<U, E> preservando el error original
  }

  /**
   * Ejecuta una función de efecto secundario si el resultado es exitoso.
   * Devuelve la instancia original de Result.
   * @param fn Una función a ejecutar con el valor de éxito T.
   */
  public ifSuccess(fn: (value: T) => void): this {
    if (this.isSuccess) {
      fn(this._value!);
    }
    return this;
  }

  /**
   * Ejecuta una función de efecto secundario si el resultado es un fallo.
   * Devuelve la instancia original de Result.
   * @param fn Una función a ejecutar con el valor de error E.
   */
  public ifFail(fn: (error: E) => void): this {
    if (this.isFail) {
      fn(this._error!);
    }
    return this;
  }
}

// --- Funciones Auxiliares (Wrapper para los métodos estáticos - Corregidas) ---

/**
 * Función auxiliar para crear un Result exitoso.
 * @param value El valor de éxito.
 */
export const success = <T, E extends BaseError>(value: T): Result<T, E> =>
  Result.success(value);

/**
 * Función auxiliar para crear un Result fallido.
 * @param error El valor del error.
 */
export const fail = <T, E extends BaseError>(error: E): Result<T, E> =>
  Result.fail(error);
